'use strict';

const test = require('tape');
const app = require('..');
const request = require('request');

const state = require('../src/state');
const constants = require('../src/constants');

const config = {db_file: ':memory:', host: 'localhost', port: 5000, debug: true};
const url = `http://${config.host}:${config.port}/action/v1`;
const debug_url = `http://${config.host}:${config.port}/debug/v1`;

app(config, (error, http_server, https_server, jobs) => {
  if (error) throw error;

  test('setup state', (t) => {
    request.post(debug_url + '/1', {json: {lon: 5.1, lat: 54.0, timestamp: +new Date(), state: constants.PLAYER_STATE_HUMAN}}, (err, response, body) => {
      t.equal(err, null);
      t.equal(response.statusCode, 200);
      t.equal(body.error, undefined);
      t.equal(body.message, undefined);
      request.post(debug_url + '/2', {json: {lon: 5.1, lat: 54.0, timestamp: +new Date(), state: constants.PLAYER_STATE_ZOMBIE}}, (err, response, body) => {
        t.equal(err, null);
        t.equal(response.statusCode, 200);
        t.equal(body.error, undefined);
        t.equal(body.message, undefined);
        t.end();
      });
    });
  });

  test('send attack action', (t) => {
    let query = {
      code: 'ACTION_START_ATTACKING',
      timestamp: +new Date()
    };
    let uid = 1;
    request.post(url + '/' + uid, { json: query }, (error, response, body) => {
      t.notOk(error);
      t.equal(response.statusCode, 200);
      t.notOk(body.error);
      t.notOk(body.message);
      t.equal(body.timestamp, query.timestamp);
      t.ok(state.has(body.state, constants.PLAYER_STATE_HUMAN_ATTACKING));

      let query_2 = {
        code: 'ACTION_STOP_ATTACKING',
        timestamp: +new Date()
      };
      request.post(url + '/' + uid, { json: query_2 }, (error, response, body) => {
        t.notOk(error);
        t.equal(response.statusCode, 200);
        t.notOk(body.error);
        t.notOk(body.message);
        t.equal(body.timestamp, query_2.timestamp);
        t.ok(!state.has(body.state, constants.PLAYER_STATE_HUMAN_ATTACKING));
        t.end();
      });
    });
  });

  test('send infect action', (t) => {
    let query = {
      code: 'ACTION_START_INFECTING',
      timestamp: +new Date()
    };
    let uid = 2;
    request.post(url + '/' + uid, { json: query }, (error, response, body) => {
      t.notOk(error);
      t.equal(response.statusCode, 200);
      t.notOk(body.error);
      t.notOk(body.message);
      t.equal(body.timestamp, query.timestamp);
      t.ok(state.has(body.state, constants.PLAYER_STATE_ZOMBIE_INFECTING));

      let query_2 = {
        code: 'ACTION_STOP_INFECTING',
        timestamp: +new Date()
      };
      request.post(url + '/' + uid, { json: query_2 }, (error, response, body) => {
        t.notOk(error);
        t.equal(response.statusCode, 200);
        t.notOk(body.error);
        t.notOk(body.message);
        t.equal(body.timestamp, query_2.timestamp);
        t.ok(!state.has(body.state, constants.PLAYER_STATE_ZOMBIE_INFECTING));
        t.end();
      });
    });
  });


  test('teardown', (t) => {
    http_server.close();
    if (https_server) https_server.close();
    jobs.forEach((j) => { j.cancel(); })
    t.end();
  });
});

