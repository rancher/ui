import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { get, set, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import $ from 'jquery';

export default Component.extend({
  scope:       service(),

  classNames:  ['istio-graph'],
  layout,

  namespaces:     null,
  loading:        false,
  intervalAnchor: null,

  willDestroyElement() {
    this.clearInterval();
    this._super();
  },

  namespaceDidChange: observer('namespace', function() {
    this.clearInterval();
    set(this, 'loading', true);
    set(this, 'url', `/k8s/clusters/${ get(this, 'scope.currentCluster.id') }/api/v1/namespaces/istio-system/services/http:kiali-http:80/proxy/console/graph/namespaces/?edges=noEdgeLabels&graphType=versionedApp&namespaces=${ get(this, 'namespace') }&unusedNodes=true&injectServiceNodes=true&layout=dagre`);

    const intervalAnchor = setInterval(() => {
      if ( $('#kiali-iframe').contents().find('#root .login-pf').length === 0 && $('#kiali-iframe').contents().find('#root .pf-c-page').length === 1 ) {
        set(this, 'loading', false);
        this.clearInterval();
      }
    }, 800);

    set(this, 'intervalAnchor', intervalAnchor);
  }),

  updateKialiGraph: on('init', observer('scope.currentProject.id', 'namespaces', function() {
    if ( !get(this, 'namespace') || !(get(this, 'namespaces') || []).findBy('id', get(this, 'namespace') ) ) {
      set(this, 'namespace', get(this, 'namespaces.firstObject.id'));
    }
  })),

  clearInterval() {
    const intervalAnchor = get(this, 'intervalAnchor');

    if (intervalAnchor){
      clearInterval(intervalAnchor);
      set(this, 'intervalAnchor', intervalAnchor);
    }
  },
});
