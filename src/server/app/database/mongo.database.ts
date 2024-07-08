import mongoose, { Schema, Model } from 'mongoose';
import { getMongoDBURL } from '@app/environment';

const enum DBEvents {
  error = 'error',
  connected = 'connected',
  open = 'open',
  disconnected = 'disconnected',
  reconnected = 'reconnected',
  disconnecting = 'disconnecting',
  close = 'close',
}

export const enum DBCollections {
  Transactions = 'transactions',
  Accounts = 'accounts',
  Users = 'users'
}

export async function databaseConnection() {
  const databaseUrl = getMongoDBURL();

  mongoose.connection.on(DBEvents.open, () => {
    console.log("MongoDB connection open.");
  });
  mongoose.connection.on(DBEvents.close, () => {
    console.log("MongoDB connection close.");
  });
  mongoose.connection.on(DBEvents.disconnected, () => {
    console.log("MongoDB connection disconnected.");
  });
  mongoose.connection.on(DBEvents.connected, () => {
    console.log("MongoDB connection connected.");
  });
  mongoose.connection.on(DBEvents.error, (err) => {
    console.log("MongoDB connection error.", err);
  });

  await mongoose.connect(databaseUrl);
}

export function createDBModel<TModelType>(
  collectionName: DBCollections,
  schemaDefinition: object): Model<TModelType> {
  const schema = new Schema(schemaDefinition, {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  });

  return mongoose.model<TModelType>(
    collectionName,
    schema
  );
}
