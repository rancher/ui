import Ember from 'ember';

export default Ember.Component.extend({

  keymap: null,

  didInitAttrs: function() {

    var catalogs = this.get('catalog');
    var catalogsSplit = catalogs.split(',');
    var keymapOut = {};

    if (catalogsSplit.length > 1) {

      // its not default so we need to parse it
      catalogsSplit.forEach((item) => {
        var split = item.split('=');
        keymapOut[split[0]] = split[1];
      });

      this.set('keymap', keymapOut);
    } else {

      var catalogItem = catalogsSplit[0];

      if (catalogItem.indexOf('=') >= 0) {

        var split = catalogItem.split('=');
        var obj = {};

        obj[split[0]] = split[1];

        this.set('keymap', obj);
      } else {

        this.set('keymap', {'library': catalogsSplit[0]});
      }
    }
  },

  keymapObserver: function() {
    this.sendAction('keymapChanged', this.get('keymap'));
  }.observes('keymap'),

});
