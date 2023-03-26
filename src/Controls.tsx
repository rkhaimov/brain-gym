import React, { PropsWithChildren } from 'react';

export function Controls({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: '0 10px',
        justifyContent: 'space-around',
      }}
    >
      {children}
    </div>
  );
}

Controls.Control = ({
  children,
  onClick,
}: PropsWithChildren & { onClick(): void }) => (
  <button onClick={onClick} style={{ padding: 10 }}>
    {children}
  </button>
);
