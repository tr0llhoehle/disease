'use strict';

const turf = require('@turf/turf');

const PLAYER_RADIUS = 500; // meters
const PLAYER_TIMEOUT = 60*1000; // 60 seconds

class Update {
  constructor(db) {
    this._db = db;
  }

  _insert_locations(uid, records) {
    console.log("");
    // update historical location
    let location_values = records.map((r) => { return [uid, r.lon, r.lat, r.timestamp, r.accuracy, r.speed, r.bearing]; })
    let location_statement = this._db.prepare('INSERT INTO locations (uid, lon, lat, timestamp, accuracy, speed, bearing) VALUES (?, ?, ?, ?, ?, ?, ?)');
    location_values.map((v) => {
      location_statement.run(v, (error) => {
        if (!error) return;

        if (error.code === 'SQLITE_CONSTRAINT') {
          console.error("Error: " + error.message);
        } else {
          throw error;
        }
      });
    });
    location_statement.finalize();
  }

  _update_player(uid, lon, lat, timestamp) {
    // update current player location
    this._db.run('INSERT OR REPLACE INTO players (uid, timestamp, lon, lat) VALUES(?, ?, ?, ?)',
                 [uid, timestamp, lon, lat]);
  }

  _get_nearby_players(uid, lon, lat, callback) {
    let player_location = turf.point([lon, lat]);
    let circle_polygon = turf.circle(player_location, PLAYER_RADIUS / 1000., 10, 'kilometers');
    let bounding_box = turf.bbox(circle_polygon);
    let min_lon = bounding_box[0];
    let min_lat = bounding_box[1];
    let max_lon = bounding_box[2];
    let max_lat = bounding_box[3];
    let min_timestamp = +new Date() - PLAYER_TIMEOUT;

    this._db.all('SELECT uid, lon, lat, timestamp FROM players WHERE lat > ? AND lat < ? AND lon > ? AND lon < ? AND NOT uid = ? AND timestamp > ?',
                 [min_lat, max_lat, min_lon, max_lon, uid, min_timestamp],
                 (err, rows) => {
                   if (err) return callback(err);

                   let players_in_radius = rows.filter((r) => {
                     let other_location = turf.point([r.lon, r.lat]);
                     let distance = turf.distance(player_location, other_location, 'kilometers') * 1000.;
                     return distance <= PLAYER_RADIUS;
                   });
                   return callback(null, players_in_radius);
                 });
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
    if (body.records.length == 0) {
      response.error = "InvalidRequest";
      response.message = "`records` is empty";
      return false;
    }
    return true;
  }

  handle(req, res) {
    console.error(JSON.stringify(req.body));
    let response = {};
    if (!this._validate(req.body, response)) {
      res.status(400);
      res.json(response);
      return;
    }

    let last_record = req.body.records[req.body.records.length - 1];
    this._insert_locations(req.params.uid, req.body.records);
    this._update_player(req.params.uid, last_record.lon, last_record.lat, last_record.timestamp);
    this._get_nearby_players(req.params.uid, last_record.lon, last_record.lat, (err, players) => {
      if (err) {
        res.status(500);
        response.error = "UpdateError";
        response.message = err;
        res.json(response);
        return;
      }

      response.players = players;
      res.json(response);
    });
  }
};

module.exports = Update;
