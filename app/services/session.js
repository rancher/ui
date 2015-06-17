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

        if ( key === C.SESSION.PROJECT && this.get(C.SESSION.ACCOUNT_ID) )
        {
          // If the active project changes, change this tab too.
          // Hack: using the lc global...
          try {
            window.lc('authenticated').send('switchProject', JSON.parse(neu));
          }
          catch (e) {
          }
        }
        else if ( key === C.SESSION.ACCOUNT_ID && old && old !== 'null' && !neu )
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
