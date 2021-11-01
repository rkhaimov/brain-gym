import { times } from './utils';

const c0 = createNetwork().addInput(2).addOutput(1).commit();

fit(c0, [[0, 0]], [11]);

function fit(network: Network, X: [number, number][], y: number[]) {
  // Generate weights for each connection
  const weighted = network.map((layer, index) => {
    if (index === network.length - 1) {
      return layer.map((neuron) => ({ ...neuron, weights: [] }));
    }

    return layer.map((neuron) => ({
      ...neuron,
      weights: times(network[index + 1].length, () => Math.random()),
    }));
  });

  console.log(cost(evaluate(weighted, [2, 4]), [11]));
}

// I probably should come up with a better model for network
// function slopeAt

function cost(actual: number[], expected: number[]) {
  return actual
    .map((left, index) => Math.pow(left - expected[index], 2))
    .reduce((result, left) => result + left, 0);
}

function evaluate(network: WeightedNetwork, x: [number, number]) {
  return network.reduce((output, currLayer, layerIndex) => {
    const nextLayer = network[layerIndex + 1];

    if (nextLayer === undefined) {
      return output;
    }

    return nextLayer.map((_, nextLayerNeuronIndex) =>
      currLayer.reduce(
        (currLayerNeuronResult, currLayerNeuron, currLayerNeuronIndex) =>
          currLayerNeuronResult +
          currLayerNeuron.weights[nextLayerNeuronIndex] *
            output[currLayerNeuronIndex],
        0
      )
    );
  }, x as number[]);
}

function createNetwork() {
  const network: Array<Array<{ type: 'input' | 'output' }>> = [];

  const result = {
    addInput: (count: number) => {
      network.push(times(count, () => ({ type: 'input' })));

      return result;
    },
    addOutput: (count: number) => {
      network.push(times(count, () => ({ type: 'output' })));

      return result;
    },
    commit: () => {
      return network;
    },
  };

  return result;
}

export {};

type Network = Array<Array<{ type: 'input' | 'output' }>>;

type WeightedNetwork = Array<
  Array<{ type: 'input' | 'output'; weights: number[] }>
>;
