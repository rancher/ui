import Ember from 'ember';

function isPublic(name) {
  if ( (name||'').trim().replace(/^https?:\/\//,'').match(/^(localhost|192\.168\.|172\.1[6789]\.|172\.2[0123456789]\.|172\.3[01]\.|10\.)/) )
  {
    return false;
  }

  return true;
}

export default Ember.Controller.extend({
  queryParams: ['backToAdd'],
  backToAdd: false,
  thisPage: '', // Set by route

  errors: null,
  customRadio: null,
  custom: Ember.computed.equal('customRadio', 'yes'),
  editing: true,
  saving: false,
  customValue: '',

  looksPublic: function() {
    return isPublic(this.get('activeValue'));
  }.property('activeValue'),

  activeValue: function() {
    if ( this.get('custom') )
    {
      return this.get('customValue').trim();
    }
    else
    {
      return this.get('thisPage');
    }
  }.property('custom','customValue','thisPage'),

  actions: {
    save: function() {
      var model = this.get('model');
      var value = this.get('activeValue');

      if ( !value )
      {
        this.set('errors', ['Please provide a DNS name or IP address.']);
        return;
      }

      // If your really want to set it to nothing...
      if ( value === '__NONE__' )
      {
        value = ' ';
      }

      model.set('value', value);

      this.set('saving', true);
      model.save().then(() => {
        if ( this.get('backToAdd') )
        {
          this.transitionToRoute('hosts.new');
        }
        else
        {
          this.send('goToPrevious');
        }
      }).catch((err) => {
        this.set('errors', [err]);
      }).finally(() => {
        this.set('saving', false);
      });

    },

    cancel: function() {
      this.send('goToPrevious');
    }
  },

  customValueDidChange: function() {
    var val = this.get('customValue')||''.trim();
    var idx = val.indexOf('/', 8); // 8 is enough for "https://"
    if ( idx !== -1 )
    {
      // Trim paths off of the URL
      this.set('customValue', val.substr(0,idx));
      return;  // We'll be back...
    }

    if ( val )
    {
      this.set('customRadio','yes');
    }
  }.observes('customValue'),
});
