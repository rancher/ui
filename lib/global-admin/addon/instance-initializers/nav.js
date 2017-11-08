import { bulkAdd } from 'shared/utils/navigation-tree';

const rootNav = [

  // Admin
  {
    scope: 'admin',
    id: 'admin-accounts',
    localizedLabel: 'nav.admin.accounts',
    route: 'global-admin.accounts',
  },
  {
    scope: 'admin',
    id: 'admin-audit',
    localizedLabel: 'nav.admin.audit',
    route: 'global-admin.audit-logs',
  },
  {
    scope: 'admin',
    id: 'admin-catalogs',
    localizedLabel: 'nav.admin.catalog',
    route: 'global-admin.catalog',
  },
  {
    scope: 'admin',
    id: 'admin-settings',
    localizedLabel: 'nav.admin.settings.tab',
    route: 'global-admin.settings.index',
    submenu: [
      {
        id: 'admin-auth',
        localizedLabel: 'nav.admin.settings.auth',
        icon: 'icon icon-key',
        route: 'global-admin.settings.auth',
      },
      {
        id: 'admin-registration',
        localizedLabel: 'nav.admin.settings.registration',
        icon: 'icon icon-link',
        route: 'global-admin.settings.registration',
      },
      {
        id: 'admin-machine',
        localizedLabel: 'nav.admin.settings.machine',
        icon: 'icon icon-host',
        route: 'global-admin.settings.machine',
      },
      {
        id: 'admin-advanced',
        localizedLabel: 'nav.admin.settings.advanced',
        icon: 'icon icon-gear',
        route: 'global-admin.settings.advanced',
      },
    ],
  },
]
export function initialize(/* application */) {
  // Inject the contents of ENV.APP in config/environment.js  into all the things as an 'app' property
  bulkAdd(rootNav);
}

export default {
  name: 'nav',
  initialize: initialize
};
