import { next } from '@ember/runloop';
import EmberObject, { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all as PromiseAll } from 'rsvp';
import Preload from 'ui/mixins/preload';
import C from 'ui/utils/constants';

const VALID_ROUTES = ['apps-tab', 'catalog-tab.index', 'authenticated.project.security.members.index',
  'authenticated.project.ns', 'authenticated.project.certificates',
  'authenticated.project.secrets', 'authenticated.project.config-maps',
  'authenticated.project.registries', 'authenticated.project.alert',
  'authenticated.project.logging', 'authenticated.project.pipeline.settings',
  'authenticated.project.monitoring.project-setting', 'authenticated.project.istio.project-istio.graph',
  'authenticated.project.istio.project-istio.metrics', 'authenticated.project.istio.project-istio.rules',
  'authenticated.project.istio.project-istio.destination-rules', 'authenticated.project.istio.project-istio.virtual-services',
  'authenticated.project.istio.project-istio.gateways',
  'authenticated.project.hpa', 'authenticated.project.pipeline.pipelines'
];

export default Route.extend(Preload, {
  access:       service(),
  scope:        service(),
  globalStore:  service(),
  modalService: service('modal'),
  settings:     service(),

  shortcuts: { 'g': 'toggleGrouping', },
  model(params, transition) {
    const isPopup = this.controllerFor('application').get('isPopup');

    return this.globalStore.find('project', params.project_id)
      .then((project) => {
        const hideLocalCluster = get(this.settings, 'shouldHideLocalCluster');

        if (hideLocalCluster && get(project, 'clusterId') === 'local') {
          return this.replaceWith('authenticated');
        }

        return this.scope.startSwitchToProject(project, !isPopup)
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
                this.preload('secret'),
                this.preload('service'),
                this.preload('configmap'),
                this.preload('namespacedSecret'),
                this.preload('persistentVolumeClaim'),
              ]).then(() => out)
            }
          }));
      })
      .catch((err) => this.loadingError(err, transition));
  },

  afterModel(model) {
    return this.scope.finishSwitchToProject(get(model, 'project'));
  },

  redirect(model, transition) {
    let route = this.get(`session.${ C.SESSION.PROJECT_ROUTE }`);


    if ( get(transition, 'targetName') === 'authenticated.project.index' && VALID_ROUTES.includes(route) ) {
      this.replaceWith(route);
    }
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
      this.modalService.toggleModal('modal-import', {
        escToClose: true,
        mode:       'project',
        projectId:  get(this, 'scope.currentProject.id')
      });
    },
  },

});
