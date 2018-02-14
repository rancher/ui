import { next } from '@ember/runloop';
import EmberObject, { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all as PromiseAll } from 'rsvp';
import Preload from 'ui/mixins/preload';

export default Route.extend(Preload,{
  access: service(),
  scope: service(),
  globalStore: service(),

  model(params, transition) {
    return get(this, 'globalStore').find('project', params.project_id).then((project) => {
      return get(this,'scope').startSwitchToProject(project).then(() => {
        return PromiseAll([
          this.loadSchemas('clusterStore'),
          this.loadSchemas('store'),
        ]).then(() => {
          return PromiseAll([
            this.preload('namespace','clusterStore'),
            this.preload('pod'),
            this.preload('workload'),
            this.preload('dnsRecord'),
            this.preload('secret'),
            this.preload('service'),
            this.preload('namespacedSecret'),
          ]).then(() => {
            return EmberObject.create({
              project,
            });
          })
        });
      });
    }).catch((err) => {
      return this.loadingError(err, transition);
    });
  },

  setupController(controller, model) {
    this._super(...arguments);
    get(this, 'scope').finishSwitchToProject(get(model,'project'));
  },

  actions: {
    toggleGrouping() {
      let choices = ['none','service','stack'];
      let cur = this.get('controller.group');
      let neu = choices[((choices.indexOf(cur)+1) % choices.length)];
      next(() => {
        this.set('controller.group', neu);
      });
    },
  },

  shortcuts: {
    'g': 'toggleGrouping',
  }
});
