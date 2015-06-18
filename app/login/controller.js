import Ember from 'ember';

export default Ember.Controller.extend({
  github: Ember.inject.service(),
  queryParams: ['timedOut','errorMsg'],

  timedOut: false,
  waiting: false,
  errorMsg: null,

  infoColor: function() {
    if ( this.get('errorMsg') )
    {
      return 'alert-danger';
    }
    {
      return 'alert-warning';
    }
  }.property('errorMsg'),

  infoMsg: function() {
    if ( this.get('errorMsg') )
    {
      return this.get('errorMsg');
    }
    else if ( this.get('timedOut') )
    {
      return 'Your session has timed out.  Log in again to continue.';
    }
    else
    {
      return '';
    }
  }.property('timedOut','waiting','errorMsg'),

  actions: {
    authenticate: function() {
      this.set('timedOut', false);
      this.set('waiting', true);
      this.set('errorMsg', null);

      Ember.run.later(() => {
        this.get('github').authorizeRedirect();
      }, 10);
    }
  }
});

