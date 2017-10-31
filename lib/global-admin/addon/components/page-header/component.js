import PageHeader from 'shared/components/page-header/component';
import { bulkAdd } from 'shared/utils/navigation-tree';

const rootNav = [

  // Admin
  // {
  //   scope: 'admin',
  //   id: 'admin-accounts',
  //   localizedLabel: 'nav.admin.accounts',
  //   route: 'admin-tab.accounts',
  // },
  // {
  //   scope: 'admin',
  //   id: 'admin-audit',
  //   localizedLabel: 'nav.admin.audit',
  //   route: 'admin-tab.audit-logs',
  // },
  // {
  //   scope: 'admin',
  //   id: 'admin-catalogs',
  //   localizedLabel: 'nav.admin.catalog',
  //   route: 'admin-tab.catalog',
  // },
  // {
  //   scope: 'admin',
  //   id: 'admin-ha',
  //   localizedLabel: 'nav.admin.ha',
  //   route: 'admin-tab.ha',
  // },
  // {
  //   scope: 'admin',
  //   id: 'admin-processes',
  //   localizedLabel: 'nav.admin.processes',
  //   route: 'admin-tab.processes',
  //   submenu: [
  //     {
  //       id: 'processes-summary',
  //       localizedLabel: 'processesPage.tab.summary',
  //       route: 'admin-tab.processes.index',
  //     },
  //     {
  //       id: 'processes-pools',
  //       localizedLabel: 'processesPage.tab.pools',
  //       route: 'admin-tab.processes.pools',
  //       condition: function() { return false; },
  //     },
  //     {
  //       id: 'processes-running',
  //       localizedLabel: 'processesPage.tab.running',
  //       route: 'admin-tab.processes.list',
  //       qp: {which: 'running'},
  //     },
  //     {
  //       id: 'processes-ready',
  //       localizedLabel: 'processesPage.tab.ready',
  //       route: 'admin-tab.processes.list',
  //       qp: {which: 'ready'},
  //     },
  //     {
  //       id: 'processes-delayed',
  //       localizedLabel: 'processesPage.tab.delayed',
  //       route: 'admin-tab.processes.list',
  //       qp: {which: 'delayed'},
  //     },
  //     {
  //       id: 'processes-completed',
  //       localizedLabel: 'processesPage.tab.completed',
  //       route: 'admin-tab.processes.list',
  //       qp: {which: 'completed'},
  //     },
  //   ],
  // },
  // {
  //   scope: 'admin',
  //   id: 'admin-settings',
  //   localizedLabel: 'nav.admin.settings.tab',
  //   route: 'admin-tab.settings.index',
  //   submenu: [
  //     {
  //       id: 'admin-auth',
  //       localizedLabel: 'nav.admin.settings.auth',
  //       icon: 'icon icon-key',
  //       route: 'admin-tab.settings.auth',
  //     },
  //     {
  //       id: 'admin-registration',
  //       localizedLabel: 'nav.admin.settings.registration',
  //       icon: 'icon icon-link',
  //       route: 'admin-tab.settings.registration',
  //     },
  //     {
  //       id: 'admin-machine',
  //       localizedLabel: 'nav.admin.settings.machine',
  //       icon: 'icon icon-host',
  //       route: 'admin-tab.settings.machine',
  //     },
  //     {
  //       id: 'admin-advanced',
  //       localizedLabel: 'nav.admin.settings.advanced',
  //       icon: 'icon icon-gear',
  //       route: 'admin-tab.settings.advanced',
  //     },
  //   ],
  // },
]

export default PageHeader.extend({
  init() {
    bulkAdd(rootNav);
    this._super(...arguments);
  }
});
