'use strict';

const test = require('tape');
const player = require('../src/player');
const constants = require('../src/constants');

test('only humans', (t) => {
  let current_player = { state: constants.PLAYER_STATE_HUMAN, lon: 13, lat: 37, uid: 0 };
  let ret = player.update(current_player, [
    { state: constants.PLAYER_STATE_HUMAN, lon: 13, lat: 37, uid: 1 },
    { state: constants.PLAYER_STATE_HUMAN, lon: 13, lat: 37, uid: 2 },
    { state: constants.PLAYER_STATE_HUMAN, lon: 13, lat: 37, uid: 3 }
  ]);
  t.equals(ret.events.length, 0);
  t.equals(ret.state, constants.PLAYER_STATE_HUMAN);
  t.end();
});

test('only zombies', (t) => {
  let current_player = { state: constants.PLAYER_STATE_ZOMBIE, lon: 13, lat: 37, uid: 0 };
  let ret = player.update(current_player, [
    { state: constants.PLAYER_STATE_ZOMBIE, lon: 13, lat: 37, uid: 1 },
    { state: constants.PLAYER_STATE_ZOMBIE, lon: 13, lat: 37, uid: 2 },
    { state: constants.PLAYER_STATE_ZOMBIE, lon: 13, lat: 37, uid: 3 }
  ]);
  t.equals(ret.events.length, 0);
  t.equals(ret.state, constants.PLAYER_STATE_ZOMBIE);
  t.end();
});

test('zombies around human', (t) => {
  let current_player = { state: constants.PLAYER_STATE_HUMAN, lon: 13, lat: 37, uid: 0 };
  let ret = player.update(current_player, [
    { state: constants.PLAYER_STATE_ZOMBIE, lon: 13, lat: 37, uid: 1 },
    { state: constants.PLAYER_STATE_ZOMBIE, lon: 13, lat: 37, uid: 2 },
    { state: constants.PLAYER_STATE_ZOMBIE, lon: 13, lat: 37, uid: 3 },
    { state: constants.PLAYER_STATE_HUMAN, lon: 13, lat: 37, uid: 4 },
  ]);
  t.equals(ret.events.length, 1);
  t.equals(ret.events[0].code, 'ATTACKING_POSSIBLE');
  t.equals(ret.state, constants.PLAYER_STATE_HUMAN);
  t.end();
});

test('humans around zombies', (t) => {
  let current_player = { state: constants.PLAYER_STATE_ZOMBIE, lon: 13, lat: 37, uid: 0 };
  let ret = player.update(current_player, [
    { state: constants.PLAYER_STATE_HUMAN, lon: 13, lat: 37, uid: 1 },
    { state: constants.PLAYER_STATE_HUMAN, lon: 13, lat: 37, uid: 2 },
    { state: constants.PLAYER_STATE_HUMAN, lon: 13, lat: 37, uid: 3 },
    { state: constants.PLAYER_STATE_ZOMBIE, lon: 13, lat: 37, uid: 4 },
  ]);
  t.equals(ret.events.length, 1);
  t.equals(ret.events[0].code, 'INFECTING_POSSIBLE');
  t.equals(ret.state, constants.PLAYER_STATE_ZOMBIE);
  t.end();
});
