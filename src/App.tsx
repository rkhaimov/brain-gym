import React, { useState } from 'react';
import { World } from './World';
import { Controls } from './Controls';
import { LightsBody } from './LightsBody';
import { PedestrianLight } from './PedestrianLight';
import { PedestrianTimer } from './PedestrianTimer';

type LightsState = { type: 'stand' } | { type: 'walk'; timer: number };

export const App = () => {
  const [state, setState] = useState<LightsState>({ type: 'stand' });

  return (
    <World>
      <Controls>
        <Controls.Control onClick={() => setState({ type: 'stand' })}>
          STANDING
        </Controls.Control>
        <Controls.Control onClick={() => setState({ type: 'walk', timer: 10 })}>
          WALKING
        </Controls.Control>
      </Controls>
      <LightsBody>
        <PedestrianLight color="red" active={state.type === 'stand'} />
        {state.type === 'stand' ? (
          <PedestrianTimer type="idle" />
        ) : (
          <PedestrianTimer type="active" timer={state.timer} />
        )}
        <PedestrianLight color="green" active={state.type === 'walk'} />
      </LightsBody>
    </World>
  );
};
