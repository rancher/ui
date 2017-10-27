import Ember from 'ember';
// @@TODO@@ - 10-27-17 - move to addon
import BrowserStore from 'ui/utils/browser-storage';

export default Ember.Service.extend(BrowserStore, {
  backing: window.sessionStorage,
});
