type ConsumableApple = {
  sweetness: number;
};

type ColorizedApple = {
  color: string;
};

let left0: ConsumableApple;
let right0: ColorizedApple;

const test = { sweetness: 1, color: '123' };

left0 = test;
right0 = test;

function act(input: ConsumableApple & ColorizedApple) {
  input;
}

class ConsumableApple0 {
  constructor(public sweetness: number) {}
}

class ColorizedApple0 extends ConsumableApple0 {
  constructor(public color: string, sweetness: number) {
    super(sweetness);
  }
}

function act0(input: ColorizedApple0) {
  input;
}

type Left0 = {
  first: {
    sweetness: number;
  };
};

type Right0 = {
  first: {
    color: string;
  };
};

declare let n0: Left0 & Right0;

n0.first;

type Card = {
  magic: number;
  id: number;
  value: number;
};

type Cash = {
  magic: string;
  amount: number;
  value: number;
};

type Hmm = number & { operation: number };

function act2(m: Hmm) {
  Math.pow(m, 2);

  m.operation;
  m;

  return m + m;
}

function act1(input: Card | Cash) {
  input.value;
}

declare let n1: Cash & Card;

n1 = {
  value: 1,
  amount: 12,
  id: 412,
  magic: 1,
};

act1(n1);

type Card0 = {
  tag: 'Card0';
  id: number;
  value: number;
};

type Cash0 = {
  tag: 'Cash0';
  amount: number;
  value: number;
};

type Talking0 = {
  tag: 'Talking0';
  amount: number;
  value: number;
};

type PaymentMethod = Card0 | Cash0 | Talking0;

declare const n4: Card0 | Cash0 | Talking0;

act4(n4);

function act4(input: Card0 | Cash0) {}

function act5(input: Card0 | Cash0 | Talking0) {}

function act3(input: PaymentMethod): string {
  switch (input.tag) {
    case 'Card0':
      return `Card with ${input.id} number`;
    case 'Cash0':
      return `Cash with ${input.amount} bucks`;
  }
}

declare function assertIsNever(input: never): never;

class PaymentMethod {
  constructor(public value: number) {}
}

class CardMethod extends PaymentMethod {
  constructor(public id: number, value: number) {
    super(value);
  }
}

class CashMethod extends PaymentMethod {
  constructor(public id: number, value: number) {
    super(value);
  }
}

function act2(input: PaymentMethod) {
  if (input instanceof CardMethod) {
    input;
  }
}
