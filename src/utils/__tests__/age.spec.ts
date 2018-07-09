/// <reference path="../../../node_modules/@types/jest/index.d.ts" />
const age = require('../age').default;

it('should show <1m', () => {
  const today = Date.now();
  expect(age(today)).toBe('<1m');
});

it('should show 1m (30s)', () => {
  const today = Date.now();
  const mark = new Date(today - (30 * 1000));
  expect(age(mark)).toBe('1m');
});

it('should show 10m (exact)', () => {
  const today = Date.now();
  const mark = new Date(today - (10 * 60 * 1000));
  expect(age(mark)).toBe('10m');
});

it('should show 10m (fuzzy)', () => {
  const today = Date.now();
  const mark = new Date(today - (10 * 60 * 1000) - 1000);
  expect(age(mark)).toBe('10m');
});

it('should show 1h (exact)', () => {
  const today = Date.now();
  const mark = new Date(today - (60 * 60 * 1000));
  expect(age(mark)).toBe('1h');
});

it('should show 1h (fuzzy)', () => {
  const today = Date.now();
  const mark = new Date(today - (62 * 60 * 1000));
  expect(age(mark)).toBe('1h');
});

it('should show 1d (exact)', () => {
  const today = Date.now();
  const mark = new Date(today - (24 * 60 * 60 * 1000));
  expect(age(mark)).toBe('1d');
});

it('should show 1d (fuzzy)', () => {
  const today = Date.now();
  const mark = new Date(today - (25 * 60 * 60 * 1000));
  expect(age(mark)).toBe('1d');
});

it('should show 1mo', () => {
  const today = Date.now();
  const mark = new Date(today - ((365.25 / 12) * 24 * 60 * 60 * 1000));
  expect(age(mark)).toBe('1mo');
});

it('should show 1y', () => {
  const today = Date.now();
  const mark = new Date(today - (365.25 * 24 * 60 * 60 * 1000));
  expect(age(mark)).toBe('1y');
});

it('should show max', () => {
  const today = Date.now();
  const mark = new Date(0);
  expect(age(mark)).toBe('48y');
});
