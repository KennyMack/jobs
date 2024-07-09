import { BaseEntity } from "@app/base.entity";
import { BaseService, ServiceState } from "@app/base.service";
import { generateNanoId, hashData } from "@utils/strings";
import { TransactionEntity, Transaction } from '@transactions/transaction.entity';
import { UserEntity } from "@users/user.entity";
import { Account, AccountEntity } from "@accounts/account.entity";
import { AccountService } from "@app/accounts/account.service";
import { DBCollections } from "@database/mongo.database";

type TransactionCreateType = {
  userId: string,
  senderNumberAccount: string,
  receiverNumberAccount: string,
  value: number
}

export class TransactionService extends BaseService {
  constructor() {
    super(TransactionEntity);
  }

  validate(transaction: TransactionCreateType): boolean {
    if (transaction.value <= 0) this.addError('Value must be greater than zero');
    if (!transaction.senderNumberAccount) this.addError('Sender must be informed');
    if (!transaction.receiverNumberAccount) this.addError('Receiver must be informed');
    if (!transaction.userId) this.addError('User must be informed');

    if (transaction.senderNumberAccount === transaction.receiverNumberAccount) this.addError('Sender account must be different of receiver account');

    return super.validateResult();
  }

  generateTransactionHash(transaction: Transaction): string {
    const dataToHash = `-operationId:${transaction.operationId}-userId:${transaction.userId._id}-senderId:${transaction.senderId._id}-receiverId:${transaction.receiverId._id}-transactionDate:${transaction.transactionDate.toISOString()}-value:${transaction.value}`;

    return hashData(dataToHash);
  }

  validateAccount(typeAccount: string, account: Account) {
    if (account.status !== 'A') this.addError(`${typeAccount} account is inactive`);
  }

  validateSenderBalance(account: Account, value: number) {
    if (account.balance < value) this.addError('Sender account does not have sufficient balance');
  }

  async createNewTransaction(
    accountData: TransactionCreateType
  ): Promise<BaseEntity | null> {
    super.resetState();
    await this.startTransaction(TransactionEntity);
    try {
      const transactionData: TransactionCreateType = {
        userId: accountData.userId,
        senderNumberAccount: accountData.senderNumberAccount,
        receiverNumberAccount: accountData.receiverNumberAccount,
        value: accountData.value
      }

      if (!this.validate(transactionData)) {
        await super.abortTransaction();
        return null;
      }

      const user = await UserEntity.findById(transactionData.userId);
      if (!user) {
        await this.abortTransaction();
        super.addError('User not found');
        return null;
      }

      let account = transactionData.senderNumberAccount.split('-');

      const senderAccount = await AccountEntity.findOne({
        accountNumber: account[0],
        accountDigit: account[1]
      });

      if (!senderAccount) {
        await this.abortTransaction();
        super.addError('Sender account not found');
        return null;
      }

      account = transactionData.receiverNumberAccount.split('-');

      const receiverAccount = await AccountEntity.findOne({
        accountNumber: account[0],
        accountDigit: account[1]
      });

      if (!receiverAccount) {
        await this.abortTransaction();
        super.addError('Receiver account not found');
        return null;
      }

      this.validateAccount('Sender', senderAccount);
      this.validateAccount('Receiver', receiverAccount);
      this.validateSenderBalance(senderAccount, transactionData.value);

      if (super.getCurrentState() !== ServiceState.Valid) {
        await super.abortTransaction();
        return null;
      }
      const transactionCreate = new TransactionEntity({
        userId: transactionData.userId,
        senderId: senderAccount,
        receiverId: receiverAccount,
        value: transactionData.value,
        transactionDate: new Date()
      });

      transactionCreate.senderId = senderAccount;
      transactionCreate.receiverId = receiverAccount;
      transactionCreate.operationId = generateNanoId();
      transactionCreate.hashData = this.generateTransactionHash(transactionCreate);

      senderAccount.balance -= transactionData.value;
      receiverAccount.balance += transactionData.value;

      const serviceAccount = new AccountService();
      serviceAccount.setSession(this.currentSession!);

      const senderChanged = await serviceAccount.updateAccountBalance(senderAccount);
      const receiverChanged = await serviceAccount.updateAccountBalance(receiverAccount);

      if (!senderChanged || !receiverChanged) {
        await this.abortTransaction();
        super.addError('Invalid account information, try again');
        return null;
      }

      await transactionCreate.save({ session: this.currentSession });
      await super.commitTransaction();
      super.addSuccess('Success on create');
      return transactionCreate;
    } catch (ex) {
      super.abortTransaction();
      console.error(ex);
      super.addError(`Failed on create: ${ex}`);

      return null;
    } finally {
      super.endSession();
    }
  }

  override async getAll(): Promise<BaseEntity[]> {
    return await TransactionEntity.find({})
      .populate('userId')
      .populate({
        path: 'senderId',
        populate: {
          path: 'userId',
          model: 'users'
        }
       })
      .populate({
        path: 'receiverId',
        populate: {
          path: 'userId',
          model: 'users'
        }
       })

  }

  override async getById(id: string): Promise<BaseEntity | null> {
    return await TransactionEntity.findById(id)
      .populate('userId')
      .populate({
        path: 'senderId',
        populate: {
          path: 'userId',
          model: 'users'
        }
       })
      .populate({
        path: 'receiverId',
        populate: {
          path: 'userId',
          model: 'users'
        }
       })
  }
}
/*
Project.find(query)
  .populate({
     path: 'pages',
     populate: {
       path: 'components',
       model: 'Component'
     }
  })
  .exec(function(err, docs) {});
*/
