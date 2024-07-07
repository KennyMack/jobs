import Koa from 'koa';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import { graphqlHTTP } from 'koa-graphql';
import { schema } from './graph-ql/schema';

const app = new Koa();
const routes = new Router();

app.use(logger());
app.use(bodyParser({
  onerror(err: Error, ctx: Koa.Context) {
    ctx.throw(err, 422)
  },
}));

routes.all('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: {
    headerEditorEnabled: true,
    shouldPersistHeaders: true,
  },
  customFormatErrorFn: (error) => {
    return {
      message: error.message,
      locations: error.locations
    };
  }
}));

app.use(routes.routes());
app.use(routes.allowedMethods());

export default app;
