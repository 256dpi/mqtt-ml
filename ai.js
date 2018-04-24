import * as tf from '@tensorflow/tfjs';

export default class AI {
    constructor() {
      this.learning = false;
      this.counter = 0;
      this.gestures = [];
    }

    start() {
      if(this.learning) {
        return;
      }

      console.log('start learning', this.counter);

      this.learning = true;
      this.gestures[this.counter] = [];
    }

    learn(data) {
      if(!this.learning) {
        return;
      }

      console.log('add data');

      this.gestures[this.counter].push(data);
    }

    stop() {
      if(!this.learning) {
        return;
      }

      console.log('stop learning');

      this.learning = false;
      this.counter++;
    }

    async train() {
      // create a simple model
      this.model = tf.sequential();
      this.model.add(tf.layers.dense({units: 10, inputShape: [3]}));
      this.model.add(tf.layers.dense({units: this.counter}));

      // prepare the model for training: Specify the loss and the optimizer
      this.model.compile({
        loss: 'meanSquaredError',
        optimizer: 'sgd'
      });

      // prepare data
      let x = [];
      let y = [];
      for(let i=0; i<this.counter; i++) {
        for(let p of this.gestures[i]) {
          x.push(p);
          y.push(i);
        }
      }

      // create tensors from data
      const xs = tf.tensor2d(x, [x.length, 3]);
      const ys = tf.oneHot(tf.tensor1d(y).toInt(), this.counter).toFloat();
      xs.print();
      ys.print();

      // train the model using the data
      return this.model.fit(xs, ys, {epochs: 250});
    }

    predict(data) {
      // use the model to do inference on a data point the model hasn't seen
      return this.model.predict(tf.tensor2d([data], [1, 3])).dataSync();
    }
}
