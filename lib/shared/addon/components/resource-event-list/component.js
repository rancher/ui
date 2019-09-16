import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';
import { computed, set, get, observer } from '@ember/object';

const NON_NAMESPACED_RESOURCES = ['PersistentVolume'];
const CLUSTER_ONLY = ['namespace', 'object']

const HEADERS = [
  {
    name:           'namespace',
    sort:           ['involvedObject.namespace'],
    translationKey: 'resourceEventList.table.namespace',
    width:          120,
  },
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
    name:           'object',
    sort:           ['involvedObject.name'],
    translationKey: 'resourceEventList.table.object',
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
    translationKey: 'resourceEventList.table.lastUpdate',
    width:          200,
  },
];

export default Component.extend({
  globalStore: service(),
  scope:       service(),

  layout,

  events: null,

  sortBy:        'lastTimestamp',
  descending:    true,
  name:          null,
  namespaceId:   null,
  resourceType:  null,
  expanded:      false,
  timeOutAnchor: null,
  loading:       false,
  clusterEvents: false,

  init() {
    this._super(...arguments);
    this.expanedDidChange();
  },

  willDestroyElement() {
    this.clearTimeOut();
    this._super();
  },

  expanedDidChange: observer('expanded', 'expandAll', function() {
    if ( get(this, 'expanded') || get(this, 'expandAll') ) {
      set(this, 'loading', true);
      this.fetchEvents();
    } else {
      this.clearTimeOut();
    }
  }),

  headers: computed('clusterEvents', function(){
    return get(this, 'clusterEvents') ? HEADERS : HEADERS.filter((h) => CLUSTER_ONLY.indexOf(h.name) === -1) ;
  }),

  fetchEvents() {
    let url = `/k8s/clusters/${ get(this, 'scope.currentCluster.id') }/api/v1/`;

    if ( get(this, 'clusterEvents') ) {
      url += 'events'
    } else {
      const query = `fieldSelector=involvedObject.name=${ get(this, 'name') },involvedObject.kind=${ get(this, 'kind').capitalize() }`;

      if ( NON_NAMESPACED_RESOURCES.indexOf(get(this, 'kind')) === -1 ) {
        url += `namespaces/${ get(this, 'namespaceId') }/`;
      }
      url += `events?${ query }`;
    }

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
