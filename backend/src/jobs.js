'use strict';

module.export = {
  new_round: function (model, callback) {
    console.log("Triggering a new round");
    let q = d3.queue();
    q.defer(model.reset_daily_stats.bind(model));
    q.defer(model.set_random_type.bind(model));
    q.awaitAll(callback);
  },
};
