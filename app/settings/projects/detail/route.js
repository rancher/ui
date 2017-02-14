import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  queryParams: {
    editing: {
      refreshModel: true
    }
  },

  model: function(params /* , transition*/) {
    var userStore = this.get('userStore');
    return userStore.findAll('project').then((all) => {
      return userStore.find('project', params.project_id).then((project) => {
        return userStore.find('network', null, {filter: {accountId: params.project_id}}).then((networks) => {
          return Ember.RSVP.hash({
            importProject: project.importLink('projectMembers'),
          }).then((/*hash*/) => {

            let network = networks.find((x) => C.PROJECT.SUPPORTS_NETWORK_POLICY.includes(x.get('name')));
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
              const fields = userStore.getById('schema','networkpolicyrule').optionsFor('within');
              fields.forEach((field) => {
                let rule = policy.findBy('within', field);
                if ( !rule ) {
                  policy.pushObject(userStore.createRecord({
                    type: 'networkPolicyRule',
                    within: field,
                    action: 'allow'
                  }));
                }
              });
            }

            let out = Ember.Object.create({
              all: all,
              network: network,
            });

            if ( params.editing ) {
              out.setProperties({
                originalProject: project,
                project: project.clone(),
              });
            } else {
              out.setProperties({
                originalProject: null,
                project: project,
              });
            }

            return out;
          });
        });
      });
    });
  },
});
