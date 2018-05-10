import * as tf from '@tensorflow/tfjs';

export default class AI {
  /**
   * Train the model with collected data.
   *
   * @param gestures
   * @returns {Promise<tf.History>}
   */
  async train(gestures) {
    // create a simple model
    this.model = tf.sequential();

    // add initial convolution layer
    this.model.add(tf.layers.conv1d({
      inputShape: [10, 3],
      kernelSize: 3,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'VarianceScaling'
    }));

    // add max pooling layer
    this.model.add(tf.layers.maxPooling1d({
      poolSize: 2,
      strides: 2
    }));

    // flatten the dimensions
    this.model.add(tf.layers.flatten());

    // add multiple fully connected hidden layers
    for(let i=0; i<5; i++) {
      this.model.add(tf.layers.dense({
        units: 10,
        kernelInitializer: 'VarianceScaling'
      }));
    }

    // add final output layer
    this.model.add(tf.layers.dense({
      units: gestures.length,
      activation: 'softmax',
      kernelInitializer: 'VarianceScaling'
    }));

    // prepare the model for training: Specify the loss and the optimizer
    this.model.compile({
      loss: 'meanSquaredError',
      optimizer: 'sgd'
    });

    // prepare data
    let x = [];
    let y = [];

    // iterate on gestures
    for(let i=0; i<gestures.length; i++) {
      // iterate on gesture samples
      for(let j=0; j<gestures[i].length; j++) {
        x.push(gestures[i][j]);
        y.push(i);
      }
    }

    // create tensors from data
    const xs = tf.tensor3d(x, [x.length, 10, 3]);
    const ys = tf.oneHot(tf.tensor1d(y).toInt(), gestures.length).toFloat();

    // train the model using the data
    return this.model.fit(xs, ys, {epochs: 500});
  }

  /**
   * Classify a gesture.
   *
   * @param data
   * @returns {*}
   */
  classify(data) {
    // use the model to do inference on a data point the model hasn't seen
    return this.model.predict(tf.tensor3d([data], [1, 10, 3])).dataSync();
  }
}
