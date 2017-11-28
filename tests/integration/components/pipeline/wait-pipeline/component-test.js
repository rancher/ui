import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pipeline/wait-pipeline', 'Integration | Component | pipeline/wait pipeline', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{pipeline/wait-pipeline}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#pipeline/wait-pipeline}}
      template block text
    {{/pipeline/wait-pipeline}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
