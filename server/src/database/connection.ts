import knex from 'knex';
import path from 'path';

const connection = knex({
  client: 'sqlite',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite')
  }
});

export default connection;