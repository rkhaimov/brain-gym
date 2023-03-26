import React, { useState } from 'react';
import { World } from './World';
import { Controls } from './Controls';
import { PedestrianTrafficLight } from './PedestrianTrafficLight';
import { not } from './not';

export const App = () => {
  const [standing, setStanding] = useState(false);

  return (
    <World>
      <Controls>
        <Controls.Control onClick={() => setStanding(true)}>
          STANDING
        </Controls.Control>
        <Controls.Control onClick={() => setStanding(false)}>
          WALKING
        </Controls.Control>
      </Controls>
      <PedestrianTrafficLight standing={standing} walking={not(standing)} />
    </World>
  );
};
