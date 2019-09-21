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
  useHoox: () => StateOperator<State>
  getHoox: () => StateOperator<State>
  setHoox: Dispatcher<State>
  resetHoox: Dispatcher<State>
  createContainer: (
    Component: React.FunctionComponent<{}>,
    initialState?: State
  ) => <Props = {}>(props: Props) => JSX.Element
}

export default function createHoox<State>(state: State): Hoox<State> {
  if (!isPlainObject(state)) {
    throw new Error('state is not plain object');
  }

  const StateContext = createContext({} as any);
  let stateRef: State;
  let setHoox: Dispatcher<State>;
  let resetHoox: Dispatcher<State>;

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

    // init setHoox and resetHoox
    useMemo(() => {
      function combineState(oldState: State, newState: State) {
        return {
          ...oldState,
          ...newState,
        };
      }
      setHoox = newState => {
        if (typeof newState === 'function') {
          return setState((oldState: State) => {
            const newStateResult = (newState as Function)(oldState);
            return combineState(oldState, newStateResult);
          });
        }
        return setState(oldState => combineState(oldState, newState));
      };

      resetHoox = setState;
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

  function useHoox(): StateOperator<State> {
    const hooxState = useContext(StateContext);
    return [hooxState, setHoox, resetHoox];
  }

  function getHoox(): StateOperator<State> {
    return [stateRef, setHoox, resetHoox];
  }

  function getResetState() {
    return resetHoox;
  }

  function getSetState() {
    return setHoox;
  }

  return {
    Provider,
    useHoox,
    getHoox,
    setHoox: (newState: SetStateAction<State>) => getSetState()(newState),
    resetHoox: (newState: SetStateAction<State>) => getResetState()(newState),
    createContainer,
  };
}
