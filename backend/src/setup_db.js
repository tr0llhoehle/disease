'use strict';

function migrate_v0_v1(db, callback) {
  console.error("migrating from v0 to v1 schema...");
  db.exec('BEGIN;' +
          'ALTER TABLE locations ADD speed FLOAT;' +
          'ALTER TABLE locations ADD accuracy FLOAT;' +
          'ALTER TABLE locations ADD bearing FLOAT;' +
          'PRAGMA user_version = 1;' +
          'COMMIT;', callback);
}

function setup_v1(db, callback) {
  console.error("setting up schema v1...");
  db.exec('BEGIN;' +
         'CREATE TABLE locations (uid INTEGER, timestamp BIGINT, lon FLOAT, lat FLOAT, speed FLOAT, accuracy FLOAT, bearing FLOAT, PRIMARY KEY (uid, timestamp));' +
         'PRAGMA user_version = 1;' +
         'COMMIT;', (err) => {
           if (err) return callback(err);
           callback();
         });
}

function setup_v0(db, callback) {
  console.error("setting up schema v0...");
  db.exec('BEGIN;' +
         'CREATE TABLE locations (uid INTEGER, timestamp BIGINT, lon FLOAT, lat FLOAT, PRIMARY KEY (uid, timestamp))',
         'PRAGMA user_version = 0;' +
         'COMMIT;', callback);
}

function setup(db, callback) {
  db.serialize(() => {
    db.get('PRAGMA user_version', (err, result) => {
      if (err) return callback(err);

      if (result.user_version == 0) {
        db.get('SELECT * FROM sqlite_master WHERE name="locations" and type="table"', (err, result) => {
          if (err) return callback(err);

          if (result) {
            migrate_v0_v1(db, callback)
          } else {
            setup_v1(db, callback);
          }
        });
      } else {
        callback();
      }
    });
  });
}


module.exports = setup;