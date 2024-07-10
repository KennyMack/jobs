import { GraphQLTypesName } from "@gql/graphql";
import { mutationWithClientMutationId } from "graphql-relay";
import { GraphQLString, GraphQLNonNull } from "graphql"
import { AuthService } from "@auth/auth.service";
import { ServiceState } from "@app/base.service";

type LoginDTO = {
  taxId: string,
  password: string
}

export const LoginGQLMutation = mutationWithClientMutationId({
  name: GraphQLTypesName.Login,
  description: 'Login user and generate a jwt token',
  inputFields: {
    taxId: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
  },

  mutateAndGetPayload: async ({ taxId, password }: LoginDTO) => {
    const serviceAuth = new AuthService();

    const result = await serviceAuth.login(taxId, password);

    if (serviceAuth.getCurrentState() == ServiceState.Invalid) throw new Error(
      serviceAuth.getMessages().join(', ')
    )

    return result;
  },

  outputFields: {
    token: {
      type: GraphQLString,
      resolve: (token) => token
    }
  }
})
