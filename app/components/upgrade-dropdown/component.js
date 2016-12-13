import Ember from 'ember';
import UpgradeComponent from 'ui/mixins/upgrade-component';
import { parseExternalId } from 'ui/utils/parse-externalid';

const CURRENT    = 'current',
      AVAILABLE  = 'available';

export default Ember.Component.extend(UpgradeComponent, {
  // See mixin for other inputs
  currentId: null,

  tagName: 'div',
  classNames: ['btn-group'],

  actions: {
    doUpgrade() {
      this.doUpgrade();
    },

    changeVersion(version, url) {
      this.sendAction('changeVersion', version, url);
    },
  },

  // @TODO hacky hacky mchackerson...
  currentVersion: Ember.computed('allVersions','currentId', function() {
    let parsed = parseExternalId(this.get('currentId'));

    let versions = this.get('allVersions');
    let keys = Object.keys(versions);
    for ( let i = 0 ; i < keys.length ; i++ ) {
      let key = keys[i];
      if ( versions[key].indexOf(parsed.id) >= 0 ) {
        return key;
      }
    }
  }),

  currentVersionChanged: function() {
    Ember.run.once(this, 'updateStatus');
  }.observes('currentId'),

  showDropdown: Ember.computed('upgradeStatus', function() {
    return [AVAILABLE,CURRENT].indexOf(this.get('upgradeStatus')) >= 0;
  }),
});

