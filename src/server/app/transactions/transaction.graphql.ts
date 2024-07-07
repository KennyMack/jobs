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
import { GraphQLTypesName } from '../graph-ql/graphql';
import { Transaction } from './transaction.entity';
import { TransactionService } from './transaction.service';
import { ServiceState } from '../base.service';

export const TransactionGQLType = new GraphQLObjectType<Transaction>({
  name: GraphQLTypesName.Transaction,
  fields: () => ({
    _id: {
      type: GraphQLString,
      resolve: (transaction) => transaction._id
    },
    version: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: (transaction) => transaction.version
    },
    accountId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.accountId
    },
    value: {
      type: new GraphQLNonNull(GraphQLFloat),
      resolve: (transaction) => transaction.value
    },
    completed: {
      type: GraphQLInt,
      resolve: (transaction) => transaction.completed ? 1 : 0
    },
    finalizedAt: {
      type: GraphQLString,
      resolve: (transaction) => transaction.finalizedAt
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
    return await service.getById(args.id);
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
  value: number,
  accountId: string
}

export const CreateTransactionGQLType: GraphQLFieldConfig<
  any, any, any
> = {
  type: TransactionGQLType,
  args: {
    value: { type: new GraphQLNonNull(GraphQLFloat) },
    accountId: { type: new GraphQLNonNull(GraphQLID) }
  },
  resolve: async (_, dto: CreateTransactionDTO) => {
    const service = new TransactionService();
    const result = await service.createNewTransaction(dto.value, dto.accountId);

    if (service.getCurrentState() == ServiceState.Invalid) throw new Error(
      service.getMessages().join(', ')
    )

    return result;
  }
}
