import Ember from 'ember';

export default Ember.Component.extend({
  errors: null,

  classNames: ['banner','bg-error'],
  classNameBindings: ['errors.length::hide'],

  errorsDidChange: function() {
    if ( this.get('errors.length') )
    {
      Ember.run.later(() => {
        this.$().scrollIntoView();
      },100);
    }
  }.property('errors.[]'),
});
