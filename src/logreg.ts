import { Tensor } from '@tensorflow/tfjs';
import * as tf from '@tensorflow/tfjs';

export function learn(X: Tensor, Y: Tensor) {
  const TOTAL_EPOCHS = 500;

  const Xb = tf.ones([X.shape[0], 1]).concat(X, 1);
  const theta = tf.ones([Xb.shape[1]!, 1]);

  return bgd(theta);

  function bgd(theta: Tensor, epoch = 0): Tensor {
    const rate = Math.pow(10, 1);

    const slope = Xb.transpose().matMul(h(Xb, theta).sub(Y)).mul(rate);

    if (epoch === TOTAL_EPOCHS) {
      return theta;
    }

    return bgd(theta.sub(slope), epoch + 1);
  }

  function h(Xb: Tensor, theta: Tensor): Tensor {
    return Xb.matMul(theta).mul(-1).exp().add(1).reciprocal();
  }
}

export function predict(X: Tensor, theta: Tensor): Tensor {
  const Xb = tf.ones([X.shape[0], 1]).concat(X, 1);

  return Xb.matMul(theta).mul(-1).exp().add(1).reciprocal();
}
