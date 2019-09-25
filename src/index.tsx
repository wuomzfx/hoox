import * as React from 'react';
import {
  FC,
  useMemo,
  useState,
  ReactNode,
  useContext,
  createContext,
} from 'react';

import { isPlainObject } from './utils';

export interface ProviderProps<State> {
  initialState?: State
  children: ReactNode
}

export type Dispatch<State> = (
  state: State | ((prevState: State) => State)
) => void;

export type Patch<State> = (
  patch: Partial<State> | ((prevState: State) => Partial<State>)
) => void;

export type StateOperator<State> = [State, Patch<State>, Dispatch<State>];

export interface Hoox<State extends Object> {
  Provider: (props: ProviderProps<State>) => JSX.Element
  useHoox: () => StateOperator<State>
  getHoox: () => StateOperator<State>
  setHoox: Patch<State>
  resetHoox: Dispatch<State>
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
  let setHoox: Patch<State>;
  let resetHoox: Dispatch<State>;

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
      setHoox = patch => setState(prevState => Object.assign(
        {},
        prevState,
        patch instanceof Function ? patch(prevState) : patch,
      ));

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
    setHoox: newState => getSetState()(newState),
    resetHoox: newState => getResetState()(newState),
    createContainer,
  };
}
