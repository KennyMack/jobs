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
import { Account } from '@accounts/account.entity';
import { AccountService } from '@accounts/account.service';
import { ServiceState } from '@app/base.service';

export const AccountGQLType = new GraphQLObjectType<Account>({
  name: GraphQLTypesName.Account,
  fields: () => ({
    _id: {
      type: GraphQLString,
      resolve: (transaction) => transaction._id
    },
    version: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: (transaction) => transaction.version
    },
    userId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.userId
    },
    accountNumber: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.accountNumber
    },
    accountDigit: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.accountDigit
    },
    bankCode: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.bankCode
    },
    bankName: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.bankName
    },
    status: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.status
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
      resolve: (transaction) => transaction.balance
    },
    startDate: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.endDate
    },
    endDate: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.endDate
    }
  })
})

const AccountGQLListType = new GraphQLList(AccountGQLType)

export const FindByIdAccountGQLType: GraphQLFieldConfig<
  object, object
> = {
  description: 'Get an account by id',
  type: AccountGQLType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (_, args) => {
    const service = new AccountService();
    return await service.getById(args.id);
  }
}

export const FindAllAccountsGQLType: GraphQLFieldConfig<
  object, object
> = {
  description: 'List all accounts',
  type: AccountGQLListType,
  args: {
    limit: {
      type: GraphQLInt
    },
    skip: {
      type: GraphQLInt
    }
  },
  resolve: async (_, args) => {
    const service = new AccountService();
    return await service.getAll();
  }
}

type CreateAccountDTO = {
  userId: string,
  bankCode: string,
  bankName: string,
}

export const CreateAccountGQLType: GraphQLFieldConfig<
  any, any, any
> = {
  type: AccountGQLType,
  description: 'Create a new account',
  args: {
    userId: { type: new GraphQLNonNull(GraphQLString) },
    bankCode: { type: new GraphQLNonNull(GraphQLString) },
    bankName: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_, dto: CreateAccountDTO) => {
    const service = new AccountService();
    const result = await service.createNewAccount(
      dto.userId,
      dto.bankCode,
      dto.bankName
    );

    if (service.getCurrentState() == ServiceState.Invalid) throw new Error(
      service.getMessages().join(', ')
    )

    return result;
  }
}
