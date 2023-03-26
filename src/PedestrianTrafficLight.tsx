import React from 'react';
import { LightsBody } from './LightsBody';
import { PedestrianLight } from './PedestrianLight';

type Props = {
  walking: boolean;
  standing: boolean;
};

export const PedestrianTrafficLight: React.FC<Props> = ({
  standing,
  walking,
}) => (
  <LightsBody>
    <PedestrianLight color="red" active={standing} />
    <PedestrianLight color="green" active={walking} />
  </LightsBody>
);
