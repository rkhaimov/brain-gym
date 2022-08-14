import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

void main();

async function main() {
  const model = tf.sequential();

  model.add(tf.layers.inputLayer({ inputShape: [2] }));

  model.add(
    tf.layers.dense({
      units: 2,
      activation: 'sigmoid',
    })
  );

  model.add(
    tf.layers.dense({
      units: 2,
      activation: 'sigmoid',
    })
  );

  model.add(
    tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
    })
  );

  const X = tf.tensor2d([
    [1, 1],
    [1, 0],
    [0, 1],
    [0, 0],
  ]);

  const Y = tf.tensor2d([[1], [0], [0], [1]]);

  model.compile({
    optimizer: tf.train.adam(0.03),
    loss: tf.losses.meanSquaredError,
  });

  await model.fit(X, Y, {
    batchSize: 1,
    epochs: 500,
    callbacks: tfvis.show.fitCallbacks(
      { name: 'Training Performance' },
      ['loss'],
      { height: 200, callbacks: ['onEpochEnd'] }
    ),
  });

  const predictions = model.predict(X) as tf.Tensor;

  predictions.print();
}
