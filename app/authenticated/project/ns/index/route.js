import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import { set } from '@ember/object';
import C from 'ui/utils/constants';

export default Route.extend({

  clusterStore: service(),

  model() {
    var store = this.get('clusterStore');

    return hash({ namespaces: store.findAll('namespace'), });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.ns');
  }),
});
