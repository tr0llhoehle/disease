'use strict';

const app = require('.');
const sqlite3 = require('sqlite3')

let config = {db_file: 'db_staging.sqlite', host: 'localhost', port: 5000}
if (process.env.DISEASE_PRODUCTION)
{
  config = {db_file: 'db_production.sqlite', host: '0.0.0.0', port: 80}
}

app(config, (server) => {
  console.error("running.");
});

