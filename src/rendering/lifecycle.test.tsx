import React, { useState } from 'react';
import { renderReact } from './utils';
import { findAllByRole } from '@testing-library/dom';
import { first, last } from 'lodash-es';
import userEvent from '@testing-library/user-event';

test('It allows to define sf components', async () => {
  const outputs: string[] = [];
  const reactUI = renderReact(last(EXAMPLES) as JSX.Element);

  outputs.push(reactUI.output);

  await reactUI.act(async () => {
    const button = await findAllByRole(reactUI.container, 'button');
    userEvent.click(last(button) as HTMLButtonElement);
  });

  outputs.push(reactUI.output);

  await reactUI.act(async () => {
    const button = await findAllByRole(reactUI.container, 'button');
    userEvent.click(first(button) as HTMLButtonElement);
  });

  outputs.push(reactUI.output);

  console.log(outputs.join('\n\n'));
});

const Toggle: React.FC = () => {
  const [toggled, setToggle] = useState(false);

  return (
    <button onClick={() => setToggle(!toggled)}>
      {toggled ? 'Toggled' : 'Untoggled'}
    </button>
  );
};

const FraudToggle: React.FC = () => {
  const [toggled, setToggle] = useState(false);

  return (
    <button onClick={() => setToggle(!toggled)}>
      {toggled ? 'FraudToggle Toggled' : 'FraudToggle Untoggled'}
    </button>
  );
};

const EXAMPLES = [
  // Acts like completely different elements (each with it's own state)
  React.createElement(() => {
    const [shown, setShown] = useState(true);

    const toggle = <Toggle />;

    if (shown) {
      return (
        <div>
          <button onClick={() => setShown(false)}>Remove</button>
          {toggle}
          {toggle}
        </div>
      );
    }

    return (
      <div>
        <button onClick={() => setShown(false)}>Remove</button>
        {toggle}
      </div>
    );
  }),
  // But when key is there it act's like identifier (like variable name for state)
  React.createElement(() => {
    const [shown, setShown] = useState(true);

    if (shown) {
      return (
        <div>
          <button onClick={() => setShown(false)}>Remove</button>
          <Toggle />
          <Toggle key={1} />
        </div>
      );
    }

    return (
      <div>
        <button onClick={() => setShown(false)}>Remove</button>
        <Toggle key={1} />
      </div>
    );
  }),
  // Key is seams to be ignored when element type (function reference) is different
  React.createElement(() => {
    const [shown, setShown] = useState(true);

    if (shown) {
      return (
        <div>
          <button onClick={() => setShown(false)}>Remove</button>
          <Toggle />
          <Toggle key={1} />
        </div>
      );
    }

    return (
      <div>
        <button onClick={() => setShown(false)}>Remove</button>
        <FraudToggle key={1} />
      </div>
    );
  }),
  // State is being resolved lazily, when each node is matched against the DOM
  React.createElement(() => {
    const [shown, setShown] = useState(true);

    if (shown) {
      return (
        <div>
          <button onClick={() => setShown(false)}>Remove</button>
          <Toggle />
          <Toggle key={1} />
        </div>
      );
    }

    return (
      <div>
        <Toggle key={1} />
      </div>
    );
  }),
  // It compares children element wise from top to the bottom
  React.createElement(() => {
    const [shown, setShown] = useState(true);

    if (shown) {
      return (
        <div>
          <button onClick={() => setShown(false)}>Remove</button>
          <Toggle />
          <div />
          <Toggle />
        </div>
      );
    }

    return (
      <div>
        <button onClick={() => setShown(false)}>Remove</button>
        <div />
        <main />
        <Toggle />
      </div>
    );
  }),
  // When function reference is different, it will consider element as different
  React.createElement(() => {
    const [shown, setShown] = useState(true);

    if (shown) {
      return (
        <div>
          <button onClick={() => setShown(false)}>Remove</button>
          <Toggle />
          <Toggle />
        </div>
      );
    }

    return (
      <div>
        <button onClick={() => setShown(false)}>Remove</button>
        <Toggle />
        <Toggle />
      </div>
    );

    function Toggle(): JSX.Element {
      const [toggled, setToggle] = useState(false);

      return (
        <button onClick={() => setToggle(!toggled)}>
          {toggled ? 'Toggled' : 'Untoggled'}
        </button>
      );
    }
  }),
] as const;
