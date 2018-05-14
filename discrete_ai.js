import * as tf from '@tensorflow/tfjs';

export default class AI {
    async train(gestures) {
      // create a simple model
      this.model = tf.sequential();
      this.model.add(tf.layers.dense({units: 10, inputShape: [3]}));
      this.model.add(tf.layers.dense({units: gestures.length}));

      // prepare the model for training: Specify the loss and the optimizer
      this.model.compile({
        loss: 'meanSquaredError',
        optimizer: 'sgd'
      });

      // prepare data
      let x = [];
      let y = [];
      for(let i=0; i<gestures.length; i++) {
        for(let p of gestures[i]) {
          x.push(p);
          y.push(i);
        }
      }

      // create tensors from data
      const xs = tf.tensor2d(x, [x.length, 3]);
      const ys = tf.oneHot(tf.tensor1d(y).toInt(), gestures.length).toFloat();

      // train the model using the data
      return this.model.fit(xs, ys, {epochs: 250});
    }

    predict(data) {
      // use the model to do inference on a data point the model hasn't seen
      return this.model.predict(tf.tensor2d([data], [1, 3])).dataSync();
    }
}
