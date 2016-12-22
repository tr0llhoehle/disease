'use strict';

module.exports = {
  PLAYER_RADIUS: 500, // meters
  PLAYER_TIMEOUT: 60*1000, // 60 seconds

  PLAYER_STATE_HUMAN:                        0,
  PLAYER_STATE_HUMAN_INFECTED:          1 << 1,
  PLAYER_STATE_HUMAN_ATTACKING:         1 << 2,
  PLAYER_STATE_HUMAN_INFECTION_PENDING: 1 << 3,

  PLAYER_STATE_ZOMBIE:               1 << 0,
  PLAYER_STATE_ZOMBIE_DEAD:          1 << 1,
  PLAYER_STATE_ZOMBIE_INFECTING:     1 << 2,
  PLAYER_STATE_ZOMBIE_DEATH_PENDING: 1 << 3,
};
