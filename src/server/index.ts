import dotenv from 'dotenv';
import http from 'http';
import { getDefaultPort } from './app/environment';
import app from './app/app';
import { databaseConnection } from './app/database/mongo.database';

async function main () {
  dotenv.config({ path: '.env' });
  const port = getDefaultPort();

  await databaseConnection();

  const server = http.createServer(app.callback());

  server.listen(port, () => {
    console.log(`Server is on-line on port: ${port}`);
  })
}

main();
