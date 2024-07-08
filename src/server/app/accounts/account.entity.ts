import { BaseEntity } from "@app/base.entity";
import { createDBModel, DBCollections } from "@database/mongo.database";
import { Types } from "mongoose";

export interface Account extends BaseEntity {
  version: number,
  userId: Types.ObjectId,
  accountNumber: string,
  accountDigit: string,
  bankCode: string,
  bankName: string,
  status: string,
  balance: number,
  startDate: Date,
  endDate?: Date
}

export const AccountEntity = createDBModel<Account>(
  DBCollections.Accounts, {
    version: {
      type: Number,
      required: true,
      default: 1
    },
    userId: {
      type: Types.ObjectId,
      ref: DBCollections.Users,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    accountDigit: {
      type: String,
      required: true,
    },
    bankCode: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'A'
    },
    balance: {
      type: Number,
      required: true,
      default: 0
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date
    },
});
