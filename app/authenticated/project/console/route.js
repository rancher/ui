import {
  defineProperty, get, computed
} from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  scope: service(),
  k8s:   service(),

  model(params) {

    let store = get(this, 'store');

    if (params.kubernetes) {

      return get(this, 'k8s').getInstanceToConnect();

    }

    return store.find('pod', params.podId);

  },

  setupController(controller, model) {

    this._super(controller, model);

    if (controller.get('kubernetes')) {

      defineProperty(controller, 'command', computed('model.labels', function() {

        var labels = get(this, 'model.labels') || {};

        if ( `${ labels[C.LABEL.K8S_TOKEN] }` === 'true' ) {

          return [
            'kubectl-shell.sh',
            get(this, 'cookies').get(C.COOKIE.TOKEN) || 'unauthorized'
          ];

        } else {

          return ['/bin/bash', '-l', '-c', 'echo "# Run kubectl commands inside here\n# e.g. kubectl get rc\n"; TERM=xterm-256color /bin/bash'];

        }

      }));

    }

  }
});
