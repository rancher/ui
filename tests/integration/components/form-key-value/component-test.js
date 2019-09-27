import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import findComponentInstance from '../../../helpers/find-component-instance';

module('Integration | Component | form-key-value', (hooks) => {
  setupRenderingTest(hooks);

  const key1 = 'key1';
  const key2 = 'key2';
  const value1 = 'value1';
  const value2 = 'value2';
  const initialArray = [
    {
      key:   key1,
      value: value1
    },
    {
      key:   key2,
      value: value2
    }
  ];
  const initialMap = initialArray.reduce((agg, cur) => {
    return {
      ...agg,
      [cur.key]: cur.value
    };
  }, {});
  const initialStr = initialArray.map((kv) => `${ kv.key }=${ kv.value }`).join(',');
  const singleInitialStr = `${ key1 }=${ value1 }`;

  function rendersEachRow(_this, assert) {
    initialArray.forEach((kv, i) => {
      assert.equal(_this.element.querySelector(`tbody tr:nth-of-type(${ i + 1 }) td:nth-of-type(1)`).textContent.trim(), kv.key);
      assert.equal(_this.element.querySelector(`tbody tr:nth-of-type(${ i + 1 }) td:nth-of-type(3)`).textContent.trim(), kv.value);
    });
  }

  test('It renders the header', async function(assert) {
    this.set('header', 'Winning');

    await render(hbs`
      <FormKeyValue
        @header={{this.header}}
      />
    `);

    assert.equal(this.element.querySelector('.clearfix .pull-left .acc-label').textContent, this.header);
  });

  test('It renders the upload button', async function(assert) {
    this.set('editing', true);
    this.set('allowUpload', true);

    await render(hbs`
      <FormKeyValue
        @editing={{this.editing}}
        @allowUpload={{this.allowUpload}}
      />
    `);

    assert.ok(this.element.querySelector('.clearfix .pull-right button .icon-upload'));
  });

  test('It renders two rows with initialArray', async function(assert) {
    this.set('editing', false);
    this.set('initialArray', initialArray);

    await render(hbs`
      <FormKeyValue
        @editing={{this.editing}}
        @initialArray={{this.initialArray}}
      />
    `);

    assert.equal(this.element.querySelectorAll('tbody tr').length, 2);
    rendersEachRow(this, assert);
  });

  test('It renders two rows with initialMap', async function(assert) {
    this.set('editing', false);
    this.set('initialMap', initialMap);

    await render(hbs`
      <FormKeyValue
        @editing={{this.editing}}
        @initialMap={{this.initialMap}}
      />
    `);

    assert.equal(this.element.querySelectorAll('tbody tr').length, 2);
    rendersEachRow(this, assert);
  });

  test('It renders two rows with initialStr', async function(assert) {
    this.set('editing', false);
    this.set('initialStr', initialStr);

    await render(hbs`
      <FormKeyValue
        @editing={{this.editing}}
        @initialStr={{this.initialStr}}
      />
    `);

    assert.equal(this.element.querySelectorAll('tbody tr').length, 2);
    rendersEachRow(this, assert);
  });

  test('It renders input fields when editing', async function(assert) {
    this.set('editing', true);
    this.set('initialStr', singleInitialStr);

    await render(hbs`
      <FormKeyValue
        @editing={{this.editing}}
        @initialStr={{this.initialStr}}
        @allowMultilineValue={{false}}
      />
    `);

    assert.equal(this.element.querySelectorAll('tbody tr').length, 1);
    assert.equal(this.element.querySelector('tbody tr td:nth-of-type(1) input').value, key1);
    assert.equal(this.element.querySelector('tbody tr td:nth-of-type(3) input').value, value1);
  });

  test('It renders a textarea for value when editing and allowMultilineValue', async function(assert) {
    this.set('editing', true);
    this.set('initialStr', singleInitialStr);

    await render(hbs`
      <FormKeyValue
        @editing={{this.editing}}
        @initialStr={{this.initialStr}}
        @allowMultilineValue={{true}}
      />
    `);

    assert.equal(this.element.querySelectorAll('tbody tr').length, 1);
    assert.equal(this.element.querySelector('tbody tr td:nth-of-type(1) input').value, key1);
    assert.equal(this.element.querySelector('tbody tr td:nth-of-type(3) textarea').value, value1);
  });

  test('It renders a textarea for value when editing and allowMultilineValue', async function(assert) {
    this.set('editing', true);
    this.set('initialStr', singleInitialStr);

    await render(hbs`
      <FormKeyValue
        @editing={{this.editing}}
        @initialStr={{this.initialStr}}
        @allowMultilineValue={{true}}
      />
    `);

    assert.equal(this.element.querySelectorAll('tbody tr').length, 1);
    assert.equal(this.element.querySelector('tbody tr td:nth-of-type(1) input').value, key1);
    assert.equal(this.element.querySelector('tbody tr td:nth-of-type(3) textarea').value, value1);
  });

  test('It renders the protip when editing and allowAdd are eneabled and there is atleast one key value', async function(assert) {
    this.set('editing', true);
    this.set('initialStr', singleInitialStr);
    this.set('allowAdd', true);

    await render(hbs`
      <FormKeyValue
        @editing={{this.editing}}
        @initialStr={{this.initialStr}}
        @allowAdd={{this.allowAdd}}
      />
    `);

    assert.ok(this.element.querySelector('.protip'), 1);
  });

  test('Can add an extra key value row', async function(assert) {
    this.set('editing', true);
    this.set('initialStr', singleInitialStr);
    this.set('allowAdd', true);

    await render(hbs`
      <FormKeyValue
        @editing={{this.editing}}
        @initialStr={{this.initialStr}}
        @allowAdd={{this.allowAdd}}
      />
    `);

    assert.equal(this.element.querySelectorAll('tbody tr').length, 1);
    await click('.btn.bg-link.icon-btn.p-0');
    assert.equal(this.element.querySelectorAll('tbody tr').length, 2);
  });

  test('Can edit key/value and it will be reflected in the properties', async function(assert) {
    const newKey = 'newKey';
    const newValue = 'newValue';

    this.set('editing', true);
    this.set('initialStr', singleInitialStr);

    await render(hbs`
      <FormKeyValue
        @editing={{this.editing}}
        @initialStr={{this.initialStr}}
      />
    `);

    await fillIn('tbody tr td:nth-of-type(1) input', newKey);
    await fillIn('tbody tr td:nth-of-type(3) textarea', newValue);

    const componentInstance = findComponentInstance(this.owner, 'component:form-key-value');
    const row = componentInstance.ary[0];

    assert.equal(row.key, newKey);
    assert.equal(row.value, newValue);
  });

  test('Can delete a row', async function(assert) {
    this.set('editing', true);
    this.set('initialStr', singleInitialStr);

    await render(hbs`
      <FormKeyValue
        @editing={{this.editing}}
        @initialStr={{this.initialStr}}
      />
    `);

    assert.equal(this.element.querySelectorAll('tbody tr').length, 1);
    await click('tbody tr button');
    assert.equal(this.element.querySelectorAll('tbody tr').length, 0);
  });
});
