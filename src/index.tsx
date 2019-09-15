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

export type Dispatcher<State> = Dispatch<SetStateAction<State>>;
export type StateOperator<State> = [State, Dispatcher<State>, Dispatcher<State>];

export interface Hoox<State> {
  Provider: (props: ProviderProps<State>) => JSX.Element
  useHooxState: () => StateOperator<State>
  getHooxState: () => StateOperator<State>
  getSetState: () => Dispatcher<State>
  getResetState: () => Dispatcher<State>
  setHooxState: Dispatcher<State>
  resetHooxState: Dispatcher<State>
  createContainer: (
    Component: React.FunctionComponent<{}>,
    initialState?: State
  ) => <Props = {}>(props: Props) => JSX.Element
}

export default function hoox<State>(state: State): Hoox<State> {
  if (!isPlainObject(state)) {
    throw new Error('state is not plain object');
  }

  const result: {
    [key: string]: any
  } = {};

  const StateContext = createContext({} as any);
  let stateRef: State;
  let setHooxState: Dispatcher<State>;
  let resetHooxState: Dispatcher<State>;

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

      result.resetHooxState = setState;
      result.setHooxState = setHooxState;
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

  function useHooxState(): StateOperator<State> {
    const hooxState = useContext(StateContext);
    return [hooxState, setHooxState, resetHooxState];
  }

  function getHooxState(): StateOperator<State> {
    return [stateRef, setHooxState, resetHooxState];
  }

  function getResetState() {
    return resetHooxState;
  }

  function getSetState() {
    return setHooxState;
  }

  result.Provider = Provider;
  result.getResetState = getResetState;
  result.getSetState = getSetState;
  result.getHooxState = getHooxState;
  result.useHooxState = useHooxState;
  result.createContainer = createContainer;

  return result as Hoox<State>;
}
