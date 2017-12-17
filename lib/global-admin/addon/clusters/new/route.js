import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';
import { hash/* , all */ } from 'rsvp';

export default Route.extend({
  catalog: service(),
  settings: service(),
  globalStore: service(),

  model() {
    let store = this.get('globalStore');

    let def = JSON.parse(this.get(`settings.${C.SETTING.CLUSTER_TEMPLATE}`)) || {};
    def.type = 'cluster';

    let cluster = store.createRecord(def);

    return hash({
      machineTemplates: store.findAll('machinetemplate'),
      hosts: store.findAll('machine'), // this should eventually be all host with out cluster id
      machineDrivers: store.findAll('machinedriver'),
      policies: store.find('podSecurityPolicyTemplate'),
      roleTemplates: store.findAll('roletemplate'),
    }).then((hash) => {
      return EmberObject.create({
        cluster: cluster,
        clusterRoleTemplateBindings: hash.clusterRoleTemplateBindings,
        machineTemplates: hash.machineTemplates,
        hosts: hash.hosts, // this should eventually be all host with out cluster id
        machineDrivers: hash.machineDrivers,
        roleTemplates: hash.roleTemplates,
        policies: hash.policies,
      });
    });
  },
});
