import * as React from 'react';
import { PureComponent } from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import {
  up, setHoox, connect, createContainer,
} from './stores/counter';

const connectCount = connect(state => ({ count: state.count }));

function Counter({ count, normalProp }: { count: number; normalProp: number }) {
  return (
    <div>
      <div data-testid="count">{count}</div>
      <div data-testid="normalProp">{normalProp}</div>
      <div data-testid="up" onClick={() => up()} />
      <div data-testid="set" onClick={() => setHoox({ count: 10 })} />
    </div>
  );
}

class ClassCounter extends PureComponent<{
  count: number
  normalProp: number
}> {
  state = {
    stateCount: 0,
  };

  renderTimes = 0;

  render() {
    const { count, normalProp } = this.props;
    const { stateCount } = this.state;
    this.renderTimes++;

    return (
      <div>
        <div data-testid="renderTimes">{this.renderTimes}</div>
        <div data-testid="count">{count}</div>
        <div data-testid="normalProp">{normalProp}</div>
        <div data-testid="stateCount">{stateCount}</div>
        <div data-testid="up" onClick={() => up()} />
        <div data-testid="set" onClick={() => setHoox({ count: 10 })} />
        <div
          data-testid="setState"
          onClick={() => this.setState({ stateCount: 5 })}
        />
      </div>
    );
  }
}

const ConnectedCounter = connectCount(Counter);
const ConnectedClassCounter = connectCount(ClassCounter);

afterEach(cleanup);

describe('connect function componet', () => {
  test('connect success', () => {
    const Container = createContainer(ConnectedCounter);
    const { getByTestId } = render(<Container normalProp={12} />);
    expect(getByTestId('count').innerHTML).toBe('1');
    expect(getByTestId('normalProp').innerHTML).toBe('12');
  });

  test('execute action success', () => {
    const Container = createContainer(ConnectedCounter);
    const { getByTestId } = render(<Container normalProp={12} />);
    fireEvent.click(getByTestId('up'));
    expect(getByTestId('count').innerHTML).toBe('2');
    expect(getByTestId('normalProp').innerHTML).toBe('12');
  });
});

describe('connect class componet', () => {
  test('connect success', () => {
    const Container = createContainer(ConnectedClassCounter);
    const { getByTestId } = render(<Container normalProp={12} />);
    expect(getByTestId('count').innerHTML).toBe('1');
    expect(getByTestId('normalProp').innerHTML).toBe('12');
  });

  test('setState ok', () => {
    const Container = createContainer(ConnectedClassCounter);
    const { getByTestId } = render(<Container normalProp={12} />);
    expect(getByTestId('stateCount').innerHTML).toBe('0');
    fireEvent.click(getByTestId('setState'));
    expect(getByTestId('stateCount').innerHTML).toBe('5');
    expect(getByTestId('renderTimes').innerHTML).toBe('2');
  });
});

describe('connect empty state', () => {
  test('connect function component success', () => {
    const EmptyConnectedCounter = connect(() => ({}))(Counter);
    const Container = createContainer(EmptyConnectedCounter);
    const { getByTestId } = render(<Container normalProp={12} count={100} />);
    expect(getByTestId('count').innerHTML).toBe('100');
  });

  test('connect class component success', () => {
    const EmptyConnectedCounter = connect(() => ({}))(ClassCounter);
    const Container = createContainer(EmptyConnectedCounter);
    const { getByTestId } = render(<Container normalProp={12} count={100} />);
    expect(getByTestId('count').innerHTML).toBe('100');
    expect(getByTestId('renderTimes').innerHTML).toBe('1');
  });

  test('should render when setState', () => {
    const EmptyConnectedCounter = connect(() => ({}))(ClassCounter);
    const Container = createContainer(EmptyConnectedCounter);
    const { getByTestId } = render(<Container normalProp={12} count={100} />);
    fireEvent.click(getByTestId('setState'));
    expect(getByTestId('renderTimes').innerHTML).toBe('2');
  });

  test('should not render when execute action', () => {
    const EmptyConnectedCounter = connect(() => ({}))(ClassCounter);
    const Container = createContainer(EmptyConnectedCounter);
    const { getByTestId } = render(<Container normalProp={12} count={100} />);
    fireEvent.click(getByTestId('up'));
    fireEvent.click(getByTestId('set'));
    expect(getByTestId('renderTimes').innerHTML).toBe('1');
  });
});
