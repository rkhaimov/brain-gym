import { list } from '../types/list';
import { TypeNode } from '../core';
import { toReadableErrors } from './error';
import { or } from '../hot/or';
import { struct } from '../types/struct';
import { translateTo } from '../operators/translateTo';
import { moreThan } from '../operators/moreThan';
import { number } from '../types/number';
import { string } from '../types/string';
import { validate } from '../validate';
import { lessThan } from '../operators/lessThan';

test('allows to provide error message for primitives', () => {
  const tn = number().pipe(
    moreThan(10),
    lessThan(15),
    translateTo({
      moreThan: (n) => `Should be greater than ${n}`,
      lessThan: (n) => `Should be lesser than ${n}`,
    })
  );

  expect(tvalidate(tn, 2)).toMatchInlineSnapshot(`"Should be greater than 10"`);

  expect(tvalidate(tn, 20)).toMatchInlineSnapshot(`"Should be lesser than 15"`);

  const rtn = tn.pipe(
    translateTo({
      lessThan: (n) => `Please, provide value lesser than ${n}`,
    })
  );

  expect(tvalidate(rtn, 20)).toMatchInlineSnapshot(
    `"Please, provide value lesser than 15"`
  );

  const rrtn = rtn.pipe(lessThan(15));

  expect(tvalidate(rrtn, 16)).toMatchInlineSnapshot(
    `"Please, provide value lesser than 15"`
  );
});

test('allows to provide error message for containers', () => {
  const tn = list(string()).pipe(
    translateTo({ string: () => 'Provide a string' })
  );

  expect(tvalidate(tn, [0])).toMatchInlineSnapshot(`"[0]: Provide a string"`);

  const rtn = tn.pipe(
    translateTo({ string: () => 'Please, provide a string' })
  );

  expect(tvalidate(rtn, [0])).toMatchInlineSnapshot(
    `"[0]: Please, provide a string"`
  );
});

test('allows to provide specific error messages for container`s children', () => {
  const tn0 = list(string()).pipe(
    translateTo({ string: () => 'Provide a string' })
  );

  expect(tvalidate(tn0, [0])).toMatchInlineSnapshot(`"[0]: Provide a string"`);

  const tn1 = list(
    string().pipe(translateTo({ string: () => 'Please, provide a string' }))
  ).pipe(translateTo({ string: () => 'Provide a string' }));

  expect(tvalidate(tn1, [0])).toMatchInlineSnapshot(
    `"[0]: Please, provide a string"`
  );
});

test('copies internal translations when extending struct', () => {
  const left = struct({
    age: number().pipe(translateTo({ number: () => 'left age' })),
    weight: number().pipe(translateTo({ number: () => 'left weight' })),
  });

  const right = struct({
    age: number().pipe(translateTo({ number: () => 'right age' })),
    height: number().pipe(translateTo({ number: () => 'right height' })),
  });

  const tn = struct({ ...left.children(), ...right.children() });

  expect(tvalidate(tn, {})).toMatchInlineSnapshot(`
    "age: right age
    weight: left weight
    height: right height"
  `);
});

test('external messages works like fallbacks in struct', () => {
  const tn = struct({
    age: number().pipe(translateTo({ number: () => 'Age should be a number' })),
    weight: number(),
  }).pipe(translateTo({ number: () => 'Not a number' }));

  expect(tvalidate(tn, {})).toMatchInlineSnapshot(`
    "age: Age should be a number
    weight: Not a number"
  `);
});

test('tn messages in records can be rewritten', () => {
  const otn = struct({
    age: number().pipe(translateTo({ number: () => 'Age should be a number' })),
    weight: number(),
  });

  const rtn = struct({
    ...otn.children(),
    weight: otn
      .children()
      .weight.pipe(translateTo({ number: () => 'Weight should be a number' })),
  });

  expect(tvalidate(rtn, {})).toMatchInlineSnapshot(`
    "age: Age should be a number
    weight: Weight should be a number"
  `);
});

test('"or" persists original messages and provide fallbacks', () => {
  const left = struct({
    age: number().pipe(
      moreThan(0),
      translateTo({ moreThan: () => 'Age is too small' })
    ),
  });

  const right = struct({ weight: number().pipe(moreThan(5)) });

  const tn = or(left, right).pipe(
    translateTo({
      number: () => 'Not a number',
      moreThan: (n) => `Should be greater than ${n}`,
    })
  );

  expect(tvalidate(tn, {})).toMatchInlineSnapshot(`
    "age: Not a number
    weight: Not a number"
  `);

  expect(tvalidate(tn, { weight: 3 })).toMatchInlineSnapshot(`
    "age: Not a number
    weight: Should be greater than 5"
  `);

  expect(tvalidate(tn, { age: -3 })).toMatchInlineSnapshot(`
    "age: Age is too small
    weight: Not a number"
  `);
});

function tvalidate(tn: TypeNode, value: unknown): string {
  return toReadableErrors(validate(tn, value));
}
