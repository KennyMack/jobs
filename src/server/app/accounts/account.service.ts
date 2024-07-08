import { BaseEntity } from "@app/base.entity";
import { BaseService } from "@app/base.service";
import { AccountEntity, Account } from '@accounts/account.entity';
import { UserEntity } from "@app/users/user.entity";

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
    })

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
    const session = await AccountEntity.startSession();
    session.startTransaction();
    try {
      const user = await UserEntity
        .findOne({ _id: userId })
        .session(session);

      if (!user) {
        session.abortTransaction();
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
        session.abortTransaction();
        this.addError('Account number already exists');
        return null;
      }

      if (!this.validate(accountCreate)) {
        session.abortTransaction();
        return null;
      }

      await accountCreate.save({ session });
      await session.commitTransaction();
      super.addSuccess('Success on create');
      return accountCreate;
    } catch (ex) {
      session.abortTransaction();
      console.error(ex);
      super.addError(`Failed on create: ${ex}`);

      return null;
    } finally {
      session.endSession();
    }
  }
}
