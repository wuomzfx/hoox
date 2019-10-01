import * as React from 'react';
import {
  FC,
  useMemo,
  useState,
  ReactNode,
  useContext,
  createContext,
  ComponentType,
} from 'react';

import { isPlainObject } from './utils';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type GetProps<C> = C extends ComponentType<infer P> ? P : never;

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

export default function createHoox<State>(state: State) {
  if (!isPlainObject(state)) {
    throw new Error('state is not plain object');
  }

  const StateContext = createContext({} as any);
  let stateRef: State;
  let setHoox: Patch<State>;
  let resetHoox: Dispatch<State>;

  const Provider: FC<{
    initialState?: State
    children: ReactNode
  }> = function ({ initialState, children }) {
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
  };

  function createContainer<Props>(
    Component: ComponentType<Props>,
    initialState?: State,
  ) {
    return function HookStoreContainer(props: Props) {
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

  function connect<InjectProps = {}>(
    mapStateToProps: (state: State) => InjectProps,
  ) {
    return function connectComponent<C extends ComponentType<GetProps<C>>>(
      Component: C,
    ) {
      type OriginProps = GetProps<C>;
      type ConnectedComponentProps = Omit<OriginProps, keyof InjectProps>;
      const ConnectedComponent: FC<ConnectedComponentProps> = function (props) {
        const [hooxState] = useHoox();
        const injectProps: InjectProps = useMemo(
          () => mapStateToProps(hooxState),
          [hooxState],
        );

        const allProps = {
          ...injectProps,
          ...props,
        } as OriginProps;

        return <Component {...allProps} />;
      };

      ConnectedComponent.displayName = `Connect(${Component.name})`;

      return ConnectedComponent;
    };
  }

  const safeSetHoox: typeof setHoox = patch => getSetState()(patch);
  const safeReSetHoox: typeof resetHoox = dispatch => getResetState()(dispatch);

  return {
    Provider,
    useHoox,
    getHoox,
    setHoox: safeSetHoox,
    resetHoox: safeReSetHoox,
    connect,
    createContainer,
  };
}
