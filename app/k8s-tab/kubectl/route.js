import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  access: Ember.inject.service(),
  cookies: Ember.inject.service(),

  model() {
    return this.get('store').findAll('container').then((containers) => {
      let inst = null;
      let command = ['/bin/bash','-l','-c','echo "# Run kubectl commands inside here\n# e.g. kubectl get rc\n"; TERM=xterm-256color /bin/bash'];

      for ( let i = 0 ; i < containers.get('length') ; i++)
      {
        let container = containers.objectAt(i);
        if ( container.get('state') !== 'running' )
        {
          continue;
        }

        var labels = container.get('labels')||{};

        // The kubectl container to use will have this label
        if ( labels[C.LABEL.K8S_KUBECTL]+'' === 'true' )
        {
          inst = container;

          // For 1.6 with RBAC, the command is different
          if ( labels[C.LABEL.K8S_TOKEN]+'' === 'true' )
          {
            command = [
              'kubectl-shell.sh',
              this.get('cookies').get(C.COOKIE.TOKEN) || 'unauthorized'
            ];
          }

          break;
        }
      }

      if ( inst )
      {
        return Ember.Object.create({
          command: command,
          instance: inst,
        });
      }
      else
      {
        return Ember.RSVP.reject('Unable to find an active kubectld container');
      }
    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('step', 1);
      controller.set('kubeconfig', null);
    }
  },
});
