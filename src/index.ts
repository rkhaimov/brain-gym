import * as tf from '@tensorflow/tfjs';

const network: Layer[] = [
  {
    units: 2,
    bias: tf.ones([3, 1]),
    weights: tf.ones([3, 2]),
  },
  {
    units: 3,
    bias: tf.ones([1, 1]),
    weights: tf.ones([1, 3]),
  },
  {
    units: 1,
    bias: tf.scalar(0),
    weights: tf.ones([0]),
  },
];

const x = tf.tensor([1, 0]).reshape([-1, 1]);
const y = tf.tensor([0]).reshape([-1, 1]);

cost(x, y, network).print();
const configured = learn(x, y, network, 0, 100);
cost(x, y, configured).print();

function activate(x: tf.Tensor, network: Layer[]): ActivatedLayer[] {
  if (network.length === 1) {
    return [{ activations: x, ...network[0] }];
  }

  const [input, ...rest] = network;

  const z = input.weights.dot(x).add(input.bias);
  const activations = z.sigmoid();

  return [{ activations: x, ...input }, ...activate(activations, rest)];
}

function cost(xs: tf.Tensor, y: tf.Tensor, network: Layer[]): tf.Tensor {
  const activations = activate(xs, network);
  const output = activations[activations.length - 1].activations;

  return output
    .add(y.mul(-1))
    .norm('euclidean')
    .square()
    .mul(1 / 2);
}

type Layer = {
  units: number;
  bias: tf.Tensor;
  weights: tf.Tensor;
};

type ActivatedLayer = Layer & {
  activations: tf.Tensor;
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
  const updated = propagate(y, activations);

  return learn(xs, y, updated, epoch + 1, total);
}

function propagate(y: tf.Tensor, network: ActivatedLayer[]): Layer[] {
  const x_2 = network[2].activations;
  const d_2 = x_2
    .add(y.mul(-1))
    .mul(x_2)
    .mul(tf.scalar(1).add(x_2.mul(-1)));

  const x_1 = network[1].activations;
  const w_2_slope = d_2.dot(x_1.transpose());
  const b_1_slope = d_2;

  const w_2 = network[1].weights;
  const d_1 = w_2
    .transpose()
    .dot(d_2)
    .mul(x_1)
    .mul(tf.scalar(1).add(x_1.mul(-1)));

  const x_0 = network[0].activations;
  const w_1_slope = d_1.dot(x_0.transpose());
  const b_0_slope = d_1;

  const lr = 1;

  return [
    {
      units: network[0].units,
      weights: network[0].weights.add(w_1_slope.mul(lr).mul(-1)),
      bias: network[0].bias.add(b_0_slope.mul(lr).mul(-1)),
    },
    {
      units: network[1].units,
      weights: network[1].weights.add(w_2_slope.mul(lr).mul(-1)),
      bias: network[1].bias.add(b_1_slope.mul(lr).mul(-1)),
    },
    {
      units: network[2].units,
      weights: network[2].weights,
      bias: network[2].bias,
    },
  ];
}
