import { Account } from '@accounts/account.entity';
import { BaseEntity } from '@app/base.entity';
import { User } from '@users/user.entity';
import { createDBModel, DBCollections } from '@database/mongo.database';
import { Types } from 'mongoose';

export interface Transaction extends BaseEntity {
  operationId: string,
  userId: User,
  senderId: Account,
  receiverId: Account,
  value: number,
  transactionDate: Date,
  hashData: string
}

export const TransactionEntity = createDBModel<Transaction>(DBCollections.Transactions, {
  operationId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Types.ObjectId,
    ref: DBCollections.Users,
    required: true
  },
  senderId: {
    type: Types.ObjectId,
    ref: DBCollections.Accounts,
    required: true
  },
  receiverId: {
    type: Types.ObjectId,
    ref: DBCollections.Accounts,
    required: true
  },
  value: {
    type: Number,
    required: true,
    default: 0
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  hashData: {
    type: String,
    required: true
  }
});
