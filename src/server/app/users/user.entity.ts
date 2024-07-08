import { BaseEntity } from "@app/base.entity";
import { createDBModel, DBCollections } from "@database/mongo.database";

export interface User extends BaseEntity {
  fullName: string,
  taxId: string,
  birthYear: number,
  password: string,
  salt: string
}

export const UserEntity = createDBModel<User>(
  DBCollections.Users, {
    fullName: {
      type: String,
      required: true
    },
    taxId: {
      type: String,
      required: true,
      unique: true
    },
    birthYear: {
      type: Number,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    salt: {
      type: String,
      required: true
    }
});
