'use strict';

const state = require('../src/state');

const d3 = require('d3-queue');

class Debug {
  constructor(model) {
    this._model = model;
  }

  _validate(body, response) {
    if (!body) {
      response.error = "InvalidRequest";
      response.message = "Not a valid json message.";
      return false;
    }
    let keys =['lat', 'lon', 'timestamp', 'state'];
    for (let i = 0; i < keys.length; ++i) {
      if (body[keys[i]] === undefined) {
        response.error = "InvalidRequest";
        response.message = "`" + keys[i] + "` is not defined";
        return false;
      }
    }
    return true;
  }

  handle(req, res) {
    let response = {};
    if (!this._validate(req.body, response)) {
      res.status(400);
      res.json(response);
      return;
    }

    this._model.update_player(req.params.uid, req.body.lon, req.body.lat, req.body.timestamp, req.body.state, (err) => {
      if (err) {
        res.status(500);
        res.json({error: 'DebugError', message: err})
        return;
      }

      res.status(200);
      res.json(response);
    });
  }
};

module.exports = Debug;
