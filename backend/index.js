'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const sqlite = require('sqlite3');
const d3 = require('d3-queue');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const UpdateV1 = require('./routes/update_v1');
const UpdateV2 = require('./routes/update_v2');
const ActionV1 = require('./routes/action_v1');
const DebugV1 = require('./routes/debug_v1');

const setup_db = require('./src/setup_db');
const schedule_jobs = require('./src/schedule_jobs');
const GameModel = require('./src/model');

module.exports = (config, callback) => {
  let db = new sqlite.Database(config.db_file);
  let model = new GameModel(db);
  let update_v1 = new UpdateV1(db);
  let update_v2 = new UpdateV2(model);
  let action_v1 = new ActionV1(model);
  let debug_v1 = new DebugV1(model);
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
  app.post('/action/v1/:uid', body_parser, action_v1.handle.bind(action_v1));
  if (config.debug) {
    app.post('/debug/v1/:uid', body_parser, debug_v1.handle.bind(debug_v1));
  }

  let q = d3.queue(1);
  q.defer(setup_db, db);

  q.awaitAll((error) => {
    if (error) return callback(error);

    let jobs = schedule_jobs(db);

    let http_server = http.createServer(app);
    http_server.on('close', () => {
      db.close();
    });
    http_server.listen(config.port , config.host);

    let https_server = null;
    if (config.key && config.crt) {
      var privateKey  = fs.readFileSync(config.key, 'utf8');
      var certificate = fs.readFileSync(config.crt, 'utf8');
      https_server = https.createServer({key: privateKey, cert: certificate}, app);
      https_server.listen(config.port+1, config.host);
    }
    return callback(null, http_server, https_server, jobs);
  });
};
