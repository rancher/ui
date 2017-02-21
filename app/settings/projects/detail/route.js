import Ember from 'ember';
import C from 'ui/utils/constants';
import { xhrConcur } from 'ui/utils/platform';
import PromiseToCb from 'ui/mixins/promise-to-cb';

export default Ember.Route.extend(PromiseToCb, {
  queryParams: {
    editing: {
      refreshModel: true
    }
  },

  model: function(params /* , transition*/) {
    var userStore = this.get('userStore');

    let policyManagerOpt = {
      headers: {
        [C.HEADER.PROJECT_ID]: params.project_id
      },
      filter: {
        name: C.CAPABILITY.NETWORK_POLICIES,
      },
    };

    let promise = new Ember.RSVP.Promise((resolve, reject) => {
      let tasks = {
        allProjects:                        this.toCb(() => { return userStore.findAll('project'); }),
        project:            ['allProjects', this.toCb(() => { return userStore.find('project', params.project_id); })],
        importMembers:      ['project',     this.toCb((results) => { return results.project.importLink('projectMembers'); })],
        networks:                           this.toCb(() => { return userStore.find('network', null, {filter: {accountId: params.project_id}}); }),
        policyManagers:                     this.toCb(() => { return userStore.find('stack', null, policyManagerOpt); }),
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
            policy.pushObject(userStore.createRecord({
              type: 'networkPolicyRule',
              within: field,
              action: network.get('defaultPolicyAction'),
            }));
          }
        });
      }

      let out = Ember.Object.create({
        all: hash.allProjects,
        network: network,
        policyManager: hash.policyManagers.objectAt(0),
      });

      if ( params.editing ) {
        out.setProperties({
          originalProject: hash.project,
          project: hash.project.clone(),
        });
      } else {
        out.setProperties({
          originalProject: null,
          project: hash.project,
        });
      }

      return out;
    });
  },
});
