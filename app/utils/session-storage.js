import BrowserStore from 'ui/utils/browser-storage';

export default BrowserStore.extend({
  backing: window.sessionStorage
});
