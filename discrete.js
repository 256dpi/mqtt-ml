import 'babel-polyfill';

import mqtt from 'mqtt';
import $ from 'jquery';

import AI from './discrete_ai';

let ai = new AI();

let client = mqtt.connect('ws://0.0.0.0:1884');

let trained = false;

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

  // otherwise predict gesture from data point
  let d = ai.predict(data);

  // set label
  let s = Array.from(d).map((v, i) => `${i}: ${v}`);
  $('#out').html(s.join("<br>"));
});

$('#start').click(() => {
  ai.start();
});

$('#stop').click(() => {
  ai.stop();
});

$('#train').click(() => {
  ai.train().then((h) => {
    trained = true;
  });
});
