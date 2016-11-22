'use strict';

const app = require('.');
const sqlite3 = require('sqlite3')

let config = {db_file: 'db_staging.sqlite', host: '0.0.0.0', port: process.env.PORT || 5000}
if (process.env.DEPLOY_TYPE == "Production")
{
  console.error("WARNING: Using production credentials!");
  config.db_file = 'db_production.sqlite';
}

app(config, (error, server) => {
  if (error) throw error;

  console.error("running on port " + config.port);
});

