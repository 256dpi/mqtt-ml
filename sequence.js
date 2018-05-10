import 'babel-polyfill';

import mqtt from 'mqtt';
import $ from 'jquery';

import AI from './sequence_ai';

let ai = new AI();

let client = mqtt.connect('ws://0.0.0.0:1884');

let recording = false;
let cache = [];
let gestures = [[]];

let trained = false;
let samples = [];

client.on('connect', function () {
  console.log('client connected');

  client.subscribe('+/gyr');
});

function record(data) {
  // cache data
  cache.push(data);

  console.log("cached data");

  // return if data is missing
  if(cache.length < 10) {
    return;
  }

  // add sample
  gestures[gestures.length-1].push(cache);

  // reset cache
  cache = [];

  // reset flag
  recording = false;

  console.log("added sample");
}

function predict(data) {
  // add data to samples
  samples.push(data);

  // learn data point if not yet trained
  if(!trained) {
    ai.learn(data);
    return;
  }

  // wait for enough samples
  if (samples.length < 10) {
    return;
  }

  // removes the first element if there are too many
  if (samples.length > 10) {
    samples.shift();
  }

  // otherwise predict gesture from collected samples
  let d = ai.classify(samples);

  // set label
  let s = Array.from(d).map((v, i) => `${i}: ${v}`);
  $('#out').html(s.join("<br>"));
}

client.on('message', function (topic, message) {
  // parse incoming data
  let data = message.toString().split(',').map((v) => parseFloat(v) / 300 );

  // switch state
  if (recording) {
    record(data);
  } else if(trained) {
    predict(data);
  }
});

$('#record').click(() => {
  recording = true;
});

$('#add').click(() => {
  // add array
  gestures.push([]);

  console.log("added gesture");
});

$('#train').click(() => {
  ai.train(gestures).then((h) => {
    console.log(h.history.loss);
    trained = true;
  });
});
