import { BaseEntity } from "@app/base.entity";
import { BaseService } from "@app/base.service";
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
    })

    return found?.length > 0 ? found[0] : null;
  }

  async createNewUser(fullName: string, taxId: string, birthYear: number, password: string): Promise<BaseEntity | null> {
    super.resetState();
    const session = await UserEntity.startSession();
    session.startTransaction();
    try {
      const transactionCreate = new UserEntity({
        fullName, taxId, birthYear, password
      });

      if (!this.validate(transactionCreate)) {
        session.abortTransaction();
        return null;
      }

      const existsTaxId = (await this.getByTaxId(taxId)) != null;
      if (existsTaxId) {
        session.abortTransaction();
        this.addError('TaxId already exists');
        return null;
      }

      transactionCreate.salt = await bcrypt.genSalt(10);
      transactionCreate.password = await bcrypt.hash(password, transactionCreate.salt);

      await transactionCreate.save({ session });
      await session.commitTransaction();
      super.addSuccess('Success on create');
      return transactionCreate;
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
