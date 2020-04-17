import { computed } from '@ember/object';
import Component from '@ember/component';
import UpgradeComponent from 'shared/mixins/upgrade-component';
import layout from './template';

export default Component.extend(UpgradeComponent, {
  layout,
  tagName:           'button',
  classNames:        ['btn'],
  classNameBindings: ['color', 'pad'],
  attributeBindings: ['disabled'],

  disabled: computed('upgradeStatus', function() {
    const { upgradeStatus } = this;

    if (upgradeStatus === 'current') {
      return true;
    }

    return false;
  }),

  pad: computed('color', function() {
    if ( this.get('color') === 'bg-transparent' ) {
      return 'p-0';
    }
  }),

  click() {
    this.doUpgrade();
  },
});
