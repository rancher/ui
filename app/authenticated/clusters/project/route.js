import EmberObject from '@ember/object';
import { Promise as EmberPromise } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';
import { xhrConcur } from 'ui/utils/platform';
import PromiseToCb from 'ui/mixins/promise-to-cb';

export default Route.extend(PromiseToCb, {
  catalog: service(),
  clusterStore: service('cluster-store'),

  model: function(params /* , transition*/) {
    const clusterStore = this.get('clusterStore');

    let policyManagerOpt = {
      headers: {
        [C.HEADER.PROJECT_ID]: params.project_id
      },
      filter: {
        name: C.CAPABILITY.NETWORK_POLICIES,
      },
    };

    let promise = new EmberPromise((resolve, reject) => {
      let tasks = {
        allProjects:                        this.toCb(() => { return clusterStore.findAll('project'); }),
        project:            ['allProjects', this.toCb(() => { return clusterStore.find('project', params.project_id); })],
        importMembers:      ['project',     this.toCb((results) => { return results.project.importLink('projectMembers'); })],
        networks:                           this.toCb(() => { return clusterStore.find('network', null, {filter: {accountId: params.project_id}}); }),
        policyManagers:                     this.toCb(() => { return clusterStore.find('stack', null, policyManagerOpt); }),
        catalogs:                           this.toCb(() => { return this.get('catalog').fetchCatalogs();}),
      };

      async.auto(tasks, xhrConcur, function(err, res) {
        if ( err ) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    }, 'Load all the things');

    return promise.then((hash) => {
      let network = hash.networks.find((x) => C.PROJECT.SUPPORTS_NETWORK_POLICY.includes(x.get('name')));
      if ( network ) {
        network = network.clone();

        if ( !network.get('defaultPolicyAction') ) {
          network.set('defaultPolicyAction', 'allow');
        }

        let policy = network.get('policy');
        if ( !policy ) {
          policy = [];
          network.set('policy', policy);
        }

        // Create default allow policies
        const fields = ['linked','service','stack'];
        fields.forEach((field) => {
          let rule = policy.findBy('within', field);
          if ( !rule ) {
            policy.pushObject(clusterStore.createRecord({
              type: 'networkPolicyRule',
              within: field,
              action: network.get('defaultPolicyAction'),
            }));
          }
        });
      }

      let out = EmberObject.create({
        all: hash.allProjects,
        network: network,
        policyManager: hash.policyManagers.objectAt(0),
        catalogs: hash.catalogs.content,
      });

      out.setProperties({
        originalProject: hash.project,
        project: hash.project.clone(),
      });

      return out;
    });
  },
});
