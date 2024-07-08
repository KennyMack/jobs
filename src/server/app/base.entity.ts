import { Document, Types } from 'mongoose';

export interface BaseEntity extends Document {
  _id: Types.ObjectId
}
