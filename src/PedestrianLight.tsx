import React from 'react';

import { ReactComponent as PedestrianSVG } from './pedestrian.svg';

type Props = {
  color: string;
  active: boolean;
};

export const PedestrianLight: React.FC<Props> = ({ active, color }) => {
  const activeness = active ? { fill: color, stroke: color } : {};

  return (
    <div
      style={{
        borderRadius: '50%',
        height: 50,
        width: 50,
        margin: '10px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PedestrianSVG style={{ fontSize: 40, ...activeness }} />
    </div>
  );
};
