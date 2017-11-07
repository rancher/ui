import Service from '@ember/service';
// @@TODO@@ - 10-27-17 - move to addon
import BrowserStore from 'ui/utils/browser-storage';

export default Service.extend(BrowserStore, {
  backing: window.sessionStorage,
});
