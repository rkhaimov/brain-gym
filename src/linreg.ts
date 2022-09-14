import * as tf from '@tensorflow/tfjs';
import { Tensor } from '@tensorflow/tfjs';
import * as math from 'mathjs';

export async function learn(X: Tensor, Y: Tensor): Promise<Tensor> {
  const Xb = tf.ones([X.shape[0], 1]).concat(X, 1);

  return Xb.transpose()
    .matMul(Xb)
    .array()
    .then((matrix) => math.inv(matrix as number[][]) as number[][])
    .then((inverse) => tf.tensor(inverse).matMul(Xb.transpose()))
    .then((pseudo) => pseudo.matMul(Y));
}

export function predict(X: Tensor, theta: Tensor): Tensor {
  const Xb = tf.ones([X.shape[0], 1]).concat(X, 1);

  return Xb.transpose().matMul(theta).sum();
}
