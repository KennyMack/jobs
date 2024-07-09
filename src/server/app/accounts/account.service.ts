import { BaseEntity } from "@app/base.entity";
import { BaseService } from "@app/base.service";
import { AccountEntity, Account } from '@accounts/account.entity';
import { UserEntity } from "@users/user.entity";

export class AccountService extends BaseService {
  constructor() {
    super(AccountEntity);
  }

  validate(transaction: Account): boolean {
    if (!transaction.userId) this.addError('UserId must be informed');
    if (!transaction.accountNumber) this.addError('Account number must be informed');
    if (!transaction.accountDigit) this.addError('Account digit must be informed');
    if (!transaction.bankCode) this.addError('Bank code must be informed');
    if (!transaction.bankName) this.addError('Bank name must be informed');

    return super.validateResult();
  }

  async getAccountByNumber(accountNumber: string, accountDigit: string): Promise<Account | null> {
    const found = await this.entity.find({
      accountNumber,
      accountDigit
    }).session(this.currentSession || null);

    return found?.length > 0 ? found[0] : null;
  }

  calculateAccountDigit(accountNumber: string): string {
    return (accountNumber
          .split('')
          .reduce(
            (acc, n, i) => acc + Math.abs(parseInt(n) * (7 - i)),
            0
          ) % 7).toString();
  }

  generateAccountNumber(bankCode: string): string {
    const baseCode = bankCode
      .padStart(3, '0')
      .split('')
      .map(x =>
        Math.abs(Math.floor(Math.sin(parseInt(x)) *
        Math.floor(Math.random() * 99))
        ).toString()
        .padStart(2, '0'))
      .join('');

    const lastDigit = baseCode
      .split('')
      .reduce(
        (acc, n, i) => acc + Math.abs(parseInt(n) * (3 - i)),
        0
      ) % 6;

    return `${baseCode}${lastDigit}`;
  }

  async createNewAccount(
    userId: string,
    bankCode: string,
    bankName: string
  ): Promise<BaseEntity | null> {
    super.resetState();
    super.startTransaction(AccountEntity);

    try {
      const user = await UserEntity
        .findOne({ _id: userId })
        .session(this.currentSession || null);

      if (!user) {
        await super.abortTransaction();
        this.addError('UserId is not valid');
        return null;
      }

      const accountCreate = new AccountEntity({
        version: 1,
        userId,
        bankCode,
        bankName,
        status: 'A',
        balance: 0,
        startDate: new Date(),
        endDate: null,
      });

      accountCreate.accountNumber = this.generateAccountNumber(bankCode);
      accountCreate.accountDigit = this.calculateAccountDigit(accountCreate.accountNumber);

      const existsTaxId = (await this.getAccountByNumber(
        accountCreate.accountNumber,
        accountCreate.accountDigit)) != null;

      if (existsTaxId) {
        await super.abortTransaction();
        this.addError('Account number already exists');
        return null;
      }

      if (!this.validate(accountCreate)) {
        await super.abortTransaction();
        return null;
      }

      await accountCreate.save({ session: this.currentSession });
      await super.commitTransaction();
      super.addSuccess('Success on create');
      return await this.getById(accountCreate._id.toString());
    } catch (ex) {
      await super.abortTransaction();
      console.error(ex);
      super.addError(`Failed on create: ${ex}`);

      return null;
    } finally {
      await super.endSession();
    }
  }

  async updateAccountBalance(account: Account) : Promise<boolean> {
    const result = await AccountEntity.updateOne({
      _id: account._id,
      version: account.version
    }, {
      $set: {
        balance: account.balance,
        version: ++account.version
      }
    }, {
      upsert: false,
    }).session(this.currentSession || null);

    return (result.modifiedCount || 0) > 0;
  }

  override async getAll(): Promise<BaseEntity[]> {
    return await AccountEntity.find({}).populate('userId');
  }

  override async getById(id: string): Promise<BaseEntity | null> {
    return await AccountEntity.findById(id).populate('userId');
  }
}
