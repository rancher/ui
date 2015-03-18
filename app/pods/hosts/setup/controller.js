import Ember from 'ember';

var hostname = window.location.hostname;
var looksPublic = true;
if ( hostname.match(/^(localhost|192\.168\.|172\.1{6789}\.|172\.2{0123456789}\.|172\.3{01}\.|10\.)/) )
{
  looksPublic = false;
}

export default Ember.ObjectController.extend({
  error: null,
  customRadio: (looksPublic ? 'no' : 'yes'),
  custom: Ember.computed.equal('customRadio', 'yes'),
  looksPublic: looksPublic,
  editing: true,
  saving: false,
  thisPage: '',
  customValue: '',

  actions: {
    save: function() {
      var model = this.get('model');
      if ( this.get('custom') )
      {
        var value = this.get('customValue').trim();
        if ( !value )
        {
          this.set('error', 'Please provide a DNS name or IP address');
          return;
        }

        model.set('value', value);
      }
      else
      {
        model.set('value', this.get('thisPage'));
      }

      this.set('saving', true);
      model.save().then(() => {
        this.transitionTo('hosts.new');
      }).catch((err) => {
        this.set('error', err);
      }).finally(() => {
        this.set('saving', false);
      });

    },

    cancel: function() {
      this.send('goToPrevious');
    }
  },

  customValueDidChange: function() {
    if ( this.get('customValue') )
    {
      this.set('customRadio','yes');
    }
  }.observes('customValue'),
});
