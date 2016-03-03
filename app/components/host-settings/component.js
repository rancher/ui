import Ember from 'ember';
import C from 'ui/utils/constants';

function isPublic(name) {
  if ((name || '').trim().replace(/^https?:\/\//, '').match(/^(localhost|192\.168\.|172\.1[6789]\.|172\.2[0123456789]\.|172\.3[01]\.|10\.)/)) {
    return false;
  }

  return true;
}

export default Ember.Component.extend({
  endpoint      : Ember.inject.service(),
  settings      : Ember.inject.service(),
  docsBase      : C.EXT_REFERENCES.DOCS,

  customRadio   : null,
  customValue   : '',
  editing       : true,
  saving        : false,
  disableCancel : true,
  backToAdd     : false,

  thisPage      : null,

  actions: {
    sendActiveValue: function(value) {
      this.sendAction('sendActiveValue', value);
    },
    save: function() {
      let hostValue = this.get('host');
      let propsOut = {};

      if (!hostValue) {
        this.set('errors', ['Please provide a DNS name or IP address.']);
        return;
      }

      propsOut[C.SETTING.API_HOST] = hostValue;

      this.set('saving', true);

      // Ember 2.x brings a new setProperties that returns the hash
      // and not the self object so you cant chain calls on setProperties anymore
      this.get('settings').setProperties(propsOut);
      this.get('settings').one('settingsPromisesResolved', () => {

        this.set('saving', false);
        this.set('errors', null);

        if (this.get('backToAdd')) {

          this.transitionToRoute('hosts.new', this.get('projects.current.id'));
        } else {

          this.send('goToPrevious');
        }

      });

    },
    cancel: function() {},
  },

  didInitAttrs: function() {
    let thisPage    = window.location.origin;
    let endpoint    = this.get('endpoint.origin');
    let isDifferent = endpoint !== thisPage;

    this.set('thisPage', thisPage);

    if (endpoint !== thisPage) {
      this.set('customValue', endpoint);
    }

    let value = this.get('host');

    if (value) {
      if (value === thisPage) {
        this.set('customValue', '');
        this.set('customRadio', 'no');
      } else {
        this.set('customValue', value);
        this.set('customRadio', 'yes');
      }
    } else if (isDifferent) {
      this.set('customValue', endpoint);
      this.set('customRadio', 'yes');
    } else {
      this.set('customValue', '');
      this.set('customRadio', 'no');
    }
  },


  looksPublic: function() {
    return isPublic(this.get('activeValue'));
  }.property('activeValue'),

  parseActiveValue: function(value) {
    let out;
    if (this.get('customRadio') === 'yes') {
      out = value.trim();
    } else {
      out = this.get('thisPage');
    }
    return out;
  },

  activeValueObserver: function() {
    this.send('sendActiveValue', this.parseActiveValue(this.get('customValue')));
  }.observes('customRadio', 'customValue', 'thisPage').on('init'),


  activeValue: function() {
    return this.parseActiveValue(this.get('customValue'));
  }.property('customRadio', 'customValue', 'thisPage'),

  customValueDidChange: function() {
    let val = this.get('customValue') || ''.trim();
    let idx = val.indexOf('/', 8); // 8 is enough for "https://"
    if (idx !== -1) {
      // Trim paths off of the URL
      this.set('customValue', val.substr(0, idx));
      return; // We'll be back...
    }

    if (val) {
      this.set('cusomRadio', 'yes');
    }
  }.observes('customValue'),

});
