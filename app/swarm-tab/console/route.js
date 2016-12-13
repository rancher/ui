import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model() {
    return this.get('store').findAll('container').then((containers) => {
      let inst = containers.filter((c) => {
        return (c.get('labels')||{})[C.LABEL.SERVICE_NAME] === 'swarm/swarmkit-mon';
      }).sortBy('createIndex').objectAt(0);

      if ( inst )
      {
        return Ember.Object.create({
          command: ['/bin/bash','-l','-c','echo "# Run docker commands inside here\n# e.g. docker service ls\n"; TERM=xterm-256color /bin/bash'],
          instance: inst,
        });
      }
    });
  },
});
