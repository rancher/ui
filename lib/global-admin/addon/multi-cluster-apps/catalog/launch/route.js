import { hash, all } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get, set, setProperties } from '@ember/object';
import { randomStr } from 'shared/utils/util';
import C from 'ui/utils/constants';

export default Route.extend({
  modalService: service('modal'),
  catalog:      service(),
  scope:        service(),
  clusterStore: service(),
  store:        service(),
  globalStore:  service(),

  parentRoute:  'multi-cluster-apps.catalog',

  model(params/* , transition*/) {
    var store = get(this, 'globalStore');

    var dependencies = {
      tpl:        get(this, 'catalog').fetchTemplate(params.template),
      projects:   this.scope.getAllProjects(),
      clusters:   this.scope.getAllClusters(),
    };

    if ( params.upgrade ) {
      dependencies.upgrade = get(this, 'catalog').fetchTemplate(`${ params.template }-${ params.upgrade }`, true);
    }

    if (params.appId) {
      dependencies.app = store.find('multiclusterapp', params.appId);
    }

    return hash(dependencies, 'Load dependencies').then((results) => {
      let kind = 'helm';
      let neuApp = null;
      var links;

      // get diff versions
      links = results.tpl.versionLinks;

      var verArr = Object.keys(links).filter((key) => !!links[key])
        .map((key) => ({
          version:     key,
          sortVersion: key,
          link:        links[key]
        }));

      if (results.app) {
        if (get(params, 'clone')) {
          neuApp = results.app.cloneForNew();

          set(neuApp, 'name', this.dedupeName(results.app.name));

          if (neuApp.targets.length > 0) {
            let neuTargets = [];

            neuApp.targets.forEach((t) => {
              neuTargets.pushObject(t.cloneForNew());
            });

            set(neuApp, 'targets', neuTargets);
          }
        } else {
          neuApp = results.app.clone();
        }
      } else {
        let defaultAnswwer = store.createRecord({
          clusterId: null,
          projectId: null,
          type:      'answer',
          values:    []
        });

        neuApp = store.createRecord({
          type:      'multiclusterapp',
          answers:   [defaultAnswwer],
          catalogId: results.tpl.catalogId,
          targets:   [],
          members:   [],
          roles:     ['project-member'],
        });
      }

      if ( neuApp.id ) {
        verArr.filter((ver) => ver.version === get(neuApp, 'externalIdInfo.version'))
          .forEach((ver) => {
            set(ver, 'version', `${ ver.version } (current)`);
          })
      }

      if (results.tpl && results.tpl.id === C.STORAGE.LONGHORN_CATALOG_TEMPLATE_ID) {
        set(neuApp, 'name', C.STORAGE.LONGHORN_CATALOG_ITEM_DEFAULT_NAME);
      }

      return {
        multiClusterApp: neuApp,
        projects:        results.projects,
        clusters:        results.clusters,
        tpl:             results.tpl,
        tplKind:         kind,
        upgradeTemplate: results.upgrade,
        versionLinks:    links,
        versionsArray:   verArr,
        isClone:         get(params, 'clone') ? true : false,
      };
    });
  },

  afterModel(model/* , transition */) {
    if (get(model, 'multiClusterApp.id') && get(model, 'multiClusterApp.members.length')) {
      const membersPromises = [];

      get(model, 'multiClusterApp.members').forEach((member) => {
        let id = get(member, 'userPrincipalId') || get(member, 'groupPrincipalId');

        membersPromises.push(this.globalStore.find('principal', id));
      });

      return all(membersPromises).catch((/* err */) => {
        // we fail here when we can't look up a principal (e.g. logged in as local but its an external auth provider principal)
        return;
      });
    }

    return;
  },

  resetController(controller, isExiting/* , transition*/) {
    if (isExiting) {
      setProperties(controller, {
        appId:       null,
        catalog:     null,
        template:    null,
        upgrade:     null,
        clone:       null,
      });
    }
  },

  dedupeName(name) {
    const suffix = randomStr(5, 5, 'novowels');
    let newName  = null;

    newName = `${ name }-${ suffix }`;

    return newName;
  },
});
