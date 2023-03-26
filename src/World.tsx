import React, { PropsWithChildren } from 'react';

export const World: React.FC<PropsWithChildren> = ({children}) => (
  <div style={{display: 'flex'}}>{children}</div>
);
