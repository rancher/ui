import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import C from 'ui/utils/constants';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  access: service(),
  scope: service(),

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

  command: computed('model.labels', function() {
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
    let systemProject = this.get('scope.currentProject.cluster.systemProject');
    let inst;

    if ( !systemProject ) {
      this.setProperties({
        loading: false,
        error: "Unable to locate system environment"
      });
      return;
    }

    this.get('store').rawRequest({
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
