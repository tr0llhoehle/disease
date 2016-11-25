'use strict';

const express = require('express');
const sqlite = require('sqlite3');
const d3 = require('d3-queue');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const UpdateV1 = require('./routes/update_v1');
const UpdateV2 = require('./routes/update_v2');

const setup_db = require('./src/setup_db');

module.exports = (config, callback) => {
  let db = new sqlite.Database(config.db_file);
  let update_v1 = new UpdateV1(db);
  let update_v2 = new UpdateV2(db);
  let body_parser = bodyParser.json();

  let app = express();

  app.use(compression());
  app.use(cors({ maxAge: 3600e3, origin: '*' }));
  app.use((req, res, next) => {
    let now = new Date();
    console.log(now.toISOString() + ": " + req.originalUrl);
    next();
  });

  app.post('/update/v1/:uid', body_parser, update_v1.handle.bind(update_v1));
  app.post('/update/v2/:uid', body_parser, update_v2.handle.bind(update_v2));

  let q = d3.queue(1);
  q.defer(setup_db, db);

  q.awaitAll((error) => {
    if (error) return callback(error);

    let server = app.listen(config.port , config.host);
    server.on('close', () => {
      db.close();
    });

    return callback(null, server);
  });
};
