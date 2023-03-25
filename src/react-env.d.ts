declare module '*.svg' {
  import React, { CSSProperties } from 'react';

  export const ReactComponent: React.FC<{ style?: CSSProperties }>;
}
