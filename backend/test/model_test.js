'use strict';

const test = require('tape');
const sqlite = require('sqlite3');

const app = require('../src/setup_db');

function setup_model(callback) {
  let db = new sqlite.Database(':memory:');
  setup_db(db, (error) => {
    if (error) return callback(error);
    let model = new GameModel(db);
    callback(null, model);
  });
}

setup_model((error, model) => {
  if (error) throw error;

  test('insert_location', (t) => {
    let model = new GameModel(db);
    model.insert_locations(100, [
      {lon: 5.1, lat: 54.000, timestamp: +new Date() - 2000, bearing: 100, accuracy: 5, speed: 10},
      {lon: 5.1, lat: 54.000, timestamp: +new Date() - 1000, bearing: 100, accuracy: 5, speed: 10},
      {lon: 5.1, lat: 54.000, timestamp: +new Date(), bearing: 100, accuracy: 5, speed: 10}
    ], (err) => {
      t.notOk(err);
      t.end();
    });
  });

  test('update_player', (t) => {
    let model = new GameModel(db);
    let q = d3.queue();
    q.defer(model.update_player, 100, 8.423166275024414, 49.01128867474003, +new Date());
    q.defer(model.update_player, 200, 8.42428207397461, 49.006151287073074, +new Date());
    q.defer(model.update_player, 300, 8.425333499908447, 49.012119052021625, +new Date());
    q.awaitAll((err) => {
      t.notOk(err);
      t.end();
    });
  });

  test('get_nearby_players', (t) => {
    let model = new GameModel(db);
    let q = d3.queue(1);
    q.defer(model.get_nearby_players, 100);
    q.defer(model.get_nearby_players, 200);
    q.defer(model.get_nearby_players, 300);
    q.awaitAll((err, results) => {
      t.notOk(err);
      t.equal(results.length, 3);
      t.equal(results[0].length, 1);
      t.equal(results[0][0].uid, 300);
      t.equal(results[1].length, 0);
      t.equal(results[2].length, 1);
      t.equal(results[2][0].uid, 100);
      t.end();
    });
  });

  test('teardown', (t) => {
    db.close();
    t.end();
  });
});

