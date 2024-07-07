import { BaseEntity } from '../base.entity';
import { createDBModel, DBCollections } from '../database/mongo.database';

export interface Transaction extends BaseEntity {
  version: number,
  accountId: string,
  value: number,
  completed: boolean,
  finalizedAt?: Date
}

export const TransactionEntity = createDBModel<Transaction>(DBCollections.Transactions, {
  version: {
    type: Number,
    required: true,
    default: 1
  },
  accountId: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true,
    default: 0
  },
  completed: {
    type: Boolean,
    required: true,
    default: false,
  },
  finalizedAt: {
    type: Date,
    default: null
  }
});
