'use strict';

const turf = require('@turf/turf');
const d3 = require('d3-queue');

const player = require('./player');
const constants = require('./constants');

class GameModel {
  constructor(db) {
    this._db = db;
  }

  insert_locations(uid, records, callback) {
    // update historical location
    let location_values = records.map((r) => { return [uid, r.lon, r.lat, r.timestamp, r.accuracy, r.speed, r.bearing]; })
    let location_statement = this._db.prepare('INSERT INTO locations (uid, lon, lat, timestamp, accuracy, speed, bearing) VALUES (?, ?, ?, ?, ?, ?, ?)');

    let q = d3.queue();
    let statement_closure = location_statement.run.bind(location_statement);
    location_values.forEach((v) => {
      q.defer(statement_closure, v);
    });
    location_statement.finalize();

    q.awaitAll((error) => {
        if (!error) return callback();

        if (error.code === 'SQLITE_CONSTRAINT') {
          console.error("Error: " + error.message);
          return callback();
        } else {
          return callback(error);
        }
    });
  }

  update_player(uid, lon, lat, timestamp, callback) {
    // update current player location
    this._db.run('INSERT OR REPLACE INTO players (uid, timestamp, lon, lat) VALUES(?, ?, ?, ?)',
                 [uid, timestamp, lon, lat], callback);
  }

  get_nearby_players(uid, lon, lat, callback) {
    let player_location = turf.point([lon, lat]);
    let circle_polygon = turf.circle(player_location, constants.PLAYER_RADIUS / 1000., 10, 'kilometers');
    let bounding_box = turf.bbox(circle_polygon);
    let min_lon = bounding_box[0];
    let min_lat = bounding_box[1];
    let max_lon = bounding_box[2];
    let max_lat = bounding_box[3];
    let min_timestamp = +new Date() - constants.PLAYER_TIMEOUT;

    this._db.all('SELECT uid, lon, lat, timestamp, state FROM players WHERE lat > ? AND lat < ? AND lon > ? AND lon < ? AND NOT uid = ? AND timestamp > ?',
                 [min_lat, max_lat, min_lon, max_lon, uid, min_timestamp],
                 (err, rows) => {
                   if (err) return callback(err);

                   let players_in_radius = rows.filter((r) => {
                     let other_location = turf.point([r.lon, r.lat]);
                     let distance = turf.distance(player_location, other_location, 'kilometers') * 1000.;
                     return distance <= constants.PLAYER_RADIUS;
                   });
                   return callback(null, players_in_radius);
                 });
  }

  // TODO this needs to be split into model-controller parts
  update_player_state(uid, nearby, callback) {
    this._db.get('SELECT state FROM players WHERE uid = ?', [uid], ((err, result) => {
      if (err || !result) return callback(err);

      let ret = player.update(result.state, nearby);

      this._db.run('UPDATE player SET state = ? WHERE uid = ?', [ret.state, uid], (err) => {
        if (err) return callback(err);
        return callback(null, ret.events);
      });
    }).bind(this));
  }

  reset_daily_stats(callback) {
    /* noop no stats yet */
  }

  set_random_type(callback) {
    this._db.all('SELECT uid FROM players', [uid], ((err, result) => {
      let uids = result.map((row) => { return row.uid; });
      let new_states = [];

      for (let idx = 0; idx < uids.length; ++idx) {
        if (idx < uid.length/2) {
          new_states.push(constants.PLAYER_STATE_HUMAN);
        } else {
          new_states.push(constants.PLAYER_STATE_ZOMBIE);
        }
      }

      let update_statement = this._db.prepare('UPDATE player SET state = ? WHERE uid = ?');
      let update_closure = update_statement.run.bind(update_statement);

      let q = d3.queue();
      for (let idx = 0; idx < uids.length; ++idx) {
        q.defer(update_closure, [new_states[idx], uid[idx]]);
      }
      q.awaitAll(callback);
    }).bind(this));
  }

}

module.exports = GameModel;
