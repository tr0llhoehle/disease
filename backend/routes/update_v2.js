'use strict';

const state = require('../src/state');

const d3 = require('d3-queue');

class Update {
  constructor(model) {
    this._model = model;
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

    let q = d3.queue(1);
    q.defer(this._model.insert_locations.bind(this._model), req.params.uid, req.body.records);
    q.defer(this._model.update_player.bind(this._model), req.params.uid, last_record.lon, last_record.lat, last_record.timestamp, null);
    q.defer(this._model.get_player.bind(this._model), req.params.uid);
    q.defer(this._model.get_nearby_players.bind(this._model), req.params.uid, last_record.lon, last_record.lat);
    q.awaitAll(((err, results) => {
      if (err) {
        res.status(500);
        res.json({error: "UpdateError", message: err});
        return;
      }
      let current_player = results.slice(-2, -1)[0];
      let players = results.slice(-1)[0];

      let ret = state.update(current_player, players);

      response.players = players;
      response.events = ret.events;
      this._model.update_player_state(req.param.uid, ret.state, (err) => {
        if (err) {
          res.json({error: "UpdateError", message: err});
          res.status(500);
        } else {
          res.json(response);
        }
      });
    }).bind(this));
  }
};

module.exports = Update;
