import Ember from 'ember';
import UpgradeComponent from 'ui/mixins/upgrade-component';

export default Ember.Component.extend(UpgradeComponent, {
  tagName             : 'button',
  classNames          : ['btn'],
  classNameBindings   : ['color','pad'],

  pad: Ember.computed('color', function() {
    if ( this.get('color') === 'bg-transparent' ) {
      return 'p-0';
    }
  }),

  click: function() {
    this.doUpgrade();
  },
});
