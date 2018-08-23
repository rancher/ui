import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';
import { set, get, observer } from '@ember/object';

const NON_NAMESPACED_RESOURCES = ['PersistentVolume'];

export default Component.extend({
  globalStore: service(),
  scope:       service(),

  layout,

  events: null,

  sortBy:        'lastTimestamp',
  descending:    false,
  name:          null,
  namespaceId:   null,
  resourceType:  null,
  expanded:      false,
  timeOutAnchor: null,
  loading:       false,

  headers: [
    {
      name:           'type',
      sort:           ['type'],
      translationKey: 'resourceEventList.table.type',
      width:          100,
    },
    {
      name:           'reason',
      sort:           ['reason'],
      translationKey: 'resourceEventList.table.reason',
      width:          200,
    },
    {
      name:           'message',
      sort:           ['message'],
      translationKey: 'resourceEventList.table.message',
    },
    {
      name:           'lastTimestamp',
      sort:           ['lastTimestamp'],
      translationKey: 'conditionSections.table.lastUpdate',
      width:          200,
    },
  ],

  init() {
    this._super(...arguments);
    this.expanedDidChange();
  },

  willDestroyElement() {
    this.clearTimeOut();
    this._super();
  },
  expanedDidChange: observer('expanded', function() {
    if ( get(this, 'expanded') ) {
      set(this, 'loading', true);
      this.fetchEvents();
    } else {
      this.clearTimeOut();
    }
  }),

  fetchEvents() {
    const query = `fieldSelector=involvedObject.name=${ get(this, 'name') },involvedObject.kind=${ get(this, 'kind').capitalize() }`;

    let url = `/k8s/clusters/${ get(this, 'scope.currentCluster.id') }/api/v1/`;

    if ( NON_NAMESPACED_RESOURCES.indexOf(get(this, 'kind')) === -1 ) {
      url += `namespaces/${ get(this, 'namespaceId') }/`;
    }

    url += `events?${ query }`;

    get(this, 'globalStore').rawRequest({
      url,
      method: 'GET',
    })
      .then((xhr) => {
        set(this, 'events', xhr.body.items);
        set(this, 'loading', false);
        const timeOutAnchor = setTimeout(() => {
          this.fetchEvents();
        }, 10000);

        set(this, 'timeOutAnchor', timeOutAnchor);
      });
  },

  clearTimeOut() {
    const timeOutAnchor = get(this, 'timeOutAnchor');

    if (timeOutAnchor){
      clearTimeout(timeOutAnchor);
      set(this, 'timeOutAnchor', timeOutAnchor);
    }
  },

});
