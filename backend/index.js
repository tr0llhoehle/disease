'use strict';

const express = require('express');
const sqlite = require('sqlite3');
const d3 = require('d3-queue');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const UpdateV1 = require('./routes/update_v1');

module.exports = (config, callback) => {
  let db = new sqlite.Database(config.db_file);
  let update_v1 = new UpdateV1(db);
  let body_parser = bodyParser.json();

  let app = express();

  app.use(compression());
  app.use(cors({ maxAge: 3600e3, origin: '*' }));

  app.param('uid', function (req, res, next, id) {
    if (parseInt(id) > 0) {
      next();
    }
    else {
      res.json({error: "invalid_uid", message: "uid " + id + " must be an integer bigger then 0"});
      res.sendStatus(403);
    }
  });

  app.post('/update/v1/:uid', body_parser, update_v1.handle.bind(update_v1));

  let q = d3.queue(1);
  q.defer(update_v1.setup.bind(update_v1));

  q.awaitAll((error) => {
    if (error) return callback(error);

    let server = app.listen(config.port , config.host);
    server.on('close', () => {
      db.close();
    });

    return callback(null, server);
  });
};
