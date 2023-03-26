import React, { useState } from 'react';
import { World } from './World';
import { Controls } from './Controls';
import { PedestrianTrafficLight } from './PedestrianTrafficLight';

type LightsState = 'STAND' | 'WALK';

export const App = () => {
  const [state, setState] = useState<LightsState>('STAND');

  return (
    <World>
      <Controls>
        <Controls.Control onClick={() => setState('STAND')}>
          STANDING
        </Controls.Control>
        <Controls.Control onClick={() => setState('WALK')}>
          WALKING
        </Controls.Control>
      </Controls>
      <PedestrianTrafficLight
        standing={state === 'STAND'}
        walking={state === 'WALK'}
      />
    </World>
  );
};
