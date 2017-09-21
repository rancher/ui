import Ember from 'ember';
import { parseExternalId } from 'ui/utils/parse-externalid';
import { task, timeout } from 'ember-concurrency';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  projects:            Ember.inject.service(),
  application:         Ember.inject.controller(),
  catalog:             Ember.inject.service(),
  catalogItem:         null,
  editCatalog:         false,
  selectedTemplateUrl: null,
  catalogInfo:         null,
  _catalogInfoCache:   null,
  _prefetchInstance:   null,
  catalogId:           'all',
  category:            null,
  viewCatalog:         false,

  fetchCatalogInfo: task(function * () {
    let promise = this.get('catalog').fetchCatalogs({
      headers: {
        [C.HEADER.PROJECT_ID]: this.get('projects.current.id')
      },
    }).then((catalogs) => {
      return this.get('catalog').fetchTemplates({plusInfra: true}).then((resp) => {
        resp.catalogs = catalogs;
        return resp;
      });
    });

    let response = yield promise;

    this.set('_catalogInfoCache', response);
  }).keepLatest(),

  fetchTemplates: task(function * (params) {
    let catalogInfo = this.get('_catalogInfoCache')||this.get('catalogInfo');
    let promise     = this.get('catalog').fetchTemplates(params).then((resp) => {
      return resp;
    });
    let response    = yield promise;

    Object.keys(response).forEach((key/* , idx, keys*/) => {
      catalogInfo.set(key, response[key]);
    });

  }).restartable().maxConcurrency(3),

  actions: {
    filterAction: function(catalogId){
      this.get('fetchTemplates').perform({
        "category": this.get('category'),
        "catalogId": this.set('catalogId', catalogId),
        "templateBase": "",
        "plusInfra": true
      });
    },
    categoryAction: function(category='', catalogId=''){
      this.get('fetchTemplates').perform({
        "category": this.set('category', category),
        "catalogId": this.set('catalogId', catalogId),
        "templateBase": "",
        "plusInfra": true
      });
    },
    prefetchCatalog() {
      this.set('_prefetchInstance', this.get('fetchCatalogInfo').perform());
    },
    addSystemStack() {
      if (this.get('_catalogInfoCache')) { // catalog info already prefetched so we're good
        this.set('catalogInfo', this.get('_catalogInfoCache'));
        this.set('viewCatalog', true);
      } else {
        if (this.get('_prefetchInstance.isRunning')) {
          this.get('_prefetchInstance').then(() => {// catalog info is in the process of prefetching so lets wait
            this.setProperties({
              catalogInfo: this.get('_catalogInfoCache'),
              viewCatalog: true
            });
          });
        } else {
          this.get('fetchCatalogInfo').perform().then(() => { // something went really really wrong so we should fetch again --- we shouldn't get here but lets play it safe
            this.setProperties({
              catalogInfo: this.get('_catalogInfoCache'),
              viewCatalog: true
            });
          })
        }
      }
    },
    templateEdited() {
      this.send('cancelEdit');
    },

    goToTemplate(templateId, edit=false) {
      var templateInfo =  {};
      if (edit) {
        templateInfo = parseExternalId(templateId);
      } else {
        templateInfo = {
          templateId: templateId,
          templateBase: '',
        };
      }

      this.get('catalog').fetchTemplate(templateInfo.templateId).then((template) => {
        var stack = this.get('model.cluster.systemStacks').find((stack) => {
          if (stack.get('externalId').indexOf(templateInfo.templateId) >= 0) {
            return stack;
          }
        });

        if (!stack) {
          stack = this.get('store').createRecord({
            type: 'stack',
            name: template.get('defaultName'),
            system: (template.get('templateBase') === C.EXTERNAL_ID.KIND_INFRA),
            environment: {}, // Question answers
          });
        }
        debugger;

        var neu = Ember.Object.create({
          stack:         stack,
          tpl:           template,
          upgrade:       false,
          versionLinks:  template.versionLinks,
          versionsArray: this.get('catalog').cleanVersionsArray(template),
          allTemplates:  this.get('model.allTemplates'),
          templateBase:  templateInfo.base,
        });

        this.setProperties({
          selectedTemplateUrl: template.versionLinks[templateInfo.version],
          catalogItem:         neu,
          editCatalog:         true,
        });
      });
    },

    done() {
      this.send('goToPrevious','authenticated.clusters');
    },

    cancelEdit() {
      this.setProperties({
        editCatalog:         false,
        selectedTemplateUrl: null,
        catalogItem:         null,
      });
    },

    cancel() {
      this.send('goToPrevious','authenticated.clusters');
    },
  },
});
