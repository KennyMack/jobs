import Koa from 'koa';
import logger from 'koa-logger';
import Router from 'koa-router';
import mount from 'koa-mount';
import jwt from 'koa-jwt';
import { createHandler } from 'graphql-http/lib/use/koa';
import { schema } from '@gql/schema';
import { IncomingMessage } from 'http';
import { getJWTPrivateKey } from './environment';
import { AuthService } from './auth/auth.service';

const app = new Koa();
const routes = new Router();

app.use(logger());

app.use(async (ctx, next) => {
  console.log('ctx');
  ctx.state.user = {
    name: 'name',
    password: '123456'
  };

  await next();
});

app.use(jwt({ secret: getJWTPrivateKey(), passthrough: true }).unless({ path: [/^\/login/, /^\/graphql/] }));

const authService = new AuthService();

routes.all('/graphql', createHandler({
  schema: schema,
  context: async (ctx) => {
    console.log('ctx');

    const headers = ctx.headers as { authorization?: string };

    const user = await authService.tokenValid(headers.authorization || '');

    if (!user) {
      return {};
    }

    console.log(ctx.headers);
    console.log(ctx.url);
    console.log('authorization: ', headers);
    console.log('authOk', user);
    return {
      user
    };
  }
}));
/*
app.use(mount('/graphql', createHandler({
  schema: schema,
  context: async (ctx: IncomingMessage & { state: { user?: any } }) => {
    console.log('ctx');
    console.log(ctx.state);
    console.log(ctx.headers);
    console.log(ctx.url);
    return {};
  },
  parseRequestParams: (ctx) => {
    console.log('parseRequestParams');
    console.log(ctx.body);
    // console.log(ctx.state);
  }
})));*/


app.use(routes.routes());
app.use(routes.allowedMethods());

export default app;
