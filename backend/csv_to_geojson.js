'use strict';

const fs = require('fs');
const csv = require('fast-csv');
const Transformer = require('stream').Transform;

class ToGeoJsonStream extends Transformer {
  constructor(options_) {
    let options = options_ || {};
    options.objectMode = true;
    super(options);
  }

  _transform(lonLat, encoding, callback) {
    let point = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(lonLat[0]), parseFloat(lonLat[1])]
      }
    };
    this.push(JSON.stringify(point) + '\n');
    callback();
  }
}


let togeojson = new ToGeoJsonStream();

csv.fromStream(process.stdin)
  .pipe(togeojson)
  .pipe(process.stdout);
