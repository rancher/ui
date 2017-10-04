import Ember from 'ember';
import Console from 'ui/mixins/console';
import C from 'ui/utils/constants';

export default Ember.Controller.extend(Console, {
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
});
