import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLFieldConfig
} from 'graphql';
import { GraphQLTypesName } from '@gql/graphql';
import { Transaction } from '@transactions/transaction.entity';
import { TransactionService } from '@transactions/transaction.service';
import { ServiceState } from '@app/base.service';
import { UserGQLType } from '@users/user.graphql';
import { AccountGQLType } from '@accounts/account.graphql';
import { mutationWithClientMutationId } from 'graphql-relay';

export const TransactionGQLType = new GraphQLObjectType<Transaction>({
  name: GraphQLTypesName.Transaction,
  fields: () => ({
    _id: {
      type: GraphQLString,
      resolve: (transaction) => transaction._id
    },
    operationId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.operationId
    },
    userId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.userId._id
    },
    user: {
      type: UserGQLType,
      resolve: (transaction: Transaction) => {
        return transaction.userId;
      }
    },
    senderId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.senderId._id
    },
    senderAccount: {
      type: AccountGQLType,
      resolve: (transaction: Transaction) => {
        return transaction.senderId;
      }
    },
    receiverId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.receiverId._id
    },
    receiverAccount: {
      type: AccountGQLType,
      resolve: (transaction: Transaction) => {
        return transaction.receiverId;
      }
    },
    value: {
      type: new GraphQLNonNull(GraphQLFloat),
      resolve: (transaction) => transaction.value
    },
    transactionDate: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.transactionDate
    },
    hashData: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.hashData
    }
  })
})

const TransactionGQLListType = new GraphQLList(TransactionGQLType)

export const FindByIdTransactionGQLType: GraphQLFieldConfig<
  object, object
> = {
  description: 'Get a transaction by id',
  type: TransactionGQLType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (_, args) => {
    const service = new TransactionService();
    return  await service.getById(args.id);
  }
}

export const FindAllTransactionsGQLType: GraphQLFieldConfig<
  object, object
> = {
  description: 'List all transactions',
  type: TransactionGQLListType,
  args: {
    limit: {
      type: GraphQLInt
    },
    skip: {
      type: GraphQLInt
    }
  },
  resolve: async (_, args) => {
    console.log(args.limit, args.skip);
    const service = new TransactionService();
    return await service.getAll();
  }
}

type CreateTransactionDTO = {
  userId: string,
  senderNumberAccount: string,
  receiverNumberAccount: string,
  value: number
}

export const CreateTransactionGQLMutation = mutationWithClientMutationId({
  name: GraphQLTypesName.CreateTransaction,
  description: 'Creates a new transaction',
  inputFields: {
    userId: { type: new GraphQLNonNull(GraphQLString) },
    senderNumberAccount: { type: new GraphQLNonNull(GraphQLString) },
    receiverNumberAccount: { type: new GraphQLNonNull(GraphQLString) },
    value: { type: new GraphQLNonNull(GraphQLInt) }
  },

  mutateAndGetPayload: async ({
    userId, senderNumberAccount,
    receiverNumberAccount, value
  }: CreateTransactionDTO) => {
    const service = new TransactionService();
    const result = await service.createNewTransaction({
      userId, senderNumberAccount,
      receiverNumberAccount, value
    });

    if (service.getCurrentState() == ServiceState.Invalid) throw new Error(
      service.getMessages().join(', ')
    )

    return result;
  },

  outputFields: {
    transaction: {
      type: TransactionGQLType,
      resolve: (transaction) => transaction
    }
  }
});
