import * as tf from '@tensorflow/tfjs';

const network = layers([input(2), output(1)]);

// network[0].weights = tf.tensor2d([[-10, 20, 20]]);

const Y = tf.tensor2d([[1], [1], [0], [1]]);

const X = tf.tensor2d([
  [1, 0],
  [0, 1],
  [0, 0],
  [1, 1],
]);

const configured = learn(X, Y, network);

cost(X, Y, configured).print();

predict(X, configured).print();

type Layer = {
  units: number;
  weights: tf.Tensor;
};

type ActivatedLayer = {
  activations: tf.Tensor;
  weights: tf.Tensor;
};

function predict(xs: tf.Tensor, network: Layer[]): tf.Tensor {
  const activated = activate(xs, network);

  return activated[activated.length - 1].activations;
}

function learn(
  xs: tf.Tensor,
  y: tf.Tensor,
  network: Layer[],
  epoch = 0,
  total = 100
): Layer[] {
  if (epoch === total) {
    return network;
  }

  const activations = activate(xs, network);

  const curr = activations[activations.length - 1];
  const prev = activations[activations.length - 2];

  const weights = on2(curr, prev, y);

  const updated = network.map((layer, index) =>
    index === activations.length - 2 ? { ...layer, weights } : layer
  );

  return learn(xs, y, updated, epoch + 1);
}

function on2(
  curr: ActivatedLayer,
  prev: ActivatedLayer,
  y: tf.Tensor
): tf.Tensor {
  const dc = curr.activations.add(y.mul(-1)).mul(2);

  const ds = curr.activations.mul(tf.scalar(1).add(curr.activations.mul(-1)));

  const dz = prev.activations;

  const slope = dz.mul(ds.mul(dc)).sum(0).mul(-1);

  return prev.weights.add(slope);
}

function cost(xs: tf.Tensor, y: tf.Tensor, network: Layer[]): tf.Tensor {
  const activations = activate(xs, network);
  const output = activations[activations.length - 1].activations;

  return output.add(y.mul(-1)).square().mean();
}

function activate(xs: tf.Tensor, network: Layer[]): ActivatedLayer[] {
  if (network.length === 1) {
    return [{ activations: xs, weights: network[0].weights }];
  }

  const [input, ...rest] = network;

  const biased = tf.concat([tf.ones([xs.shape[0], 1]), xs], 1);
  const z = biased.dot(input.weights.transpose());
  const activations = z.sigmoid();

  return [
    { activations: biased, weights: input.weights },
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

function output(units: number): Layer {
  return layer(units);
}
