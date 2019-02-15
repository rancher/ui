import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import { all } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model(params) {
    if ( get(params, 'id') ) {
      return this.globalStore.find('globaldnsprovider', params.id);
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
    set(controller, 'editing', model && get(model, 'id'));
    if ( get(model, 'provider') ) {
      set(controller, 'activeProvider', get(model, 'provider'));
    }
    this._super(controller, model);
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      setProperties(controller, {
        id:             null,
        activeProvider: 'route53'
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
        name:                  '',
        route53ProviderConfig: {
          rootDomain: '',
          accessKey:  '',
          secretKey:  '',
        }
      });
    } else if ( configType === 'cloudflare' ) {
      return this.globalStore.createRecord({
        type:                     'globaldnsprovider',
        providerName:             'cloudflare',
        name:                     '',
        cloudflareProviderConfig: {
          apiEmail:   '',
          apiKey:     '',
          rootDomain: '',
        }
      });
    } else if ( configType === 'alidns' ) {
      return this.globalStore.createRecord({
        type:                     'globaldnsprovider',
        providerName:             'alidns',
        name:                     '',
        alidnsProviderConfig: {
          accessKey:  '',
          secretKey:  '',
          rootDomain: '',
        }
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
