import * as tf from '@tensorflow/tfjs';
import { Tensor } from '@tensorflow/tfjs';
import * as math from 'mathjs';

export async function learn(X: Tensor, Y: Tensor): Promise<Tensor> {
  return X.transpose()
    .matMul(X)
    .array()
    .then((matrix) => math.inv(matrix as number[][]) as number[][])
    .then((inverse) => tf.tensor(inverse).matMul(X.transpose()))
    .then((pseudo) => pseudo.matMul(Y));
}

function predict(X: Tensor, theta: Tensor): Tensor {
  return X.transpose().matMul(theta).sum();
}
