import Ember from 'ember';
import BrowserStore from 'ui/utils/browser-storage';

export default Ember.Service.extend(BrowserStore, {
  backing: window.sessionStorage,
});
