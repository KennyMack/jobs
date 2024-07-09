import {
  GraphQLObjectType,
  GraphQLSchema
} from 'graphql';
import {
  FindAllTransactionsGQLType,
  FindByIdTransactionGQLType,
  CreateTransactionGQLType
} from '@transactions/transaction.graphql';
import {
  FindAllUsersGQLType,
  FindByIdUserGQLType,
  CreateUserGQLType
} from '@users/user.graphql';
import {
  FindAllAccountsGQLType,
  FindByIdAccountGQLType,
  CreateAccountGQLType
} from '@accounts/account.graphql';

const QueryGQLType = new GraphQLObjectType({
  name: 'Queries',
  description: 'All queries available',
  fields: {
    listTransactions: {
      ...FindAllTransactionsGQLType,
    },
    getTransactionById: {
      ...FindByIdTransactionGQLType
    },
    listUsers: {
      ...FindAllUsersGQLType,
    },
    getUserById: {
      ...FindByIdUserGQLType
    },
    listAccounts: {
      ...FindAllAccountsGQLType,
    },
    getAccountById: {
      ...FindByIdAccountGQLType
    }
  }
});

const MutationGQLType = new GraphQLObjectType({
  name: 'Mutations',
  description: 'Mutable operations available',
  fields: {
    createTransaction: {
      ...CreateTransactionGQLType
    },
    createUser: {
      ...CreateUserGQLType
    },
    createAccount: {
      ...CreateAccountGQLType
    }
  }
})

export const schema = new GraphQLSchema({
  query: QueryGQLType,
  mutation: MutationGQLType
});
