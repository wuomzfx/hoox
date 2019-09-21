import * as React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-test-renderer';
import createStore from '../src';
import {
  up,
  asyncUp,
  Provider,
  setHoox,
  resetHoox,
  useHoox,
  useDoubleCount,
  createContainer,
} from './stores/counter';

const RootWrapper = (props: any) => <div>{props.children}</div>;

function Child() {
  const doubleCount = useDoubleCount();
  return <div data-testid="double-count">{doubleCount}</div>;
}

function Counter() {
  const [state, setState, resetState] = useHoox();

  return (
    <div>
      <div data-testid="count">{state.count}</div>
      <div data-testid="up" onClick={() => up()} />
      <div data-testid="set" onClick={() => setState({ count: 10 })} />
      <div data-testid="reset" onClick={() => resetState({ count: 0 })} />
      <div data-testid="set2" onClick={() => setHoox({ count: 20 })} />
      <div data-testid="reset2" onClick={() => resetHoox({ count: 0 })} />
      <Child />
    </div>
  );
}

afterEach(cleanup);

describe('init', () => {
  test('excute createStore error', () => {
    expect(() => createStore(null)).toThrow();
  });

  test('createContainer', () => {
    const wrapper = createContainer(RootWrapper);
    const { result } = renderHook(() => useHoox(), { wrapper });
    const [state] = result.current;
    expect(state).toEqual({ count: 1 });
  });

  test('createContainer with initialState', () => {
    const wrapper = createContainer(RootWrapper, { count: 2 });
    const { result } = renderHook(() => useHoox(), { wrapper });
    const [state] = result.current;
    expect(state).toEqual({ count: 2 });
  });

  test('Provider with initialState', () => {
    const { getByTestId } = render(
      <Provider initialState={{ count: 2 }}>
        <Counter />
      </Provider>,
    );
    expect(getByTestId('count').innerHTML).toBe('2');
  });
});

describe('useHoox', () => {
  test('get state', () => {
    const wrapper = createContainer(RootWrapper);
    const { result } = renderHook(() => useHoox(), { wrapper });
    const [state] = result.current;
    expect(state).toEqual({ count: 1 });
  });

  test('set state', () => {
    const wrapper = createContainer(RootWrapper);
    const { result } = renderHook(() => useHoox(), { wrapper });
    const [, setState] = result.current;

    act(() => {
      setState({ count: 2 });
    });

    const [state] = result.current;
    expect(state).toEqual({ count: 2 });
  });
});

describe('useSelfHook', () => {
  test('useDoubleCount', () => {
    const wrapper = createContainer(RootWrapper);
    const { result } = renderHook(() => useDoubleCount(), { wrapper });

    const doubleCount = result.current;
    expect(doubleCount).toEqual(2);
  });
});

describe('useActions', () => {
  test('up', () => {
    const wrapper = createContainer(RootWrapper);
    const { result } = renderHook(() => useHoox(), { wrapper });

    act(() => {
      up();
    });

    const [state] = result.current;
    expect(state).toEqual({ count: 2 });
  });

  test('asyncUp', async () => {
    const wrapper = createContainer(RootWrapper);
    const { result } = renderHook(() => useHoox(), { wrapper });

    await act(async () => {
      await asyncUp(100);
    });

    const [state] = result.current;
    expect(state).toEqual({ count: 2 });
  });
});

describe('child render', () => {
  test('render', () => {
    const Container = createContainer(Counter);
    const { getByTestId } = render(<Container />);
    expect(getByTestId('count').innerHTML).toBe('1');
    expect(getByTestId('double-count').innerHTML).toBe('2');
  });

  test('rerender', () => {
    const Container = createContainer(Counter);
    const { getByTestId } = render(<Container />);
    fireEvent.click(getByTestId('up'));
    expect(getByTestId('count').innerHTML).toBe('2');
    expect(getByTestId('double-count').innerHTML).toBe('4');
  });
});

describe('reset state', () => {
  test('resetState from useHoox', () => {
    const Container = createContainer(Counter);
    const { getByTestId } = render(<Container />);
    fireEvent.click(getByTestId('reset'));
    expect(getByTestId('count').innerHTML).toBe('0');
    expect(getByTestId('double-count').innerHTML).toBe('0');
  });
  test('resetState from getResetState', () => {
    const Container = createContainer(Counter);
    const { getByTestId } = render(<Container />);
    fireEvent.click(getByTestId('set2'));
    fireEvent.click(getByTestId('reset2'));
    expect(getByTestId('count').innerHTML).toBe('0');
    expect(getByTestId('double-count').innerHTML).toBe('0');
  });
});
