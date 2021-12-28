import React, { useEffect } from 'react';
import { wait } from '../utils';
import { renderReact } from './utils';

test('It allows to define on did mount callback', async () => {
  const reactOnDidMount = jest.fn();
  const ui = React.createElement(() => {
    useEffect(reactOnDidMount, []);

    return <div />;
  });

  console.log(reactOnDidMount.mock.calls);

  const r = renderReact(ui);
  await wait(0);

  console.log(reactOnDidMount.mock.calls);
});