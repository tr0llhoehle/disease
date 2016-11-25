'use strict';

const test = require('tape');
const app = require('..');
const request = require('request');

const config = {db_file: ':memory:', host: 'localhost', port: 5000};
const url = `http://${config.host}:${config.port}/update/v2`;

app(config, (error, server) => {
  if (error) throw error;

  test('send update', (t) => {
    t.plan(2);
    let query = {
        records: [
          {lon: 5.1, lat: 54.000, timestamp: 10000000, bearing: 100, accuracy: 5, provider: "gps", speed: 10},
          {lon: 5.1, lat: 54.000, timestamp: 10000001, bearing: 100, accuracy: 5, provider: "gps", speed: 10},
          {lon: 5.1, lat: 54.000, timestamp: 10000002, bearing: 100, accuracy: 5, provider: "gps", speed: 10}
        ]
    };
    let uid = 1;
    request.post(url + '/' + uid, { json: query }, (error, response, body) => {
      t.notOk(error);
      t.equal(response.statusCode, 200);
    })
  });

  test('teardown', (t) => {
    server.close();
    t.end();
  });
});

