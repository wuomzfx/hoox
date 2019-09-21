import createHoox from '../../src';

function sleep(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

const state = {
  count: 1,
};

export const {
  getHoox,
  useHoox,
  setHoox,
  resetHoox,
  createContainer,
  Provider,
} = createHoox(state);

export const up = () => {
  const [, setState] = getHoox();
  return setState(oldState => ({
    count: oldState.count + 1,
  }));
};

export const asyncUp = async (time: number) => {
  await sleep(time);
  up();
};

export const useDoubleCount = () => {
  const [hooxState] = useHoox();
  return (hooxState.count || 0) * 2;
};
