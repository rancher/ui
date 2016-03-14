import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model() {
    return this.get('store').findAll('container').then((containers) => {
      let inst = null;
      for ( let i = 0 ; i < containers.get('length') ; i++)
      {
        let container = containers.objectAt(i);
        if ( container.get('state') !== 'running' )
        {
          continue;
        }

        var labels = container.get('labels')||{};
        if ( labels['docker-compose label']+'' === 'true' )
        {
          inst = container;
          break;
        }
      }

      if ( inst )
      {
        return Ember.Object.create({
          command: ['/bin/bash','-l','-c','echo "# Run docker-compose commands inside here\n# e.g. docker-compose up\n"; TERM=xterm-256color /bin/bash'],
          instance: inst,
        });
      }
      else
      {
        return Ember.RSVP.reject('Unable to find an active docker-compose container');
      }
    });
  },
});
