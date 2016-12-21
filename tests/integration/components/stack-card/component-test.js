import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('stack-card', 'Integration | Component | stack card', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  let model = Ember.Object.create({
    services: Ember.A()
  });

  this.set('model', model);

  this.render(hbs`{{stack-card model=model}}`);

  assert.equal(this.$().text().trim(), '');
});
