import 'babel-polyfill';

import mqtt from 'mqtt';
import $ from 'jquery';

import AI from './discrete_ai';

let ai = new AI();

let client = mqtt.connect('ws://0.0.0.0:1884');

let gestures = [];
let learning = false;
let trained = false;

client.on('connect', function () {
  console.log('client connected');

  client.subscribe('+/acc');
});

client.on('message', function (topic, message) {
  // show message
  $('#data').text(message);

  // parse incoming data
  let data = message.toString().split(',').map((v) => parseFloat(v) );

  // learn data point if not yet trained
  if(!trained) {
    // add data point to last gesture in learning mode
    if(learning) {
      gestures[gestures.length-1].push(data);

      // update info
      $('#info').text(gestures.map((v, i) => `${i}: ${v.length}`).join(', '));
    }

    return;
  }

  // otherwise predict gesture from data point
  let d = Array.from(ai.predict(data));

  // update output
  $('#out').html(d.map((v, i) => `${i}: ${v}`).join("<br>"));
});

$('#start').click(() => {
  // return if already in learning mode
  if(learning) {
    return;
  }

  // set flag
  learning = true;

  // add empty array for next gesture
  gestures.push([]);
});

$('#stop').click(() => {
  // reset flag
  learning = false;
});

$('#train').click(() => {
  ai.train(gestures).then((h) => {
    $('#loss').text(h.history.loss[h.history.loss.length-1]);
    trained = true;
  });
});
