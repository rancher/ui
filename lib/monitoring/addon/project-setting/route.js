import Route from '@ember/routing/route';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';

export default Route.extend({
  session:      service(),
  store:        service(),
  clusterStore: service(),

  async model() {
    const store = get(this, 'store');
    const namespaces = await this.clusterStore.findAll('namespace');
    const cattleMonitoringNamespaceExists = namespaces.any((ns) => ns.id === 'cattle-monitoring-system');
    const apps = await store.find('app', null, { forceReload: true });
    const out = [];
    const projectApp = apps.findBy('name', 'project-monitoring');

    if ( projectApp ) {
      out.push(projectApp);
    }

    return {
      apps: out,
      cattleMonitoringNamespaceExists,
    };
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.monitoring.project-setting');
  }),
});
