import {
  GraphQLObjectType,
  GraphQLSchema
} from 'graphql';
import {
  FindAllTransactionsGQLType,
  FindByIdTransactionGQLType,
  CreateTransactionGQLMutation
} from '@transactions/transaction.graphql';
import {
  FindAllUsersGQLType,
  FindByIdUserGQLType,
  CreateUserGQLMutation
} from '@users/user.graphql';
import {
  FindAllAccountsGQLType,
  FindByIdAccountGQLType,
  CreateAccountGQLMutation
} from '@accounts/account.graphql';
import { LoginGQLMutation } from '@auth/auth.graphql';

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
      ...CreateTransactionGQLMutation
    },
    createUser: {
      ...CreateUserGQLMutation
    },
    createAccount: {
      ...CreateAccountGQLMutation
    },
    login: {
      ...LoginGQLMutation
    }
  }
})

export const schema = new GraphQLSchema({
  query: QueryGQLType,
  mutation: MutationGQLType
});
