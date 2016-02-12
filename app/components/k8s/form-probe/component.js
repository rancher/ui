import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  key: 'probe',

  checkType: 'none',
  exec: null,
  http: null,
  tcp: null,
  initialDelay: 1,
  timeout: 1,

  init() {
    this._super();
    this.set('exec', {
      command: [],
    });

    this.set('http', {
      path: '/',
      port: '',
      host: '',
      scheme: 'http',
    });

    this.set('tcp', {
      port: '',
    });
  },

  didInitAttrs() {
    this.typeChanged();
  },

  typeChanged: function() {
    var obj = null;
    var type = this.get('checkType');
    if ( type !== 'none' )
    {
      obj = {
        initialDelaySeconds: this.get('initialDelay'),
        timeoutSeconds: this.get('timeout'),
      };

      obj[type] = this.get(type);
    }

    Ember.set(this.get('model'), this.get('key'), obj);
  }.observes('checkType'),
});
