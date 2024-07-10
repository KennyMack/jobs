import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFieldConfig
} from 'graphql';
import { checkAuthentication, GraphQLTypesName } from '@gql/graphql';
import { User } from '@users/user.entity';
import { UserService } from '@users/user.service';
import { ServiceState } from '@app/base.service';
import { mutationWithClientMutationId } from 'graphql-relay';

export const UserGQLType = new GraphQLObjectType<User>({
  name: GraphQLTypesName.User,
  fields: () => ({
    _id: {
      type: GraphQLString,
      resolve: (user) => user._id
    },
    fullName: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (user) => user.fullName
    },
    birthYear: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: (user) => user.birthYear
    },
    taxId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (user) => user.taxId
    }
  })
})

const UserGQLListType = new GraphQLList(UserGQLType)

export const FindByIdUserGQLType: GraphQLFieldConfig<
  object, object
> = {
  description: 'Get a user by id',
  type: UserGQLType,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (_, args, ctx) => {
    checkAuthentication(ctx, GraphQLTypesName.User);
    const service = new UserService();
    return await service.getById(args.id);
  }
}

export const FindAllUsersGQLType: GraphQLFieldConfig<
  object, object
> = {
  description: 'List all users',
  type: UserGQLListType,
  args: {
    limit: {
      type: GraphQLInt
    },
    skip: {
      type: GraphQLInt
    }
  },
  resolve: async (_, { limit, skip }, ctx) => {
    checkAuthentication(ctx, GraphQLTypesName.User);
    const service = new UserService();
    return await service.getAll();
  }
}

type CreateUserDTO = {
  fullName: string,
  taxId: string,
  birthYear: number,
  password: string,
  bankCode: string,
  bankName: string,
}

export const CreateUserGQLMutation = mutationWithClientMutationId({
  name: GraphQLTypesName.CreateUser,
  description: 'Create a new user and optionally a bank account.',
  inputFields: {
    fullName: { type: new GraphQLNonNull(GraphQLString) },
    taxId: { type: new GraphQLNonNull(GraphQLString) },
    birthYear: { type: new GraphQLNonNull(GraphQLInt) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    bankCode: { type: GraphQLString },
    bankName: { type: GraphQLString },
  },
  mutateAndGetPayload: async ({
    fullName,
    taxId,
    birthYear,
    password,
    bankCode,
    bankName
  }: CreateUserDTO, ctx) => {
    checkAuthentication(ctx, GraphQLTypesName.User);

    const service = new UserService();

    const result = await service.createNewUser(
      fullName,
      taxId,
      birthYear,
      password,
      bankCode,
      bankName
    );

    if (service.getCurrentState() == ServiceState.Invalid) throw new Error(
      service.getMessages().join(', ')
    )

    return result;
  },
  outputFields: {
    user: {
      type: UserGQLType,
      resolve: (user) => user
    }
  }
});
