import * as tf from '@tensorflow/tfjs';

const network = layers([input(2), output()]);

network[0].weights = tf.tensor2d([[-10, 20, 20]]);

const Y = tf.tensor2d([[1], [1], [0], [1]]);
const X = tf.tensor2d([
  [1, 0],
  [0, 1],
  [0, 0],
  [1, 1],
]);

predict(X, network).print();

activate(X, network);

type Layer = {
  units: number;
  weights: tf.Tensor;
};

type ActivatedLayer = {
  activations: tf.Tensor;
  weights: tf.Tensor;
};

function predict(xs: tf.Tensor, layers: Layer[]): tf.Tensor {
  const activated = activate(xs, layers);

  return activated[activated.length - 1].activations;
}

function activate(xs: tf.Tensor, layers: Layer[]): ActivatedLayer[] {
  if (layers.length === 1) {
    return [{ activations: xs, weights: layers[0].weights }];
  }

  const [input, ...rest] = layers;

  const biased = tf.concat([tf.ones([xs.shape[0], 1]), xs], 1);

  const z = biased.dot(input.weights.transpose());

  const activations = z.sigmoid();

  return [
    { activations: xs, weights: input.weights },
    ...activate(activations, rest),
  ];
}

function layers(elements: Layer[]): Layer[] {
  if (elements.length < 2) {
    return elements;
  }

  const [first, second, ...rest] = elements;

  first.weights = tf.ones([
    second.units,
    // Including bias term
    first.units + 1,
  ]);

  return [first, ...layers([second, ...rest])];
}

function input(units: number): Layer {
  return layer(units);
}

function layer(units: number): Layer {
  return {
    units,
    weights: tf.ones([0]),
  };
}

function output(): Layer {
  return layer(1);
}
