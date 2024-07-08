import { BaseEntity } from "@app/base.entity";
import { BaseService, ServiceState } from "@app/base.service";
import { TransactionEntity, Transaction } from '@transactions/transaction.entity';

export class TransactionService extends BaseService {
  constructor() {
    super(TransactionEntity);
  }

  validate(transaction: Transaction): boolean {
    if (transaction.value <= 0) this.addError('Value must be greater than zero');

    if (!transaction.accountId) this.addError('Account must be informed');

    const currentState = this.getCurrentState();
    if (currentState != ServiceState.Invalid)
      this.setCurrentState(ServiceState.Valid);

    return this.getCurrentState() == ServiceState.Valid;
  }

  async createNewTransaction(value: number, accountId: string): Promise<BaseEntity | null> {
    super.resetState();
    const session = await TransactionEntity.startSession();
    session.startTransaction();
    try {
      const transactionCreate = new TransactionEntity({
        version: 1,
        accountId,
        value: value / 100,
        completed: false,
        finalizedAt: new Date()
      });

      if (!this.validate(transactionCreate)) {
        session.abortTransaction();
        return null;
      }

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

  override async getAll(): Promise<BaseEntity[]> {
    return await TransactionEntity.find({})
  }
}
