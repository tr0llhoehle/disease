'use strict';

const app = require('.');
const sqlite3 = require('sqlite3')

let config = {db_file: process.env.APP_DB || 'db_staging.sqlite', host: '0.0.0.0', port: process.env.PORT || 5000}

app(config, (error, server) => {
  if (error) throw error;

  console.error(`using ${config.db_file} and running on port ${config.port}`);
});

