import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';
import C from 'ui/utils/constants';

export default Ember.Component.extend(ModalBase, {
  classNames: ['modal-container', 'large-modal', 'fullscreen-modal', 'modal-shell', 'alert'],
  command: ['/bin/bash','-l','-c','echo "# Run kubectl commands inside here\n# e.g. kubectl get rc\n"; TERM=xterm-256color /bin/bash'],
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

  didReceiveAttrs() {
    this.get('store').findAll('container').then((containers) => {
      let inst = null;
      for ( let i = 0 ; i < containers.get('length') ; i++)
      {
        let container = containers.objectAt(i);
        if ( container.get('state') !== 'running' )
        {
          continue;
        }

        var labels = container.get('labels')||{};
        if ( labels[C.LABEL.K8S_KUBECTL]+'' === 'true' )
        {
          inst = container;
          break;
        }
      }

      if ( inst )
      {
        this.setProperties({
          model: inst,
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
