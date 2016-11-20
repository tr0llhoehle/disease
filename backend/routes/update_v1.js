'use strict';

class Update {
  constructor(db) {
    this._db = db;
  }

  setup(callback) {
    db.run('CREATE TABLE IF NOT EXISTS locations (uid INTEGER, timestamp BIGINT, lon FLOAT, lat FLOAT) PRIMARY KEY (uid, timestamp)', callback);
  }

  insert(uid, records) {
    let statement = this._db.prepare(`INSERT INTO locations (uid, lon, lat, timestamp) VALUES (${uid}, ?, ?, ?)`);
    records.map(statement.run.bind(statement));
    statement.finalize();
  }

  handle(req, res) {
    this.insert(req.params.uid, req.body.update.records)

    let response = {};
    res.json(response);
  }
};

module.exports = Update;
