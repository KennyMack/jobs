export const enum GraphQLTypesName {
  Transaction = 'Transaction',
  User = 'User',
  Account = 'Account',
  CreateTransaction = 'CreateTransaction',
  CreateAccount = 'CreateAccount',
  CreateUser = 'CreateUser',
  Login = 'Login'
}

export function checkAuthentication(ctx: { user?: object }, operation: GraphQLTypesName) {
  if (operation === GraphQLTypesName.Login ||
    operation === GraphQLTypesName.CreateUser) return;

  if (!ctx.user){
    throw new Error('Unauthorized');
  }
}
