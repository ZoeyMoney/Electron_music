declare module 'redux-persist/integration/react' {
  import * as React from 'react';
  import { Persistor } from 'redux-persist';

  interface PersistGateProps {
    loading?: React.ReactNode;
    children?: React.ReactNode;
    persistor: Persistor;
    onBeforeLift?: () => Promise<never> | void;
  }

  export class PersistGate extends React.Component<PersistGateProps> {}
}
