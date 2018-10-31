import { inject as service } from '@ember/service';
import { computed, get, set } from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
  access:      service(),
  globalStore: service(),

  lastRoute:                'global-admin.security.authentication.github',

  drivers:   computed(function() {
    return [
      {
        route:        'security.authentication.activedirectory',
        label:        'Active Directory',
        css:          'activedirectory',
        available:    this.hasRecord('activedirectoryconfig'),
        providerType: null,
      },
      {
        route:        'security.authentication.azuread',
        label:        'Azure AD',
        css:          'azuread',
        available:    this.hasRecord('azureadconfig'),
        providerType: null,
      },
      {
        route:        'security.authentication.github',
        label:        'GitHub',
        css:          'github',
        available:    this.hasRecord('githubconfig'),
        providerType: null,
      },
      {
        route:        'security.authentication.ping',
        label:        'Ping',
        css:          'ping',
        available:    this.hasRecord('pingconfig'),
        providerType: 'saml',
      },
      {
        route:        'security.authentication.keycloak',
        label:        'Keycloak',
        css:          'keycloak',
        available:    this.hasRecord('keycloakconfig'),
        providerType: 'saml',
      },
      {
        route:        'security.authentication.adfs',
        label:        'AD FS',
        css:          'adfs',
        available:    this.hasRecord('adfsconfig'),
        providerType: 'saml',
      },
      {
        route:        'security.authentication.freeipa',
        label:        'FreeIPA',
        css:          'freeipa',
        available:    this.hasRecord('freeipaconfig'),
        providerType: 'ldap',
      },
      {
        route:        'security.authentication.openldap',
        label:        'OpenLDAP',
        css:          'openldap',
        available:    this.hasRecord('openldapconfig'),
        providerType: 'ldap',
      },
      // {route: 'security.authentication.shibboleth',      label:   'Shibboleth',        css: 'shibboleth',      available: this.hasRecord('shibbolethconfig')  },
    ];
  }),

  showWarning: computed('filteredDrivers.[]', function() {
    const providers   = get(this, 'globalStore').all('authconfig').filterBy('enabled');

    return providers.length > 1 ? true : false;
  }),

  filteredDrivers: computed(function() {
    // this is a soft disable of allowing multiple auth configs being active, we need to disable it right now but it will come back post 2.1
    // when it does just itterate over the drivers again and remove filteredDrivers
    const { drivers } = this;
    const providers   = get(this, 'globalStore').all('authconfig').filterBy('enabled');

    if (providers.length === 1) {
      // all drivers available
      return drivers;
    } else if (providers.length === 2) {
      // local +1, only enabled drivers, can not enable new drivers
      drivers.forEach((driver) => {
        const provider = providers.findBy('id', driver.css);

        if (!provider || driver.css !== provider.id) {
          set(driver, 'available', false);
        }
      });
    } else if (providers.length > 2) {
      // local + n, can't enable new but can edit or disable
      drivers.forEach((driver) => {
        const provider = providers.findBy('id', driver.css);

        if (!provider || driver.css !== provider.id) {
          set(driver, 'available', false);
        }
      });
    }

    return drivers.filterBy('available');
  }),

  hasRecord(record) {
    let type = 'schema';
    let store = this.get('globalStore');

    return store.hasRecordFor(type, record);
  },
});
