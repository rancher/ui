import Route from '@ember/routing/route';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import { hash } from 'rsvp';
import C from 'ui/utils/constants';

export default Route.extend({
  session: service(),
  store:   service(),

  model() {
    const store = get(this, 'store');

    return hash({
      apps: store.find('app', null, { forceReload: true }).then((apps) => {
        const out = [];
        const projectApp = apps.findBy('name', 'project-monitoring');

        if ( projectApp ) {
          out.push(projectApp);
        }

        return out;
      })
    });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.monitoring.project-setting');
  }),
});
