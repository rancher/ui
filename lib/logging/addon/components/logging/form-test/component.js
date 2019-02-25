import Component from '@ember/component';
import { equal } from '@ember/object/computed'

export default Component.extend({ isCustom: equal('targetType', 'customTarget') });
