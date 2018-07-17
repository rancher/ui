import Service from '@ember/service';
import BrowserStore from 'ui/utils/browser-storage';
import { inject as service } from '@ember/service';

export default Service.extend(BrowserStore, {
  backing: window.localStorage,
  app:     service(),

  // Multiple browser windows to the same URL will send 'storage' events
  // between each other when a setting changes.
  init() {
    this._super();
    $(window).on('storage', (event) => { // eslint-disable-line
      var key = event.originalEvent.key;
      var old = event.originalEvent.oldValue;
      var neu = event.originalEvent.newValue;

      if ( old !== neu ) {
        this.notifyPropertyChange(key);

        // @TODO-2.0
        // if ( key === C.SESSION.ACCOUNT_ID && old && neu && old !== neu )
        // {
        //  // If the active user changes, flee
        //  try {
        //    window.lc('application').send('logout');
        //  }
        //  catch (e) {
        //  }
        // }
      }
    });
  },
});
