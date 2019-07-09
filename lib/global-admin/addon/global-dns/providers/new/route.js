import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, setProperties } from '@ember/object';
import { all, reject } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model(params) {
    if ( get(params, 'id') ) {
      return this.globalStore.find('globaldnsprovider', params.id).then((resp) => {
        if (resp) {
          return resp.clone();
        } else {
          return reject('Global DNS Provider Not Found');
        }
      });
    } else {
      return this.initConfig(get(params, 'activeProvider') || 'route53');
    }
  },

  afterModel(model/* , transition */) {
    let { members } = model;

    if (members) {
      return this.fetchMembers(model);
    }


    return model;
  },

  setupController(controller, model) {
    if (model && get(model, 'id')) {
      controller.set('mode', 'edit');
    }

    if ( get(model, 'provider') ) {
      controller.set('activeProvider', get(model, 'provider'));
    }

    this._super(controller, model);
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      setProperties(controller, {
        id:             null,
        activeProvider: 'route53',
        mode:           'new',
      })
    }
  },

  queryParams: {
    id:             { refreshModel: true },
    activeProvider: { refreshModel: true },
  },

  initConfig(configType = 'route53') {
    if ( configType === 'route53' ) {
      return this.globalStore.createRecord({
        type:                  'globaldnsprovider',
        providerName:          'route53',
        route53ProviderConfig: this.globalStore.createRecord({ type: 'route53ProviderConfig' }),
      });
    } else if ( configType === 'cloudflare' ) {
      return this.globalStore.createRecord({
        type:                     'globaldnsprovider',
        providerName:             'cloudflare',
        cloudflareProviderConfig: this.globalStore.createRecord({ type: 'cloudflareProviderConfig' }),
      });
    } else if ( configType === 'alidns' ) {
      return this.globalStore.createRecord({
        type:                 'globaldnsprovider',
        providerName:         'alidns',
        alidnsProviderConfig: this.globalStore.createRecord({ type: 'alidnsProviderConfig' }),
      });
    }
  },

  fetchMembers(model) {
    let { members } = model;

    if (members) {
      const membersPromises = [];

      members.forEach((member) => {
        if (get(member, 'userPrincipalId')) {
          membersPromises.push(this.globalStore.find('principal', member.userPrincipalId));
        } else if (get(member, 'groupPrincipalId')) {
          membersPromises.push(this.globalStore.find('principal', member.groupPrincipalId));
        }
      });

      return all(membersPromises);
    }
  },

});
