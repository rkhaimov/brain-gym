import React from 'react';

type Props = { type: 'idle' } | { type: 'active'; timer: number };

export const PedestrianTimer: React.FC<Props> = (props) => {
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
      {props.type === 'idle' ? undefined : (
        <span style={{ fontSize: 40, fontFamily: 'Roboto', color: 'aqua' }}>
          {props.timer}
        </span>
      )}
    </div>
  );
};
