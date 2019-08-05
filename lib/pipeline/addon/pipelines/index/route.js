import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';
import { set, get } from '@ember/object';

export default Route.extend({
  session: service(),

  model() {
    return get(this, 'store').findAll('pipeline');
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.pipeline.pipelines');
  }),
});
