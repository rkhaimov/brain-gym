import React from 'react';
import { PedestrianLight } from './PedestrianLight';
import { LightsBody } from './LightsBody';

export const App = () => {
  return (
    <div>
      <PedestrianTrafficLight standing walking />
    </div>
  );
};

type Props = {
  walking: boolean;
  standing: boolean;
};

const PedestrianTrafficLight: React.FC<Props> = ({ standing, walking }) => (
  <LightsBody>
    <PedestrianLight color="red" active={standing} />
    <PedestrianLight color="green" active={walking} />
  </LightsBody>
);
