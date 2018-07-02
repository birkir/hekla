/// <reference path="../../../node_modules/@types/jest/index.d.ts" />
const prettyNumber = require('../prettyNumber').default;

it('should show suffix', () => {
  expect(prettyNumber(0, 'Comments')).toBe('0 Comments');
});

it('should show no suffix', () => {
  expect(prettyNumber(0)).toBe('0');
});

it('should show million correctly', () => {
  expect(prettyNumber(1200000, 'Votes')).toBe('1.2M Votes');
});

it('should show million correctly', () => {
  expect(prettyNumber(1500, 'Pens')).toBe('1.5K Pens');
});

it('can change divider scale', () => {
  expect(prettyNumber(1024 * 8, 'bytes', 1024)).toBe('8K bytes');
});
