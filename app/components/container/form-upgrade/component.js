import Ember from 'ember';

export default Ember.Component.extend({
  service: null,
  editing: null,
  isUpgrade: null,
  choices: null,

  classNames: ['accordion-wrapper'],
});
