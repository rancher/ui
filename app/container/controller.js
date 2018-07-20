import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import {
  get, set, observer, computed
} from '@ember/object';
import { once } from '@ember/runloop';

export default Controller.extend({
  router: service(),

  selectedContainer: null,

  displayEnvironmentVars: computed('selectedContainer', function() {

    var envs = [];
    var environment = this.get('selectedContainer.environment') || {};

    Object.keys(environment).forEach((key) => {

      envs.pushObject({
        key,
        value: environment[key]
      })

    });

    return envs;

  }),

  containers: computed('model.containers.[]', function() {
    return (get(this, 'model.containers') || []).map((container) => {
      set(container, 'type', 'container');
      set(container, 'pod', Object.assign({}, get(this, 'model')));
      set(container, 'pod.containers', [{ name: get(container, 'name') }]);

      return get(this, 'store').createRecord(container);
    });
  }),

  containerDidChange: observer('model.containers.[]', function() {

    once(() => set(this, 'selectedContainer', get(this, 'model.containers.firstObject')));

  }),

  podStateDidChange: observer('model.state', function() {

    if ( get(this, 'model.state') === 'removed' && get(this, 'router.currentRouteName') === 'container' ) {

      this.transitionToRoute('authenticated.project.index');

    }

  }),
  actions: {
    select(container) {

      set(this, 'selectedContainer', container);

    }
  },

});
