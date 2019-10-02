import { module, test } from 'qunit';
import { insensitiveCompare, sortInsensitiveBy, sortVersions } from 'shared/utils/sort';

module('Unit | Utility | sort', () => {
  module('insensitiveCompare', () => {
    test('(A,b) A should come first -1', (assert) => {
      assert.equal(insensitiveCompare('A', 'b'), -1);
    });

    test('(b, A) A should come first 1', (assert) => {
      assert.equal(insensitiveCompare('b', 'A'), 1);
    });

    test('(a, A) a should equal A 0', (assert) => {
      assert.equal(insensitiveCompare('a', 'A'), 0);
    });

    test('({a: a}, {b: b}) {a: a} should equal {b: b} 0', (assert) => {
      assert.equal(insensitiveCompare({ a: 'a' }, { b: 'b' }), 0);
    });

    test('(fnA, fnB) fnA should be first -1', (assert) => {
      assert.equal(insensitiveCompare(function fnA(){}, function fnB(){}), -1); // eslint-disable-line prefer-arrow-callback
    });
  });

  module('sortInsensitiveBy', () => {
    const one = {
      value:  'A',
      value2: 1
    };
    const two = {
      value:  'b',
      value2: 2
    };
    const three = {
      value:  'c',
      value2: 3
    };
    const four = {
      value:  'c',
      value2: 4
    }
    const input = [two, four, three, one];
    const expected = [one, two, three, four];

    test('Should sort by single field', (assert) => {
      const input = [two, three, one];
      const expected = [one, two, three];

      assert.deepEqual(sortInsensitiveBy(input, 'value'), expected);
    });

    test('Should use second field as tiebreaker', (assert) => {
      assert.deepEqual(sortInsensitiveBy(input, 'value', 'value2'), expected);
    });

    test('Should support array of fields', (assert) => {
      assert.deepEqual(sortInsensitiveBy(input, ['value', 'value2']), expected);
    });
  });

  module('sortVersions', () => {
    test('Should be able to sort a list of versions', (assert) => {
      const one = { value: '0.0.0.1' };
      const two = { value: '0.0.0.2' };
      const three = { value: '0.0.1.2' };
      const four = { value: '0.4.0.0' };
      const five = { value: '1.1.1.1' };
      const input = [three, four, two, five, one];
      const expected = [one, two, three, four, five];

      assert.deepEqual(sortVersions(input, 'value'), expected);
    });
  });
});
