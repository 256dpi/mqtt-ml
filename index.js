import 'babel-polyfill';

import mqtt from 'mqtt';
import $ from 'jquery';

import AI from './ai';

let ai = new AI();

let client = mqtt.connect('ws://0.0.0.0:11884');

let trained = false;

client.on('connect', function () {
  console.log('client connected');

  client.subscribe('+/acc');
});

client.on('message', function (topic, message) {
  let data = message.toString().split(',').map((v) => parseFloat(v) );

  // convert to gravity
  data = data.map((x) => x * 0.061 / 1000 *9.80665);

  if(trained) {
    let d = ai.predict(data);
    let s = Array.from(d).map((v, i) => `${i}: ${v}`);
    $('#out').html(s.join("<br>"));
  } else {
    ai.learn(data);
  }
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
