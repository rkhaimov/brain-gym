import * as tf from '@tensorflow/tfjs';
import {
  cost,
  dematerialize,
  hidden_layer,
  input_layer,
  learn,
  materialize,
  network,
  output_layer,
  predict,
} from './nn';

const arch = network([input_layer(2), hidden_layer(3), output_layer(1)]);

const X = tf.tensor2d([
  [1, 1],
  [1, 0],
  [0, 1],
  [0, 0],
]);

const Y = tf.tensor2d([[1], [1], [1], [0]]);

const SAVED =
  '[{"units":2,"weights":[[1.9069023132324219,1.8584167957305908],[1.9069023132324219,1.8584167957305908],[1.9069023132324219,1.8584167957305908]],"bias":[[-0.9327710270881653],[-0.9327710270881653],[-0.9327710270881653]]},{"units":3,"weights":[[2.0803627967834473,2.0803627967834473,2.0803627967834473]],"bias":[[-2.8002524375915527]]},{"units":1,"weights":0,"bias":0}]';

const prelearned = dematerialize(SAVED);

predict(tf.tensor2d([[1], [1]]), prelearned).print();

// const configured = learn(X, Y, arch, 0, 500);
