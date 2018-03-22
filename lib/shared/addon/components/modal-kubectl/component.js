import { get, setProperties } from '@ember/object';
import { alias } from '@ember/object/computed';
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

  url: alias('scope.currentCluster.links.shell'),

  didReceiveAttrs() {
    let systemProject = get(this,'scope.currentProject.cluster.systemProject');
    let inst;

    if ( !systemProject ) {
      this.setProperties({
        loading: false,
        error: "Unable to locate system environment"
      });
      return;
    }

    get(this,'store').rawRequest({
      url: systemProject.links.instances,
    }).then((res) => {
      inst = res.body.data.find((c) => {
        return c.state === 'running'
          && c.labels
          && c.labels[C.LABEL.K8S_KUBECTL]+'' === 'true';
      });

      if ( inst )
      {
        setProperties(this, {
          model: get(this,'store').createRecord(inst),
          loading: false,
          error: null,
        });
      }
      else
      {
        setProperties(this, {
          loading: false,
          error: "Unable to find running kubectl container"
        });
      }
    });
  }
});
