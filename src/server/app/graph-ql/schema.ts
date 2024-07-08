import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLSchema
} from 'graphql';
import { FindAllTransactionsGQLType,
  FindByIdTransactionGQLType,
  CreateTransactionGQLType
} from '@transactions/transaction.graphql';

const QueryGQLType = new GraphQLObjectType({
  name: 'Queries',
  description: 'All queries available',
  fields: {
    listTransactions: {
      ...FindAllTransactionsGQLType,
    },
    getTransactionById: {
      ...FindByIdTransactionGQLType
    }
  }
});

const MutationGQLType = new GraphQLObjectType({
  name: 'Mutations',
  description: 'Mutable operations available',
  fields: {
    createTransaction: {
      ...CreateTransactionGQLType
    }
  }
})

export const schema = new GraphQLSchema({
  query: QueryGQLType,
  mutation: MutationGQLType
});
