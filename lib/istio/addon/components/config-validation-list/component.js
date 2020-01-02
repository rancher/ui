import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';
import { set, get, observer, setProperties } from '@ember/object';

export default Component.extend({
  globalStore: service(),
  scope:       service(),

  layout,

  sortBy:        'severity',
  descending:    false,
  name:          null,
  namespaceId:   null,
  resourceType:  null,
  expanded:      false,
  timeOutAnchor: null,
  loading:       false,
  noPermission:  false,

  headers: [
    {
      name:           'severity',
      sort:           ['severity'],
      translationKey: 'validationsList.table.severity',
      width:          100,
    },
    {
      name:           'path',
      sort:           ['path'],
      translationKey: 'validationsList.table.path',
    },
    {
      name:           'message',
      sort:           ['message'],
      translationKey: 'validationsList.table.message',
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
      this.fetch();
    } else {
      this.clearTimeOut();
    }
  }),

  fetch() {
    const url = `/k8s/clusters/${ get(this, 'scope.currentCluster.id') }/api/v1/namespaces/istio-system/services/http:kiali:20001/proxy/api/namespaces/${ get(this, 'namespaceId') }/istio?validate=true`;

    get(this, 'globalStore').rawRequest({
      url,
      method: 'GET',
    })
      .then((xhr) => {
        let out = [];
        const validations = xhr.body.validations;

        if ( validations ) {
          const v = validations[get(this, 'resourceType')];

          if ( v ) {
            const tv = v[get(this, 'name')]

            if ( tv.checks ) {
              out = tv.checks
            }
          }
        }

        setProperties(this, {
          validations:  out,
          loading:      false,
          noPermission: false,
        })

        const timeOutAnchor = setTimeout(() => {
          this.fetch();
        }, 10000);

        set(this, 'timeOutAnchor', timeOutAnchor);
      })
      .catch(() => {
        setProperties(this, {
          loading:      false,
          noPermission: true,
        })
      })
  },

  clearTimeOut() {
    const timeOutAnchor = get(this, 'timeOutAnchor');

    if (timeOutAnchor){
      clearTimeout(timeOutAnchor);
      set(this, 'timeOutAnchor', timeOutAnchor);
    }
  },

});
