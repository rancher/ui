import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { next } from '@ember/runloop';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  globalStore:  service(),
  clusterStore:  service(),
  scope:        service(),

  shortcuts:       { 'g': 'toggleGrouping', },
  model() {
    let cluster = this.modelFor('authenticated.cluster');

    if ( !get(cluster, 'isReady') ) {
      this.transitionTo('authenticated.cluster.index');
    }

    return hash({
      projects:   get(this, 'globalStore').findAll('project'),
      namespaces: get(this, 'clusterStore').findAll('namespace')
    });
  },

  actions: {
    toggleGrouping() {
      let choices = ['none', 'project'];
      let cur = this.get('controller.group');
      let neu = choices[((choices.indexOf(cur) + 1) % choices.length)];

      next(() => {
        this.set('controller.group', neu);
      });
    },
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.CLUSTER_ROUTE }`, 'authenticated.cluster.projects');
  }),

});
