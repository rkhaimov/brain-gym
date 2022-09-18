import * as tf from '@tensorflow/tfjs';
import {
  cost,
  hidden_layer,
  input_layer,
  learn,
  network,
  output_layer,
} from './nn';

const arch = network([
  input_layer(2),
  hidden_layer(10),
  output_layer(2),
]);

const X = tf.tensor2d([
  [1, 1],
  [1, 0],
  [0, 1],
  [0, 0],
]);

const Y = tf.tensor2d([
  [1, 1],
  [1, 0],
  [1, 0],
  [0, 0],
]);

cost(X, Y, arch).print();
const configured = learn(X, Y, arch, 0, 500);
cost(X, Y, configured).print();
