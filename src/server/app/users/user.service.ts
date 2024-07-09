import { AccountService } from "@app/accounts/account.service";
import { BaseEntity } from "@app/base.entity";
import { BaseService, ServiceState } from "@app/base.service";
import { UserEntity, User } from '@users/user.entity';
import * as bcrypt from 'bcrypt';

export class UserService extends BaseService {
  constructor() {
    super(UserEntity);
  }

  validate(transaction: User): boolean {
    if (!transaction.taxId) this.addError('TaxId must be informed');
    if (!transaction.fullName) this.addError('Fullname must be informed');
    if (!transaction.password) this.addError('Password must be informed');
    if (transaction.birthYear <= 0) this.addError('Year of birth must be greater than zero');
    const currentDate = new Date();
    if ((currentDate.getFullYear() - transaction.birthYear) < 18) this.addError('Invalid year of birth');

    return super.validateResult();
  }

  async getByTaxId(taxId: string): Promise<User | null> {
    const found = await this.entity.find({
      taxId
    }).session(this.currentSession || null)

    return found?.length > 0 ? found[0] : null;
  }

  async createNewUser(
    fullName: string,
    taxId: string,
    birthYear: number,
    password: string,
    bankCode?: string,
    bankName?: string
  ): Promise<BaseEntity | null> {
    super.resetState();
    super.startTransaction(UserEntity);
    try {
      const userCreate = new UserEntity({
        fullName, taxId, birthYear, password
      });

      if (!this.validate(userCreate)) {
        await super.abortTransaction();
        return null;
      }

      const existsTaxId = (await this.getByTaxId(taxId)) != null;
      if (existsTaxId) {
        await super.abortTransaction();
        this.addError('TaxId already exists');
        return null;
      }

      userCreate.salt = await bcrypt.genSalt(10);
      userCreate.password = await bcrypt.hash(password, userCreate.salt);

      await userCreate.save({ session: this.currentSession });

      if (bankCode && bankName) {
        const serviceAccount = new AccountService();
        serviceAccount.setSession(this.currentSession!);

        await serviceAccount.createNewAccount(userCreate._id.toString(), bankCode, bankName);
        if (serviceAccount.getCurrentState() !== ServiceState.Valid) {
          await super.abortTransaction();
          this.messages = [
            ...serviceAccount.messages
          ];
          this.setCurrentState(serviceAccount.getCurrentState());
          return null;
        }
      }

      await super.commitTransaction();
      super.addSuccess('Success on create');
      return userCreate;
    } catch (ex) {
      await super.abortTransaction();
      console.error(ex);
      super.addError(`Failed on create: ${ex}`);

      return null;
    } finally {
      await super.endSession();
    }
  }
}
