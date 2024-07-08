import Koa from 'koa';
import logger from 'koa-logger';
import Router from 'koa-router';
import mount from 'koa-mount';
import { createHandler } from 'graphql-http/lib/use/koa';
import { schema } from '@gql/schema';

const app = new Koa();
const routes = new Router();

app.use(logger());

app.use(mount('/graphql', createHandler({
  schema: schema
})));

app.use(routes.routes());
app.use(routes.allowedMethods());

export default app;
