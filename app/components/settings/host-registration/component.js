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

  customRadio   : null,
  customValue   : '',
  thisPage      : null,

  actions: {
    save(btnCb) {
      let value = this.get('activeValue');

      if (!value) {
        this.set('errors', ['Please provide a URL']);
        btnCb();
        return;
      }

      this.set('errors', null);

      this.get('settings').set(C.SETTING.API_HOST, value);
      this.get('settings').one('settingsPromisesResolved', () => {
        btnCb(true);
        this.sendAction('saved');
      });

    },
  },

  didReceiveAttrs: function() {
    let initial     = this.get('initialValue');
    let endpoint    = this.get('endpoint.origin');
    let thisPage    = window.location.origin;

    let value, radio;

    if ( initial )
    {
      if ( initial === thisPage )
      {
        value = (initial === endpoint ? '' : endpoint);
        radio = 'no';
      }
      else
      {
        value = initial;
        radio = 'yes';
      }
    }
    else
    {
      if ( endpoint === thisPage )
      {
        value = '';
        radio = 'no';
      }
      else
      {
        value = endpoint;
        radio = 'yes';
      }
    }

    this.setProperties({
      thisPage: thisPage,
      customValue: value,
      customRadio: radio
    });
  },

  looksPublic: function() {
    return isPublic(this.get('activeValue'));
  }.property('activeValue'),

  activeValue: function() {
    if (this.get('customRadio') === 'yes') {
      return this.get('customValue').trim();
    } else {
      return this.get('thisPage');
    }
  }.property('customRadio','customValue','thisPage'),

  customValueDidChange: function() {
    let val = (this.get('customValue') || '').trim();
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
