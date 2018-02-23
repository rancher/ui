import { get, set, computed, setProperties } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import { alias, notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { compare as compareVersion } from 'ui/utils/parse-version';
import { task } from 'ember-concurrency';
import YAML from 'npm:yamljs';
import layout from './template';


export default Component.extend(NewOrEdit, {
  layout,
  catalog:                  service(),
  intl:                     service(),
  scope:                    service(),
  router:                   service(),
  settings:                 service(),
  globalStore:              service(),

  namespaceErrors: null,
  allTemplates:             null,
  templateResource:         null,
  namespaceResource:        null,
  versionsArray:            null,
  versionsLinks:            null,
  actuallySave:             true,
  showHeader:               true,
  showPreview:              true,
  showName:                 true,
  titleAdd:                 'newCatalog.titleAdd',
  titleUpgrade:             'newCatalog.titleUpgrade',
  selectVersionAdd:         'newCatalog.selectVersionAdd',
  selectVersionUpgrade:     'newCatalog.selectVersionUpgrade',
  saveUpgrade:              'newCatalog.saveUpgrade',
  saveNew:                  'newCatalog.saveNew',
  sectionClass:             'box mb-20',
  showDefaultVersionOption: false,

  classNames:               ['launch-catalog'],
  catalogApp:               null,
  primaryResource:          alias('namespaceResource'),
  templateBase:             alias('templateResource.templateBase'),
  editing:                  notEmpty('namespaceResource.id'),

  previewOpen:              false,
  previewTab:               null,
  questionsArray:           null,
  selectedTemplateUrl:      null,
  selectedTemplateModel:    null,
  readmeContent:            null,
  pastedAnswers:            null,

  actions: {
    cancel: function() {
      this.sendAction('cancel');
    },

    togglePreview: function() {
      this.toggleProperty('previewOpen');
    },

    selectPreviewTab: function(tab) {
      set(this, 'previewTab', tab);
    },

    changeTemplate: function(tpl) {
      get(this, 'router').transitionTo('catalog-tab.launch', tpl.id);
    },

    saveTemplate() {
      this.sendAction('templateEdited', get(this, 'namespaceResource'));
    }
  },

  init() {
    this._super(...arguments);
    set(this, 'selectedTemplateModel', null);
    scheduleOnce('afterRender', () => {
      if ( get(this, 'selectedTemplateUrl') ) {
        this.templateChanged();
      } else {
        var def = get(this, 'templateResource.defaultVersion');
        var links = get(this, 'versionLinks');
        if (links[def]) {
          set(this, 'selectedTemplateUrl', links[def]);
        } else {
          set(this, 'selectedTemplateUrl', null);
        }
      }
    });
  },

  updateReadme: function() {
    let model = get(this, 'selectedTemplateModel');
    set(this, 'readmeContent', null);
    if ( model && model.hasLink('readme') ) {
      model.followLink('readme').then((response) => {
        set(this, 'readmeContent', response);
      });
    }
  },

  sortedVersions: computed('versionsArray','templateResource.defaultVersion', function() {
    let out = get(this, 'versionsArray').sort((a,b) => {
      if ( a.sortVersion && b.sortVersion ) {
        return compareVersion(a.sortVersion, b.sortVersion);
      } else {
        return compareVersion(a.version, b.version);
      }
    });

    let def = get(this, 'templateResource.defaultVersion');
    if ( get(this, 'showDefaultVersionOption') && get(this, 'defaultUrl') ) {
      out.unshift({version:  get(this, 'intl').t('newCatalog.version.default', {version: def}), link: 'default'});
    }

    return out;
  }),

  defaultUrl: computed('templateResource.defaultVersion','versionLinks', function() {
    var defaultVersion = get(this, 'templateResource.defaultVersion');
    var versionLinks = get(this, 'versionLinks');

    if ( defaultVersion && versionLinks && versionLinks[defaultVersion] ) {
      return versionLinks[defaultVersion];
    }

    return null;
  }),

  getTemplate: task(function * () {
    var url = get(this, 'selectedTemplateUrl');

    if ( url === 'default' ) {
      let defaultUrl = get(this, 'defaultUrl');
      if ( defaultUrl ) {
        url = defaultUrl;
      } else {
        url = null;
      }
    }

    if (url) {
      var version = get(this, 'settings.rancherVersion');

      if ( version ) {
        url = Util.addQueryParam(url, 'rancherVersion', version);
      }

      var current = get(this, 'namespaceResource.answers');

      if ( !current ) {
        current = {};
        set(this, 'namespaceResource.answers', current);
      }

      var selectedTemplateModel = yield get(this, 'catalog').fetchByUrl(url).then((response) => {
        if (response.questions) {
          response.questions.forEach((item) => {
            // This will be the component that is rendered to edit this answer
            item.inputComponent = 'schema/input-'+item.type;

            // Only types marked supported will show the component, Ember will explode if the component doesn't exist
            item.supported = C.SUPPORTED_SCHEMA_INPUTS.indexOf(item.type) >= 0;

            if (typeof current[item.variable] !== 'undefined') {
              // If there's an existing value, use it (for upgrade)
              item.answer = current[item.variable];
            } else if (item.type === 'service' || item.type === 'certificate') {
                // Loaded async and then the component picks the default
            } else if ( item.type === 'boolean' ) {
              // Coerce booleans
              item.answer = (item.default === 'true' || item.default === true);
            } else {
              // Everything else
              item.answer = item.default;
            }
          });
        }
        return response;
      });

      set(this, 'selectedTemplateModel', selectedTemplateModel);
      set(this, 'previewTab', Object.keys(selectedTemplateModel.get('files')||[])[0]);
    } else {
      set(this, 'selectedTemplateModel', null);
      set(this, 'readmeContent', null);
    }

    this.updateReadme();
  }),

  templateChanged: function() {
    get(this, 'getTemplate').perform();
  }.observes('selectedTemplateUrl','templateResource.defaultVersion'),

  answers: computed('selectedTemplateModel.questions.@each.{variable,answer}', function() {
    var out = {};
    (get(this, 'selectedTemplateModel.questions') || []).forEach((item) => {
      out[item.variable] = item.answer;
    });

    return out;
  }),

  answersArray: alias('selectedTemplateModel.questions'),

  answersString: computed('answersArray.@each.{variable,answer}', function() {
    let neu = {};
    get(this, 'answersArray').forEach((a) => {
      neu[a.variable] = a.answer || a.default;
    });
    return YAML.stringify(neu);
  }),

  validate() {
    var errors = [];

    errors.pushObjects(get(this, 'namespaceErrors')||[]);

    if (get(this, 'selectedTemplateModel.questions')) {
      get(this, 'selectedTemplateModel.questions').forEach((item) => {
        if (item.required && item.type !== 'boolean' && !item.answer) {
          errors.push(`${item.label} is required`);
        }
      });
    }

    if (errors.length) {
      set(this, 'errors', errors.uniq());
      return false;
    }

    return true;
  },

  newExternalId: computed('selectedTemplateModel.id', function() {
    return C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + get(this, 'selectedTemplateModel.id');
  }),

  willSave() {
    set(this, 'errors', null);
    var ok = this.validate();
    if (!ok) {
      // Validation failed
      return false;
    }

    if ( get(this, 'actuallySave') ) {
      return true;
    } else {
      // TODO 2.0 this is part of the volumes stuff so we need to investigate if this still works
      // let versionId = null;
      // if ( get(this, 'selectedTemplateUrl') !== 'default' && get(this, 'selectedTemplateModel') ) {
      //   versionId = get(this, 'selectedTemplateModel.id');
      // }

      // this.sendAction('doSave', {
      //   answers:           get(this, 'answers'),
      //   externalId:        get(this, 'newExternalId'),
      //   templateId:        get(this, 'templateResource.id'),
      //   templateVersionId: versionId,
      // });
      return false;
    }
  },

  didSave(neu) {
    let app = get(this, 'catalogApp');

    if (get(this, 'upgrade')) {
      return app.doAction('upgrade'/* , get(this, 'upgrade') */).then(resp => {
        return resp;
        // debugger;
      }).catch(err => {
        return err;
        // debugger;
      });
    } else {
      setProperties(app, {
        installNamespace: neu.name,
        externalId: get(this, 'selectedTemplateModel.externalId'),
        projectId: get(neu, 'projectId'),
      });

      return app.save().then(() => {
        return get(this, 'primaryResource');
      });
    }
  },

  doneSaving() {
    var projectId = get(this, 'scope.currentProject.id');
    return get(this, 'router').transitionTo('apps-tab.index', projectId);
  }
});
