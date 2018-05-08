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

    pause() {
      if(!this.learning) {
        return;
      }

      console.log('pause learning');

      this.learning = false;
    }

    finish() {
      if(this.learning) {
        return;
      }

      console.log('finish learning');

      this.counter++;
    }

    async train() {
      // create a simple model
      this.model = tf.sequential();
      this.model.add(tf.layers.conv1d({
        inputShape: [10, 3],
        kernelSize: 3,
        filters: 8,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'VarianceScaling'
      }));
      this.model.add(tf.layers.maxPooling1d({
        poolSize: 2,
        strides: 2
      }));
      this.model.add(tf.layers.conv1d({
        kernelSize: 3,
        filters: 16,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'VarianceScaling'
      }));
      this.model.add(tf.layers.maxPooling1d({
        poolSize: 2,
        strides: 2
      }));
      this.model.add(tf.layers.flatten());
      this.model.add(tf.layers.dense({
        units: this.counter,
        kernelInitializer: 'VarianceScaling',
        activation: 'softmax'
      }));

      // prepare the model for training: Specify the loss and the optimizer
      this.model.compile({
        loss: 'meanSquaredError',
        optimizer: 'sgd'
      });

      // prepare data
      let x = [];
      let y = [];
      for(let i=0; i<this.counter; i++) {
        for(let j=0; j<Math.floor(this.gestures[i].length/10); j++) {
          let a = [];

          for(let k=0; k<10; k++) {
            a.push(this.gestures[i][j*10+k]);
          }

          x.push(a);
          y.push(i);
        }
      }

      // create tensors from data
      const xs = tf.tensor3d(x, [x.length, 10, 3]);
      const ys = tf.oneHot(tf.tensor1d(y).toInt(), this.counter).toFloat();
      xs.print();
      ys.print();

      // train the model using the data
      return this.model.fit(xs, ys, {epochs: 250});
    }

    predict(data) {
      console.log(data);
      // use the model to do inference on a data point the model hasn't seen
      return this.model.predict(tf.tensor3d([data], [1, 10, 3])).dataSync();
    }
}
