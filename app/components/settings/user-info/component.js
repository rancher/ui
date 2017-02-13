import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'section',
  classNames: ['well'],
  access: Ember.inject.service(),
  account: Ember.computed.alias('access.identity')

});
