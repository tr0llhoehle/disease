'use strict';

const test = require('tape');
const app = require('..');
const request = require('request');

const config = {db_file: ':memory:', host: 'localhost', port: 5000};
const url = `http://${config.host}:${config.port}/update/v2`;

app(config, (error, http_server, https_server, jobs) => {
  if (error) throw error;

  test('send update', (t) => {
    let query = {
        records: [
          {lon: 5.1, lat: 54.000, timestamp: +new Date() - 2000, bearing: 100, accuracy: 5, speed: 10},
          {lon: 5.1, lat: 54.000, timestamp: +new Date() - 1000, bearing: 100, accuracy: 5, speed: 10},
          {lon: 5.1, lat: 54.000, timestamp: +new Date(), bearing: 100, accuracy: 5, speed: 10}
        ]
    };
    let uid = 1;
    request.post(url + '/' + uid, { json: query }, (error, response, body) => {
      t.notOk(error);
      t.equal(response.statusCode, 200);
      t.notOk(body.error);
      t.notOk(body.message);
      t.end();
    })
  });

  test('get correct players in radius', (t) => {
    let near_queries = [
      { records: [{lon: 8.42315286397934,  lat: 49.01138015766177, timestamp: +new Date(), bearing: 100, accuracy: 5, speed: 10}]},
      { records: [{lon: 8.423195779323578, lat: 49.01152265957042, timestamp: +new Date(), bearing: 100, accuracy: 5, speed: 10}]},
      { records: [{lon: 8.42290610074997,  lat: 49.011348490515566, timestamp: +new Date(), bearing: 100, accuracy: 5, speed: 10}]},
    ];
    let far_query = { records: [{lon: 8.421803712844849, lat: 49.017565420659395, timestamp: +new Date(), bearing: 100, accuracy: 5, speed: 10}]};

    request.post(url + '/100', { json: near_queries[0] }, (error, response, body) => {
      t.notOk(error);
      t.equal(response.statusCode, 200);
      t.equals(body.players.length, 0);

      request.post(url + '/200', { json: near_queries[1] }, (error, response, body) => {
        t.notOk(error);
        t.equal(response.statusCode, 200);
        t.equals(body.players.length, 1);
        t.equals(body.players[0].uid, 100);

        request.post(url + '/300', { json: near_queries[2] }, (error, response, body) => {
          t.notOk(error);
          t.equal(response.statusCode, 200);
          t.equals(body.players.length, 2);
          t.equals(body.players[0].uid, 100);
          t.equals(body.players[1].uid, 200);

          request.post(url + '/400', { json: far_query}, (error, response, body) => {
            t.notOk(error);
            t.equal(response.statusCode, 200);
            t.equals(body.players.length, 0);

            t.end();
          });
        });
      });
    })
  });

  test('teardown', (t) => {
    http_server.close();
    if (https_server) https_server.close();
    jobs.forEach((j) => { j.cancel(); })
    t.end();
  });
});

