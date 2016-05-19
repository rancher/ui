import Ember from 'ember';
import FallbackTranslationsMixin from 'ui/mixins/fallback-translations';
import { module, test } from 'qunit';

module('Unit | Mixin | fallback translations');

// Replace this with your real tests.
test('it works', function(assert) {
  let FallbackTranslationsObject = Ember.Object.extend(FallbackTranslationsMixin);
  let subject = FallbackTranslationsObject.create();
  assert.ok(subject);
});
