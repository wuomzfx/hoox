import hoox from '../../src';

function sleep(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

const state = {
  count: 1,
};

export const {
  getHooxState,
  useHooxState,
  setHooxState,
  resetHooxState,
  createContainer,
  Provider,
} = hoox(state);

export const up = () => {
  const [, setState] = getHooxState();
  return setState(oldState => ({
    count: oldState.count + 1,
  }));
};

export const asyncUp = async (time: number) => {
  await sleep(time);
  up();
};

export const useDoubleCount = () => {
  const [hooxState] = useHooxState();
  return (hooxState.count || 0) * 2;
};
