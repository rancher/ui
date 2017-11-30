import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({
  authzStore: service('authz-store'),
  scope: service(),
  model: function () {
    const store = this.get('userStore');

    return store.find('schema', 'project', {url: '/v1-authz/schemas/project'}).then(() => {
      return hash({
        namespaces: store.findAll('namespace'), // @TODO-2.0 filter to cluster
        pods: store.findAll('pod'),
        workloads: store.findAll('workload'),
        projects: store.findAll('project', null, {url: '/v1-authz/projects'}),
      }).then((res) => {
        return res.namespaces;
      });
    });
  },
});
