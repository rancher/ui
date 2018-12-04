import { next } from '@ember/runloop';
import EmberObject, { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all as PromiseAll } from 'rsvp';
import Preload from 'ui/mixins/preload';
import C from 'ui/utils/constants';

const VALID_ROUTES = ['apps-tab', 'authenticated.project.security.members.index',
  'authenticated.project.ns', 'authenticated.project.certificates',
  'authenticated.project.secrets', 'authenticated.project.config-maps',
  'authenticated.project.registries', 'authenticated.project.alert',
  'authenticated.project.logging', 'authenticated.project.pipeline.settings',
  'authenticated.project.monitoring.project-setting'];

export default Route.extend(Preload, {
  access:       service(),
  scope:        service(),
  globalStore:  service(),
  modalService: service('modal'),

  shortcuts: { 'g': 'toggleGrouping', },
  model(params, transition) {
    const isPopup = this.controllerFor('application').get('isPopup');

    return get(this, 'globalStore').find('project', params.project_id)
      .then((project) => get(this, 'scope').startSwitchToProject(project, !isPopup)
        .then(() => PromiseAll([
          this.loadSchemas('clusterStore'),
          this.loadSchemas('store'),
        ]).then(() => {
          const out = EmberObject.create({ project });

          if ( isPopup ) {
            return out;
          } else {
            return PromiseAll([
              this.preload('namespace', 'clusterStore'),
              this.preload('storageClass', 'clusterStore'),
              this.preload('persistentVolume', 'clusterStore'),
              this.preload('pod'),
              this.preload('workload'),
              this.preload('dnsRecord'),
              this.preload('secret'),
              this.preload('service'),
              this.preload('configmap'),
              this.preload('namespacedSecret'),
              this.preload('persistentVolumeClaim'),
            ]).then(() => out)
          }
        })))
      .catch((err) => this.loadingError(err, transition));
  },

  redirect() {
    let route = this.get(`session.${ C.SESSION.PROJECT_ROUTE }`);

    if ( VALID_ROUTES.includes(route) ) {
      this.replaceWith(route);
    }
  },

  setupController(controller, model) {
    this._super(...arguments);
    get(this, 'scope').finishSwitchToProject(get(model, 'project'));
  },

  actions: {
    toggleGrouping() {
      let choices = ['none', 'node', 'workload', 'namespace'];
      let cur = this.get('controller.group');
      let neu = choices[((choices.indexOf(cur) + 1) % choices.length)];

      next(() => {
        this.set('controller.group', neu);
      });
    },

    importYaml() {
      get(this, 'modalService').toggleModal('modal-import', {
        escToClose: true,
        mode:       'project',
        projectId:  get(this, 'scope.currentProject.id')
      });
    },
  },

});
