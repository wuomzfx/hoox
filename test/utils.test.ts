import { isPlainObject } from '../src/utils';

describe('isPlainObject', () => {
  it('true', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject({ a: () => {} })).toBe(true);
  });

  it('false', () => {
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
  });
});
