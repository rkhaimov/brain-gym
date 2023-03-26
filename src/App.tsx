import React, { useState } from 'react';
import { World } from './World';
import { Controls } from './Controls';
import { PedestrianTrafficLight } from './PedestrianTrafficLight';

type LightsState = { type: 'stand' } | { type: 'walk' };

export const App = () => {
  const [state, setState] = useState<LightsState>({ type: 'stand' });

  return (
    <World>
      <Controls>
        <Controls.Control onClick={() => setState({ type: 'stand' })}>
          STANDING
        </Controls.Control>
        <Controls.Control onClick={() => setState({ type: 'walk' })}>
          WALKING
        </Controls.Control>
      </Controls>
      <PedestrianTrafficLight
        standing={state.type === 'stand'}
        walking={state.type === 'walk'}
      />
    </World>
  );
};
