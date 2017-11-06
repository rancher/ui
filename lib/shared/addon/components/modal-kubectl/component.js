import Ember from 'ember';
import ModalBase from 'shared/mixins/modal-base';
import C from 'ui/utils/constants';

export default Ember.Component.extend(ModalBase, {
  access: Ember.inject.service(),
  projects: Ember.inject.service(),

  classNames: ['modal-container', 'large-modal', 'fullscreen-modal', 'modal-shell', 'alert'],
  loading: true,
  model: null,
  error: null,

  init() {
    this._super(...arguments);
    this.shortcuts.disable();
  },

  willDestroy() {
    this._super(...arguments);
    this.shortcuts.enable();
  },

  command: Ember.computed('model.labels', function() {
    var labels = this.get('model.labels')||{};
    if ( labels[C.LABEL.K8S_TOKEN]+'' === 'true' ) {
      return [
        'kubectl-shell.sh',
        this.get('cookies').get(C.COOKIE.TOKEN) || 'unauthorized'
      ];
    } else {
      return ['/bin/bash','-l','-c','echo "# Run kubectl commands inside here\n# e.g. kubectl get rc\n"; TERM=xterm-256color /bin/bash'];
    }
  }),

  didReceiveAttrs() {
    let systemProject = this.get('projects.current.cluster.systemProject');
    let inst;

    if ( !systemProject ) {
      this.setProperties({
        loading: false,
        error: "Unable to locate system environment"
      });
      return;
    }

    this.get('userStore').rawRequest({
      url: systemProject.links.instances,
    }).then((res) => {
      inst = res.body.data.find((c) => {
        return c.state === 'running'
          && c.labels
          && c.labels[C.LABEL.K8S_KUBECTL]+'' === 'true';
      });

      if ( inst )
      {
        this.setProperties({
          model: this.get('store').createRecord(inst),
          loading: false,
          error: null,
        });
      }
      else
      {
        this.setProperties({
          loading: false,
          error: "Unable to find running kubectl container"
        });
      }
    });
  }
});
