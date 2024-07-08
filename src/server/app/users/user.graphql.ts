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
import { User } from '@users/user.entity';
import { UserService } from '@users/user.service';
import { ServiceState } from '@app/base.service';

export const UserGQLType = new GraphQLObjectType<User>({
  name: GraphQLTypesName.User,
  fields: () => ({
    _id: {
      type: GraphQLString,
      resolve: (transaction) => transaction._id
    },
    fullName: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.fullName
    },
    birthYear: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: (transaction) => transaction.birthYear
    },
    taxId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (transaction) => transaction.taxId
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
  resolve: async (_, args) => {
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
  resolve: async (_, args) => {
    const service = new UserService();
    return await service.getAll();
  }
}

type CreateUserDTO = {
  fullName: string,
  taxId: string,
  birthYear: number,
  password: string
}

export const CreateUserGQLType: GraphQLFieldConfig<
  any, any, any
> = {
  type: UserGQLType,
  description: 'Create a new user',
  args: {
    fullName: { type: new GraphQLNonNull(GraphQLString) },
    taxId: { type: new GraphQLNonNull(GraphQLString) },
    birthYear: { type: new GraphQLNonNull(GraphQLInt) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_, dto: CreateUserDTO) => {
    const service = new UserService();

    const result = await service.createNewUser(
      dto.fullName,
      dto.taxId,
      dto.birthYear,
      dto.password
    );

    if (service.getCurrentState() == ServiceState.Invalid) throw new Error(
      service.getMessages().join(', ')
    )

    return result;
  }
}
