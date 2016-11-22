'use strict';

class Update {
  constructor(db) {
    this._db = db;
  }

  setup(callback) {
    this._db.run('CREATE TABLE IF NOT EXISTS locations (uid INTEGER, timestamp BIGINT, lon FLOAT, lat FLOAT, PRIMARY KEY (uid, timestamp))', callback);
  }

  insert(uid, records) {
    let statement = this._db.prepare(`INSERT INTO locations (uid, lon, lat, timestamp) VALUES (${uid}, ?, ?, ?)`);
    records.map(statement.run.bind(statement));
    statement.finalize();
  }

  _validate(body, response) {
    if (!body) {
      response.error = "InvalidRequest";
      response.message = "Not a valid json message.";
      return false;
    }
    if (!body.update) {
      response.error = "InvalidRequest";
      response.message = "No update property";
      return false;
    }
    if (!Array.isArray(body.update.records)) {
      response.error = "InvalidRequest";
      response.message = "`records` is not an array";
      return false;
    }
    return true;
  }

  handle(req, res) {
    let response = {};
    if (!this._validate(req.body, response)) {
      res.status(400);
    } else {
      this.insert(req.params.uid, req.body.update.records)
    }

    res.json(response);
  }
};

module.exports = Update;
