'use strict';

const state = require('../src/state');

const d3 = require('d3-queue');

class Action {
  constructor(model) {
    this._model = model;
  }

  _validate(body, response) {
    if (!body) {
      response.error = "InvalidRequest";
      response.message = "Not a valid json message.";
      return false;
    }
    if (!body.code) {
      response.error = "InvalidRequest";
      response.message = "`code` is not defined";
      return false;
    }
    if (typeof body.code !== "string") {
      response.error = "InvalidRequest";
      response.message = "`code` is not a string";
      return false;
    }
    if (!body.timestamp) {
      response.error = "InvalidRequest";
      response.message = "`timestamp` is not defined";
      return false;
    }
    if (!Number.isInteger(body.timestamp) || body.timestamp < 0) {
      response.error = "InvalidRequest";
      response.message = "`timestamp` is not a positive integer";
      return false;
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

    this._model.get_player(req.params.uid, (err, player) => {
      if (err) {
        res.status(500);
        res.json({error: 'ActionError', message: err})
        return;
      }

      let result = state.action(player, req.body);
      this._model.update_player_state(req.params.uid, result.state, (err) => {
        if (err) {
          res.status(500);
          res.json({error: 'ActionError', message: err})
          return;
        }

        response.timestamp = req.body.timestamp;
        response.state = result.state;
        response.events = result.events;

        res.status(200);
        res.json(response);
      });
    });
  }
};

module.exports = Action;
