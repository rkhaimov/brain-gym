import React, { PropsWithChildren } from 'react';

export const LightsBody: React.FC<PropsWithChildren> = ({ children }) => (
  <div
    style={{
      backgroundColor: 'black',
      padding: '0 5px',
      display: 'inline-block',
      borderRadius: 10,
    }}
  >
    {children}
  </div>
);
