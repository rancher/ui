import Ember from 'ember';
import UpgradeComponent from 'ui/mixins/upgrade-component';

export default Ember.Component.extend(UpgradeComponent, {
  tagName             : 'button',
  classNames          : ['btn','btn-sm'],
  classNameBindings   : ['color'],

  click: function() {
    this.doUpgrade();
  },
});
