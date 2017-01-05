'use strict';

const constants = require('./constants');

function is_human(player) {
    return !is_zombie(player);
}

function is_zombie(player) {
    return player.state & constants.PLAYER_STATE_ZOMBIE;
}

function has_state(player, state) {
    return player.state & state;
}

function set_state(player, state) {
    return player.state | state;
}

function unset_state(player, state) {
    return player.state & ~state;
}

function handle_human(player, nearby_players) {
  let ret = {
    events: [],
    state: player.state
  };

  if (!has_state(player, constants.PLAYER_STATE_HUMAN_INFECTED)) {
    let infecting_zombies = nearby_players
                  .filter(is_zombie)
                  .filter((p) => { return has_state(p, constants.PLAYER_STATE_ZOMBIE_INFECTING)})

    if (has_state(player, constants.PLAYER_STATE_HUMAN_INFECTION_PENDING) && infecting_zombies.length == 0) {
      ret.events.push({
        message: `You are not being infected anymore.`,
        code: 'INFECTION_STOPPED'
      });
      ret.state = unset_state(player, constants.PLAYER_STATE_HUMAN_INFECTION_PENDING);
    } else if (!has_state(player, constants.PLAYER_STATE_HUMAN_INFECTION_PENDING) && infecting_zombies.length > 0) {
      ret.events.push({
        message: `Your are being infected by ${infecting_zombies.length} zombies.`,
        code: 'INFECTION_PENDING'
      });
      ret.state = set_state(player, constants.PLAYER_STATE_HUMAN_INFECTION_PENDING);
    }
  }

  if (!has_state(player, constants.PLAYER_STATE_HUMAN_ATTACKING)) {
    let zombies = nearby_players.filter(is_zombie);
    if (zombies.length > 0) {
      ret.events.push({
        message: `There are ${zombies.length} zombies nearby you can attack.`,
        code: 'ATTACKING_POSSIBLE'
      });
    }
  }

  return ret;
}

function handle_zombie(player, nearby_players) {
  let ret = {
    events: [],
    state: player.state
  };


  if (!has_state(player, constants.PLAYER_STATE_ZOMBIE_DEAD)) {
    let attacking_humans = nearby_players.filter((p) => {
      return has_state(p, constants.PLAYER_STATE_HUMAN_ATTACKING);
    });

    if (!has_state(player, constants.PLAYER_STATE_ZOMBIE_DEATH_PENDING) && attacking_humans.length > 0) {
      ret.events.push({
        message: `Your are beging attacked by ${attacking_humans.length} humans.`,
        code: 'DEATH_PENDING'
      });
      ret.state = set_state(player, constants.PLAYER_STATE_ZOMBIE_DEATH_PENDING);
    } else if (has_state(player, constants.PLAYER_STATE_ZOMBIE_DEATH_PENDING) && attacking_humans.length == 0){
      ret.events.push({
        message: `Your are not being attacked anymore.`,
        code: 'DEATH_STOPPED'
      });
      ret.state = unset_state(player, constants.PLAYER_STATE_ZOMBIE_DEATH_PENDING);
    }
  }

  if (!has_state(player, constants.PLAYER_STATE_ZOMBIE_INFECTING)) {
    let humans = nearby_players.filter(is_human);
    if (humans.length > 0) {
      ret.events.push({
        message: `There are ${humans.length} humans nearby you can infect.`,
        code: 'INFECTING_POSSIBLE'
      });
    }
  }

  return ret;
}

function handle_human_action(player, action) {
  let ret = {
    events: [],
    state: player.state
  };

  switch (action.code) {
    case 'ACTION_START_ATTACKING':
      ret.state = set_state(player, constants.PLAYER_STATE_HUMAN_ATTACKING);
      break;
    case 'ACTION_STOP_ATTACKING':
      ret.state = unset_state(player, constants.PLAYER_STATE_HUMAN_ATTACKING);
      break;
    default:
      throw new Error(`Invalid action: ${action.code}`);
      break;
  }

  return ret;
}

function handle_zombie_action(player, action) {
  let ret = {
    events: [],
    state: player.state
  };

  switch (action.code) {
    case 'ACTION_STOP_INFECTING':
      ret.state = unset_state(player, constants.PLAYER_STATE_ZOMBIE_INFECTING);
      break;
    case 'ACTION_START_INFECTING':
      ret.state = set_state(player, constants.PLAYER_STATE_ZOMBIE_INFECTING);
      break;
    default:
      throw new Error(`Invalid action: ${action.code}`);
      break;
  }

  return ret;
}

module.exports = {
  action: (player, action) => {
    if (is_zombie(player)) {
      return handle_zombie_action(player, action);
    } else {
      return handle_human_action(player, action);
    }
    return ret;
  },

  update: (player, nearby_players) => {
    if (is_zombie(player)) {
      return handle_zombie(player, nearby_players);
    } else {
      return handle_human(player, nearby_players);
    }
  },

  has: (state, sub_state) => {
    return has_state({state: state}, sub_state);
  },

};
