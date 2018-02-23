import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

const DEFAULT_ANNOTATION = 'storageclass.kubernetes.io/is-default-class';

export default Resource.extend({
  clusterStore: service(),

  type: 'storageClass',
  state: 'active',

  actions: {
    makeDefault() {
      const cur = get(this,'clusterStore').all('storageClass').filterBy('isDefault',true);
      const promises = [];
      cur.forEach((sc) => {
        promises.push(sc.setDefault(false));
      });

      all(promises).then(() => {
        this.setDefault(true);
      });
    },

    edit() {
    },
  },

  isDefault: computed('annotations', function() {
    return (get(this,'annotations')||{})[DEFAULT_ANNOTATION] === 'true';
  }),

  setDefault(on) {
    const annotations = get(this,'annotations')||{};
    if ( on ) {
      annotations[DEFAULT_ANNOTATION] = 'true';
    } else {
      delete annotations[DEFAULT_ANNOTATION];
    }

    this.save();
  },

  availableActions: computed('links.{update,remove}','isDefault', function() {
    const l = get(this,'links');
    const isDefault = get(this, 'isDefault');

    let out = [
      { label:   'action.makeDefault',     icon: 'icon icon-star-fill',      action: 'makeDefault',      enabled: !isDefault },
      { divider: true },
      { label:   'action.edit',           icon: 'icon icon-edit',           action: 'edit',             enabled: !!l.update },
      { divider: true },
      { label:   'action.remove',         icon: 'icon icon-trash',          action: 'promptDelete',     enabled: !!l.remove, bulkable: true, altAction: 'delete'},
      { divider: true },
      { label:   'action.viewInApi',      icon: 'icon icon-external-link',  action: 'goToApi',          enabled: true },
    ];

    return out;
  }),
});
