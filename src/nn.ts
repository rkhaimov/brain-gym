import * as tf from '@tensorflow/tfjs';

export function network(layers: Layer[]): Layer[] {
  if (layers.length < 2) {
    return layers;
  }

  const [first, second, ...tail] = layers;

  first.bias = tf.randomUniform([second.units, 1]);
  first.weights = tf.randomUniform([second.units, first.units]);

  return [first, ...network([second, ...tail])];
}

export function materialize(layers: Layer[]): string {
  const unbox = layers.map((layer) => ({
    units: layer.units,
    weights: layer.weights.arraySync(),
    bias: layer.bias.arraySync(),
  }));

  return JSON.stringify(unbox);
}

type MaterializedLayer = {
  units: number;
  bias: number[] | number;
  weights: number[] | number;
};

export function dematerialize(materialized: string): Layer[] {
  const unpack: MaterializedLayer[] = JSON.parse(materialized);

  return unpack.map(({ bias, weights, units }) => ({
    units,
    bias: typeof bias === 'number' ? tf.scalar(bias) : tf.tensor2d(bias),
    weights:
      typeof weights === 'number' ? tf.scalar(weights) : tf.tensor2d(weights),
  }));
}

export function input_layer(size: number): Layer {
  return hidden_layer(size);
}

export function hidden_layer(size: number): Layer {
  return {
    units: size,
    bias: tf.scalar(0),
    weights: tf.scalar(0),
  };
}

export function output_layer(size: number) {
  return {
    units: size,
    bias: tf.scalar(0),
    weights: tf.scalar(0),
  };
}

function activate(x: tf.Tensor, network: Layer[]): ActivatedLayer[] {
  if (network.length === 1) {
    return [{ activations: x, ...network[0] }];
  }

  const [input, ...rest] = network;

  const z = input.weights.dot(x).add(input.bias);
  const activations = z.sigmoid();

  return [{ activations: x, ...input }, ...activate(activations, rest)];
}

export function cost(xs: tf.Tensor, y: tf.Tensor, network: Layer[]): tf.Tensor {
  const x_features = xs.transpose().split(xs.shape[0], 1);
  const y_targets = y.split(y.shape[0], 0);

  const scores = x_features.map((x, index) => {
    const activations = activate(x, network);
    const output = activations[activations.length - 1].activations;

    return output.add(y_targets[index].mul(-1));
  });

  return tf
    .concat(scores)
    .norm('euclidean')
    .square()
    .mul(1 / 2);
}

export type Layer = {
  units: number;
  bias: tf.Tensor;
  weights: tf.Tensor;
};

type ActivatedLayer = Layer & {
  activations: tf.Tensor;
};

export function predict(xs: tf.Tensor, network: Layer[]): tf.Tensor {
  const activated = activate(xs, network);

  return activated[activated.length - 1].activations;
}

export function learn(
  xs: tf.Tensor,
  y: tf.Tensor,
  network: Layer[],
  epoch = 0,
  total = 100
): Layer[] {
  if (epoch === total) {
    return network;
  }

  const x_features = xs.transpose().split(xs.shape[0], 1);
  const y_targets = y.split(y.shape[0], 0);
  const index = epoch % x_features.length;

  const activations = activate(x_features[index], network);
  const updated = propagate(y_targets[index], activations);

  return learn(xs, y, updated, epoch + 1, total);
}

function propagate(y: tf.Tensor, network: ActivatedLayer[]): Layer[] {
  const { configured, delta } = output(y, network);
  const rest = hidden(network, delta);

  return [...rest, ...configured];
}

const LR = 1;

function output(y: tf.Tensor, network: ActivatedLayer[]) {
  const curr = network.length - 1;
  const curr_x = network[curr].activations;

  const curr_delta = curr_x
    .add(y.transpose().mul(-1))
    .mul(curr_x)
    .mul(tf.scalar(1).add(curr_x.mul(-1)));

  const prev = curr - 1;
  const prev_x = network[prev].activations;
  const prev_weights_slope = curr_delta.dot(prev_x.transpose());
  const prev_b_slope = curr_delta;

  return {
    configured: [
      {
        units: network[prev].units,
        weights: network[prev].weights.add(prev_weights_slope.mul(LR).mul(-1)),
        bias: network[prev].bias.add(prev_b_slope.mul(LR).mul(-1)),
      },
      {
        units: network[curr].units,
        weights: network[curr].weights,
        bias: network[curr].bias,
      },
    ],
    delta: curr_delta,
  };
}

function hidden(
  network: ActivatedLayer[],
  next_delta: tf.Tensor,
  curr = network.length - 2
): Layer[] {
  if (curr === 0) {
    return [];
  }

  const curr_weights = network[curr].weights;
  const curr_x = network[curr].activations;

  const curr_delta = curr_weights
    .transpose()
    .dot(next_delta)
    .mul(curr_x)
    .mul(tf.scalar(1).add(curr_x.mul(-1)));

  const prev = curr - 1;
  const prev_x = network[prev].activations;
  const prev_weights_slope = curr_delta.dot(prev_x.transpose());
  const prev_b_slope = curr_delta;

  return [
    ...hidden(network, curr_delta, prev),
    {
      units: network[prev].units,
      weights: network[prev].weights.add(prev_weights_slope.mul(LR).mul(-1)),
      bias: network[prev].bias.add(prev_b_slope.mul(LR).mul(-1)),
    },
  ];
}
