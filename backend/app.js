'use strict';

const app = require('.');
const sqlite3 = require('sqlite3')

let config = {db_file: process.env.APP_DB || 'db_staging.sqlite', host: '0.0.0.0', port: process.env.PORT || 5000, crt: process.env.APP_CERT, key: process.env.APP_KEY}

app(config, (error, http_server, https_server) => {
  if (error) throw error;

  console.error(`http: using ${config.db_file} and running on port ${config.port}`);
  if (https_server) {
    console.error(`https: using ${config.key} and ${config.crt} and running on port ${config.port+1}`);
  }
});

