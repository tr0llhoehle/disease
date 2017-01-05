'use strict';

const test = require('tape');
const app = require('..');
const request = require('request');

const constants = require('../src/constants');

const config = {db_file: ':memory:', host: 'localhost', port: 5000, debug: true};
const url = `http://${config.host}:${config.port}/debug/v1`;

app(config, (error, http_server, https_server, jobs) => {
  if (error) throw error;

  test('set player state', (t) => {
    let query = {lon: 5.1, lat: 54.000, timestamp: +new Date() - 2000, state: constants.PLAYER_STATE_HUMAN_ATTACKING};
    let uid = 1;
    request.post(url + '/' + uid, { json: query }, (error, response, body) => {
      t.notOk(error);
      t.equal(response.statusCode, 200);
      t.notOk(body.error);
      t.notOk(body.message);
      t.end();
    });
  });


  test('teardown', (t) => {
    http_server.close();
    if (https_server) https_server.close();
    jobs.forEach((j) => { j.cancel(); })
    t.end();
  });
});

