const test = require('node:test');
const assert = require('node:assert/strict');
const { haversineMeters, isValidCoordinate } = require('../src/utils');

test('haversine distance is zero for the same point', () => {
  assert.equal(haversineMeters(10, 106, 10, 106), 0);
});

test('haversine distance measures nearby points in meters', () => {
  const distance = haversineMeters(10, 106, 10.001, 106);
  assert.ok(distance > 100 && distance < 112);
});

test('coordinate validation rejects out-of-range and non-finite values', () => {
  assert.equal(isValidCoordinate(90, 180), true);
  assert.equal(isValidCoordinate(91, 0), false);
  assert.equal(isValidCoordinate(0, Number.NaN), false);
});