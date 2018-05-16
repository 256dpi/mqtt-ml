import 'babel-polyfill';

import mqtt from 'mqtt';
import $ from 'jquery';

import AI from './discrete_ai';

let ai = new AI();

let gestures = [];
let learning = false;
let trained = false;

$('#connect').click(() => {
  let client = mqtt.connect($('#broker').val());

  client.on('connect', () => {
    console.log('client connected');

    client.subscribe('+/acc');
  });

  client.on('message', function (topic, message) {
    // show message
    $('#data').text(message);

    // parse incoming data
    let data = message.toString().split(',').map((v) => parseFloat(v) );

    // switch state
    if (!trained) {
      learn(data);
    } else if(trained) {
      predict(data);
    }
  });
});

function learn(data) {
  // add data point to last gesture in learning mode
  if(learning) {
    gestures[gestures.length-1].push(data);

    // update info
    $('#info').text(gestures.map((v, i) => `${i}: ${v.length}`).join(', '));
  }
}

function predict(data) {
// otherwise predict gesture from data point
  let d = Array.from(ai.predict(data));

  // update output
  $('#out').html(d.map((v, i) => `${i}: ${v}`).join("<br>"));
}

$('#toggle').click(() => {
  // disable learning if learning
  if(learning) {
    learning = false;
    return;
  }

  // otherwise enable learning
  learning = true;

  // add empty array for next gesture
  gestures.push([]);
});

$('#train').click(() => {
  ai.train(gestures).then((h) => {
    $('#loss').text(h.history.loss[h.history.loss.length-1]);
    trained = true;
  });
});
