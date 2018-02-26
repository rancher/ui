import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import C from 'ui/utils/constants';
import { computed, get } from '@ember/object';
import { send } from 'ember-metal/events';

export default Controller.extend({
  globalStore: service(),
  modalService: service('modal'),
  growl: service(),
  settings: service(),
  catalog: service(),

  actions: {
    disableHelmIncubator() {
      get(this, 'helmIncubator').delete().catch((err) => {
        get(this, 'growl').fromError('Error removing Incubator', err);
      }).finally(() => {
        send(this, 'refresh')
      });
    },
    disableHelmStable() {
      get(this, 'helmStable').delete().catch((err) => {
        get(this, 'growl').fromError('Error removing Stable', err);
      }).finally(() => {
        send(this, 'refresh')
      });
    },
    enableHelmIncubator() {
      get(this, 'globalStore').createRecord({
        type:   'catalog',
        name:   C.CATALOG.HELM_INCUBATOR_KEY,
        url:    C.CATALOG.HELM_INCUBATOR_VALUE,
        branch: C.CATALOG.DEFAULT_BRANCH,
      }).save().catch((err) => {
        get(this, 'growl').fromError('Error saving Incubator', err);
      }).finally(() => {
        send(this, 'refresh')
      });
    },
    enableHelmStable() {
      get(this, 'globalStore').createRecord({
        type:   'catalog',
        name:   C.CATALOG.HELM_STABLE_KEY,
        url:    C.CATALOG.HELM_STABLE_VALUE,
        branch: C.CATALOG.DEFAULT_BRANCH,
      }).save().catch((err) => {
        get(this, 'growl').fromError('Error saving Stable', err);
      }).finally(() => {
        send(this, 'refresh')
      });
    },

    enableLibrary() {
      get(this, 'globalStore').createRecord({
        type:   'catalog',
        name:   C.CATALOG.LIBRARY_KEY,
        url:    C.CATALOG.LIBRARY_VALUE,
        branch: C.CATALOG.LIBRARY_BRANCH,
      }).save().catch((err) => {
        get(this, 'growl').fromError('Error saving Library', err);
      }).finally(() => {
        send(this, 'refresh')
      });
    },

    disableLibrary() {
      get(this, 'stdLibrary').delete().catch((err) => {
        get(this, 'growl').fromError('Error removing Library', err);
      }).finally(() => {
        send(this, 'refresh')
      });
    },

    enableCommunity() {
      get(this, 'globalStore').createRecord({
        type:   'catalog',
        name:   C.CATALOG.COMMUNITY_KEY,
        url:    C.CATALOG.COMMUNITY_VALUE,
        branch: C.CATALOG.COMMUNITY_BRANCH,
      }).save().catch((err) => {
        get(this, 'growl').fromError('Error saving Community', err);
      }).finally(() => {
        send(this, 'refresh')
      });
    },

    disableCommunity() {
      get(this, 'stdCommunity').delete().catch((err) => {
        get(this, 'growl').fromError('Error removing Community', err);
      }).finally(() => {
        send(this, 'refresh')
      });
    },

    add() {
      const record = get(this, 'globalStore').createRecord({
        type: 'catalog',
        kind: 'native',
        branch: 'master',
      });

      get(this, 'modalService').toggleModal('modal-edit-catalog', record);
    },
  },

  headers: [
    {
      name: 'state',
      sort: ['sortState','displayName'],
      searchField: 'displayState',
      translationKey: 'generic.state',
      width: 120,
    },
    {
      name: 'name',
      sort: ['displayName', 'id'],
      searchField: 'displayName',
      translationKey: 'generic.name',
    },
    {
      name: 'kind',
      sort: ['catalogKind', 'displayName'],
      searchField: 'catalogKind',
      translationKey: 'catalogSettings.more.kind.label',
      width: 120,
    },
    {
      name: 'url',
      sort: ['url', 'displayName'],
      translationKey: 'catalogSettings.more.url.label',
    },
    {
      name: 'branch',
      sort: ['branch', 'displayName'],
      translationKey: 'catalogSettings.more.branch.label',
      width: 120,
    },
  ],

  findMatch(name, url, branch) {
    const entry = get(this, 'model').findBy('name', name);
    if ( entry &&
         get(entry, 'url') === url &&
         !branch || get(entry, 'branch') === branch
    ) {
      return entry;
    }
  },

  helmStable: computed('model.@each.{name,url,branch}', function() {
    return this.findMatch(
      C.CATALOG.HELM_STABLE_KEY,
      C.CATALOG.HELM_STABLE_VALUE,
    );
  }),

  helmIncubator: computed('model.@each.{name,url,branch}', function() {
    return this.findMatch(
      C.CATALOG.HELM_INCUBATOR_KEY,
      C.CATALOG.HELM_INCUBATOR_VALUE,
    );
  }),

  stdLibrary: computed('model.@each.{name,url,branch}', function() {
    return this.findMatch(
      C.CATALOG.LIBRARY_KEY,
      C.CATALOG.LIBRARY_VALUE,
      C.CATALOG.LIBRARY_BRANCH
    );
  }),

  stdCommunity: computed('model.@each.{name,url,branch}', function() {
    return this.findMatch(
      C.CATALOG.COMMUNITY_KEY,
      C.CATALOG.COMMUNITY_VALUE,
      C.CATALOG.COMMUNITY_BRANCH
    );
  }),

  custom: computed('model.@each.{name,url,branch}','stdLibrary','stdCommunity', function() {
    const hide = [
      get(this, 'helmStable'),
      get(this, 'helmIncubator')
    ];

    return get(this, 'model').filter(x => !hide.includes(x));
  }),
});
