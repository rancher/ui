import Ember from 'ember';
import BrowserStore from 'ui/utils/browser-storage';
import C from 'ui/utils/constants';

export default Ember.Service.extend(BrowserStore, {
  backing: window.localStorage,

  // Multiple browser windows to the same URL will send 'storage' events
  // between each other when a setting changes.
  init: function() {
    this._super();
    $(window).on('storage', (event) => {
      var key = event.originalEvent.key;
      var old = event.originalEvent.oldValue;
      var neu = event.originalEvent.newValue;

      if ( old !== neu )
      {
        this.notifyPropertyChange(key);

        if ( key === C.SESSION.ACCOUNT_ID && old && neu && old !== neu )
        {
          // If the active user changes, flee
          try {
            window.lc('application').send('logout');
          }
          catch (e) {
          }
        }
      }
    });
  },
});
