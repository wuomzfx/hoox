import * as React from 'react';
import {
  FC,
  useMemo,
  Dispatch,
  useState,
  ReactNode,
  useContext,
  createContext,
  SetStateAction,
} from 'react';

import { isPlainObject } from './utils';

export interface ProviderProps<State> {
  initialState?: State
  children: ReactNode
}

export default function hoox<State>(state: State) {
  if (!isPlainObject(state)) {
    throw new Error('state is not plain object');
  }
  const StateContext = createContext({} as any);
  let stateRef: State;
  let setHooxState: Dispatch<SetStateAction<State>>;
  let resetHooxState: Dispatch<SetStateAction<State>>;

  function Provider({ initialState, children }: ProviderProps<State>) {
    const [hooxState, setState] = useState(() => {
      if (initialState === undefined) {
        return {
          ...state,
        };
      }
      // combine initialState
      return {
        ...state,
        ...initialState,
      };
    });

    stateRef = hooxState;

    // init setHooxState and resetHooxState
    useMemo(() => {
      function combineState(oldState: State, newState: State) {
        return {
          ...oldState,
          ...newState,
        };
      }
      setHooxState = newState => {
        if (typeof newState === 'function') {
          return setState((oldState: State) => {
            const newStateResult = (newState as Function)(oldState);
            return combineState(oldState, newStateResult);
          });
        }
        return setState(oldState => combineState(oldState, newState));
      };

      resetHooxState = setState;
    }, []);

    return (
      <StateContext.Provider value={hooxState}>
        {children}
      </StateContext.Provider>
    );
  }

  function createContainer(Component: FC, initialState?: State) {
    return function HookStoreContainer<Props = {}>(props: Props) {
      return (
        <Provider initialState={initialState}>
          <Component {...props} />
        </Provider>
      );
    };
  }

  function useHooxState(): [State, typeof setHooxState, typeof resetHooxState] {
    const hooxState = useContext(StateContext);
    return [hooxState, setHooxState, resetHooxState];
  }

  function getHooxState(): [State, typeof setHooxState, typeof resetHooxState] {
    return [stateRef, setHooxState, resetHooxState];
  }

  function getResetState() {
    return resetHooxState;
  }

  function getSetState() {
    return setHooxState;
  }

  return {
    Provider,
    useHooxState,
    getHooxState,
    getSetState,
    getResetState,
    createContainer,
  };
}
