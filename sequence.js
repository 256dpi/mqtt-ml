import 'babel-polyfill';

import mqtt from 'mqtt';
import $ from 'jquery';

import AI from './sequence_ai';

let ai = new AI();

let client = mqtt.connect('ws://0.0.0.0:1884');

let trained = false;
let samples = [];

client.on('connect', function () {
  console.log('client connected');

  client.subscribe('+/acc');
});

client.on('message', function (topic, message) {
  // parse incoming data
  let data = message.toString().split(',').map((v) => parseFloat(v) );

  // learn data point if not yet trained
  if(!trained) {
    ai.learn(data);
    return;
  }

  // otherwise add sample
  samples.push(data);

  // wait for enough samples
  if (samples.length < 10) {
    return;
  }

  // removes the first element if there are too many
  if (samples.length > 10) {
    samples.shift();
  }

  // otherwise predict gesture from collected samples
  let d = ai.predict(samples);

  // set label
  let s = Array.from(d).map((v, i) => `${i}: ${v}`);
  $('#out').html(s.join("<br>"));
});

$('#start').click(() => {
  ai.start();
});

$('#pause').click(() => {
  ai.pause();
});

$('#finish').click(() => {
  ai.finish();
});

$('#train').click(() => {
  ai.train().then((h) => {
    console.log(h);
    trained = true;
  });
});
