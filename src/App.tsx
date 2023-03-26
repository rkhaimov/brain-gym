import React, { useState } from 'react';
import { World } from './World';
import { Controls } from './Controls';
import { PedestrianTrafficLight } from './PedestrianTrafficLight';

export const App = () => {
  const [standing, setStanding] = useState(false);
  const [walking, setWalking] = useState(false);

  return (
    <World>
      <Controls>
        <Controls.Control onClick={() => setStanding(true)}>
          STANDING
        </Controls.Control>
        <Controls.Control onClick={() => setWalking(true)}>
          WALKING
        </Controls.Control>
      </Controls>
      <PedestrianTrafficLight standing={standing} walking={walking} />
    </World>
  );
};
