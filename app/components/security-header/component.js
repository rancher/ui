import Component from '@ember/component';

import layout from './template';

export default Component.extend({
  layout,
  showLegacyMessage: window.top !== window,
});
