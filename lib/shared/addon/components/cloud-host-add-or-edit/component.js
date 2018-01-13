import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import Driver from 'shared/mixins/host-driver';
import layout from './template';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';

export default Component.extend(Driver, {
  layout,
  globalStore:        service(),
  router:             service(),
  errors:             null,
  host:               null,
  clonedModel:        null,
  hostOptions:        null,
  expandAll:          null,
  canAddOptions:      false,
  labelResource:      alias('primaryResource'),
  primaryResource:    alias('clonedModel'),
  requestedClusterId: alias('clonedModel.requestedClusterId'),
  requestedRoles:     alias('clonedModel.requestedRoles'),
  inModal: false,

  didReceiveAttrs() {
    this._super(...arguments);

    if (!this.get('expandFn')) {
      this.set('expandFn', function(item) {
        item.toggleProperty('expanded');
      });
    }

    if (!get(this, 'router.currentRouteName').includes('clusters')) {
      set(this, 'canAddOptions', true);
    }

    let cm = get(this, 'globalStore').createRecord({type: 'machine'});

    set(cm, 'machineTemplateId', get(this, 'machineTemplate.id'));

    setProperties(this, {
      hostOptions: get(this, `machineTemplate.${this.get('machineTemplate.driver')}Config`),
      // @@TODO@@ - 11-28-17 - not sure we should be doing this this way how the heck do we know which host to clone labels from?
      // clonedModel: this.get('host').clone(),
      clonedModel: cm,
    });

  },
  doneSaving: function(neu) {
    if (get(this, 'inModal')){
      set(this, 'clusterNodes', neu);
    }
    return this._super(...arguments);
  },
});
