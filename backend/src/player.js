'use strict';

const constants = require('./constants');

function handle_human(nearby_players) {
  let zombies = nearby_players.filter((p) => {
    return p.state == constants.PLAYER_STATE_ZOMBIE;
  });

  let ret = {
    events: [],
    state: constants.PLAYER_STATE_HUMAN
  };

  if (zombies.length > 0) {
    ret.events.push({
      message: `Your are being infected by ${zombies.length} zombies.`,
      code: 'INFECTED'
    });
    ret.state = constants.PLAYER_STATE_HUMAN_INFECTED;
  }

  return ret;
}

function handle_infected(nearby_players) {
  let zombies = nearby_players.filter((p) => {
    return p.state == constants.PLAYER_STATE_ZOMBIE;
  });

  let ret = {
    events: [],
    state: constants.PLAYER_STATE_HUMAN_INFECTED
  };

  if (zombies.length == 0) {
    ret.events.push({
      message: `Nobody is infecting you anymore!`,
      code: 'NO_INFECTION'
    });
    ret.state = constants.PLAYER_STATE_HUMAN;
  }
  return ret;
}

function handle_zombie(nearby_players) {
  let humans = nearby_players.filter((p) => {
    return p.state == constants.PLAYER_STATE_HUMAN;
  });

  let ret = {
    events: [],
    state: constants.PLAYER_STATE_ZOMBIE
  };

  if (humans.length > 0) {
    ret.events.push({
      message: `Your are infecting ${humans.length} humans.`,
      code: 'INFECTING'
    });
    ret.state = constants.PLAYER_STATE_ZOMBIE;
  }
  return ret;
}

function handle_dead(nearby_players) {
  let ret = {
    events: [],
    state: constants.PLAYER_STATE_ZOMBIE_DEAD
  };

  return ret;
}

module.exports = {
  update: (player_state, nearby_players) => {
      switch (player_state) {
        case constants.PLAYER_STATE_HUMAN:
          return handle_human(nearby_players);
        case constants.PLAYER_STATE_HUMAN_INFECTED:
          return handle_infected(nearby_players);
        case constants.PLAYER_STATE_ZOMBIE:
          return handle_zombie(nearby_players);
        case constants.PLAYER_STATE_ZOMBIE_DEAD:
          return handle_dead(nearby_players);;
        default:
          throw new Error("Invalid player state: " + result.state);
          break;
      }
  },

};
