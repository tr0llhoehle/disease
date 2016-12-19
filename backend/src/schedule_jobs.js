'use strict';

const schedule = require('node-schedule');
const jobs = require('./jobs');

module.exports = function(model) {
  // triggers a new round at 4am in the morning
  let new_round_rule = new schedule.RecurrenceRule();
  new_round_rule.hour = 4;
  new_round_rule.minute = 0;
  let job = schedule.scheduleJob(new_round_rule, () => {
    jobs.new_round(model, (err) => {
      if (err) throw err;

      console.log("A new round has begun!");
    });
  });

  return [job];
}
