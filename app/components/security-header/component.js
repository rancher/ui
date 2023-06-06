import Component from '@ember/component';
import { isEmbedded } from 'shared/utils/util';

import layout from './template';

export default Component.extend({
  layout,
  showLegacyMessage: isEmbedded(),
});
