'use strict';

class Update {
  constructor(db) {
    this._db = db;
  }

  insert(uid, records) {
    let values = records.map((r) => { return [uid, r.lon, r.lat, r.timestamp, r.accuracy, r.speed, r.bearing]; })

    let statement = this._db.prepare(`INSERT INTO locations (uid, lon, lat, timestamp, accuracy, speed, bearing) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    values.map(statement.run.bind(statement));
    statement.finalize();
  }

  _validate(body, response) {
    if (!body) {
      response.error = "InvalidRequest";
      response.message = "Not a valid json message.";
      return false;
    }
    if (!Array.isArray(body.records)) {
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
      this.insert(req.params.uid, req.body.records)
    }

    res.json(response);
  }
};

module.exports = Update;
