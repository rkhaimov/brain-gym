interface Nat {
  <TR>(onSuccessor: (tail: Nat) => TR, onZero: () => TR): TR;
}

const yes = () => {};
const no = () => {};

const zero: Nat = (onNotZero, onZero) => onZero();

const succ =
  (n: Nat): Nat =>
  (onSuccessor) =>
    onSuccessor(n);

const pred = (n: Nat): Nat =>
  n(
    (tail) => tail,
    () => zero
  );

const add = (left: Nat, right: Nat): Nat =>
  right(
    (tail) => add(succ(left), tail),
    () => left
  );

const multiply = (n: Nat, times: Nat): Nat =>
  n(
    () =>
      times(
        () => add(n, multiply(n, pred(times))),
        () => zero
      ),
    () => zero
  );

const sub = (left: Nat, right: Nat): Nat =>
  right(
    (tail) => sub(pred(left), tail),
    () => left
  );

const humanize = (n: Nat): number =>
  n(
    (tail) => 1 + humanize(tail),
    () => 0
  );

const isZero = (n: Nat) =>
  n(
    (tail) => no,
    () => yes
  );

const equals = (left: Nat, right: Nat): ReturnType<typeof isZero> =>
  left(
    () =>
      right(
        () => equals(pred(left), pred(right)),
        () => no
      ),
    () =>
      right(
        () => no,
        () => yes
      )
  );

const one = succ(zero);
const two = succ(one);

const three = add(one, two);
const five = add(three, two);

console.log(humanize(multiply(five, three)));

console.log(isZero(zero) === yes);
console.log(isZero(one) === no);
console.log(isZero(pred(one)) === yes);
console.log(isZero(pred(two)) === no);
console.log(isZero(pred(pred(two))) === yes);
console.log(isZero(pred(pred(pred(two)))) === yes);
