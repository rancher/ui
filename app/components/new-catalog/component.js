import { get, set, computed, setProperties } from '@ember/object';
import { resolve } from 'rsvp';
import { scheduleOnce } from '@ember/runloop';
import { alias, notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { task } from 'ember-concurrency';
import YAML from 'yamljs';
import layout from './template';
import { isEmpty } from '@ember/utils';
import CatalogApp from 'shared/mixins/catalog-app';
import { isNumeric } from 'shared/utils/util';
import convertDotAnswersToYaml from 'shared/utils/convert-yaml';
import ChildHook from 'shared/mixins/child-hook';
import flatMap from 'shared/utils/flat-map';
import $ from 'jquery';

export default Component.extend(NewOrEdit, CatalogApp, ChildHook, {
  catalog:                  service(),
  intl:                     service(),
  scope:                    service(),
  router:                   service(),
  settings:                 service(),
  globalStore:              service(),

  layout,
  namespaceErrors:          null,
  templateResource:         null,
  namespaceResource:        null,
  versionsArray:            null,
  versionsLinks:            null,
  namespaces:               null,
  actuallySave:             true,
  showHeader:               true,
  showPreview:              true,
  customizeNamespace:       false,
  decoding:                 false,
  forceUpgrade:             false,
  istio:                    false,
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
  srcSet:                   false,

  detailExpanded:           false,
  previewOpen:              false,
  previewTab:               null,
  questionsArray:           null,
  selectedTemplateUrl:      null,
  selectedTemplateModel:    null,
  catalogTemplate:          null,
  readmeContent:            null,
  appReadmeContent:         null,
  pastedAnswers:            null,
  noAppReadme:              null,
  selectedFileContetnt:     null,
  editable:              { selectedTemplateUrl: null },

  isGKE:                    alias('scope.currentCluster.isGKE'),

  primaryResource:          alias('namespaceResource'),
  editing:                  notEmpty('catalogApp.id'),
  requiredNamespace:        alias('selectedTemplateModel.requiredNamespace'),

  init() {
    this._super(...arguments);
    set(this, 'selectedTemplateModel', null);

    scheduleOnce('afterRender', () => {
      if ( get(this, 'selectedTemplateUrl') ) {
        if (this.catalogTemplate) {
          this.initTemplateModel(this.catalogTemplate);
        } else {
          this.templateChanged();
        }
      } else {
        var def   = get(this, 'templateResource.defaultVersion');
        var links = get(this, 'versionLinks');
        var app   = get(this, 'catalogApp');

        if (get(app, 'id') && !get(this, 'upgrade')) {
          def = get(app, 'externalIdInfo.version');
        }

        if (links[def]) {
          set(this, 'selectedTemplateUrl', links[def]);
        } else {
          set(this, 'selectedTemplateUrl', null);
        }
      }
      set(this, 'editable.selectedTemplateUrl', get(this, 'selectedTemplateUrl'));
    });
  },

  didRender() {
    if (!this.get('srcSet')) {
      set(this, 'srcSet', true);

      const $icon = $('img');

      $icon.attr('src', $icon.data('src'));

      $('img').on('error', () => {
        $icon.attr('src', `${ this.get('app.baseAssets') }assets/images/generic-catalog.svg`);
      });
    }
  },

  actions: {
    toogleDetailedDescriptions() {
      set(this, 'detailExpanded', true);
    },

    toogleNamespace() {
      set(this, 'customizeNamespace', true);
    },

    cancel() {
      if ( get(this, 'istio') ) {
        const projectId = get(this, 'scope.currentProject.id');

        get(this, 'router').transitionTo('authenticated.project.istio.project-istio.rules', projectId);
      } else if ( this.cancel ) {
        this.cancel();
      }
    },

    togglePreview() {
      this.toggleProperty('previewOpen');
    },

    selectPreviewTab(tab) {
      set(this, 'previewTab', tab);
    },
  },

  answersArray: computed('selectedTemplateModel.questions', 'selectedTemplateModel.customAnswers', 'catalogApp.answers', function() {
    let model = get(this, 'selectedTemplateModel');

    if (get(model, 'questions')) {
      const questions = [];

      (get(this, 'selectedTemplateModel.questions') || []).forEach((q) => {
        questions.push(q);
        const subquestions = get(q, 'subquestions');

        if ( subquestions ) {
          questions.pushObjects(subquestions);
        }
      });

      const customAnswers = get(this, 'selectedTemplateModel.customAnswers') || {};

      Object.keys(customAnswers).forEach((key) => {
        questions.push({
          variable: key,
          answer:   customAnswers[key],
        });
      });

      return questions;
    } else {
      return get(this, 'catalogApp.answers');
    }
  }),

  answersString: computed('answersArray.@each.{variable,answer}', 'selectedTemplateModel.valuesYaml', function() {
    let model = get(this, 'selectedTemplateModel');

    if (get(model, 'questions')) {
      let neu = {};

      if (model.valuesYaml && model.valuesYaml.length > 0) {
        neu = YAML.parse(model.valuesYaml);
        neu = flatMap(neu);
      } else {
        (get(this, 'answersArray') || []).forEach((a) => {
          neu[a.variable] = isEmpty(a.answer) ? a.default : a.answer;
        });
      }

      const customAnswers = get(model, 'customAnswers') || {};

      Object.keys(customAnswers).forEach((key) => {
        neu[key] = customAnswers[key];
      });

      return YAML.stringify(neu);
    } else {
      return JSON.stringify(get(this, 'answersArray'));
    }
  }),

  getTemplate: task(function * () {
    var url = get(this, 'editable.selectedTemplateUrl');

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

      var current = get(this, 'catalogApp.answers');

      if ( !current ) {
        current = {};
        set(this, 'catalogApp.answers', current);
      }

      var selectedTemplateModel = yield get(this, 'catalog').fetchByUrl(url)
        .then((response) => {
          if (response.questions) {
            this.parseQuestionsAndAnswers(response, current);
          }

          return response;
        });

      if (selectedTemplateModel && selectedTemplateModel.requiredNamespace) {
        set(this, 'primaryResource.name', selectedTemplateModel.requiredNamespace);
      }

      set(this, 'selectedTemplateModel', selectedTemplateModel);

      this.initPreviewTab(selectedTemplateModel);
    } else {
      setProperties(this, {
        selectedTemplateModel: null,
        readmeContent:         null,
        appReadmeContent:      null,
        noAppReadme:           false,
      });
    }

    this.updateReadme();
  }),

  initTemplateModel(templateModel) {
    let currentAnswers = get(this, 'catalogApp.answers') || {};

    this.parseQuestionsAndAnswers(templateModel, currentAnswers);
    this.initPreviewTab(templateModel);

    set(this, 'selectedTemplateModel', templateModel);

    this.updateReadme();
  },

  initPreviewTab(selectedTemplateModel) {
    const files = Object.keys(selectedTemplateModel.get('files')) || [];

    if ( files.length > 0 ) {
      const valuesYaml = files.find((file) => file.endsWith('/values.yaml'));

      set(this, 'previewTab', valuesYaml ? valuesYaml : files[0]);
    }
  },

  parseQuestionsAndAnswers(template, currentAnswers) {
    const questions     = [];
    const customAnswers = {};

    (template.questions || []).forEach((q) => {
      questions.push(q);
      const subquestions = get(q, 'subquestions');

      if ( subquestions ) {
        questions.pushObjects(subquestions);
      }
    });

    questions.forEach((item) => {
      // This will be the component that is rendered to edit this answer
      item.inputComponent = `schema/input-${ item.type }`;

      // Only types marked supported will show the component, Ember will explode if the component doesn't exist
      item.supported = C.SUPPORTED_SCHEMA_INPUTS.indexOf(item.type) >= 0;

      if (typeof currentAnswers[item.variable] !== 'undefined') {
        // If there's an existing value, use it (for upgrade)
        item.answer = currentAnswers[item.variable];
      } else if (item.type === 'service' || item.type === 'certificate') {
        // Loaded async and then the component picks the default
      } else if ( item.type === 'boolean' ) {
        // Coerce booleans
        item.answer = (item.default === 'true' || item.default === true);
      } else {
        // Everything else
        item.answer = item.default || null;
      }
    });

    Object.keys(currentAnswers).forEach((key) => {
      const q = questions.findBy('variable', key);

      if ( !q ) {
        customAnswers[key] = currentAnswers[key];
      }
    });

    template.customAnswers = customAnswers;
  },

  validate() {
    this._super();

    const errors = get(this, 'errors') || [];

    errors.pushObjects(get(this, 'namespaceErrors') || []);
    errors.pushObjects(get(this, 'selectedTemplateModel').validationErrors(this.answers) || []);

    if (errors.length) {
      set(this, 'errors', errors.uniq());

      return false;
    }

    return true;
  },

  doSave() {
    const requiredNamespace = get(this, 'requiredNamespace');

    if ( requiredNamespace && (get(this, 'namespaces') || []).findBy('id', requiredNamespace) ) {
      return resolve(get(this, 'primaryResource'));
    }

    return this._super(...arguments);
  },

  willSave() {
    set(this, 'errors', null);
    var ok = this.validate();

    if (!ok) {
      // Validation failed
      return false;
    }
    if ( get(this, 'actuallySave') ) {
      if (!get(this, 'selectedTemplateModel.valuesYaml') && get(this, 'selectedTemplateModel.questions')) {
        set(get(this, 'catalogApp'), 'answers', get(this, 'answers'));
      }

      return this.applyHooks('_beforeSaveHooks').catch((err) => {
        set(this, 'errors', [err.message]);

        return false;
      });
    } else {
      // TODO 2.0 this is part of the volumes stuff so we need to investigate if this still works
      // let versionId = null;
      // if ( get(this, 'selectedTemplateUrl') !== 'default' && get(this, 'selectedTemplateModel') ) {
      //   versionId = get(this, 'selectedTemplateModel.id');
      // }

      // if (this.doSave) {
      //   this.doSave({
      //     answers:           get(this, 'answers'),
      //     externalId:        get(this, 'newExternalId'),
      //     templateId:        get(this, 'templateResource.id'),
      //     templateVersionId: versionId,
      //   });
      // }
      return false;
    }
  },

  didSave(neu) {
    let app  = get(this, 'catalogApp');
    let yaml = get(this, 'selectedTemplateModel.valuesYaml');

    if ( !yaml && this.shouldFallBackToYaml() ) {
      const questions = get(this, 'selectedTemplateModel.allQuestions') || [];
      const input     = {};

      questions.forEach((q) => {
        if ( q.answer !== undefined && q.answer !== null ) {
          input[q.variable] = q.answer;
        } else if ( q.default !== undefined && q.default !== null ) {
          input[q.variable] = q.default;
        } else {
          input[q.variable] = '';
        }
      });
      yaml = convertDotAnswersToYaml(input);
    }

    if (get(app, 'id')) {
      return app.doAction('upgrade', {
        externalId:   get(this, 'selectedTemplateModel.externalId'),
        answers:      yaml ? {} : get(app, 'answers'),
        valuesYaml:   yaml ? yaml : '',
        forceUpgrade: get(this, 'forceUpgrade'),
      }).then((resp) => resp)
        .catch((err) => err);
    } else {
      const requiredNamespace = get(this, 'requiredNamespace');

      setProperties(app, {
        targetNamespace: requiredNamespace ? requiredNamespace : neu.name,
        externalId:      get(this, 'selectedTemplateModel.externalId'),
        projectId:       get(neu, 'projectId'),
        answers:         yaml ? {} : get(app, 'answers'),
        valuesYaml:      yaml ? yaml : '',
      });

      return app.save().then(() => get(this, 'primaryResource'));
    }
  },

  doneSaving() {
    var projectId = get(this, 'scope.currentProject.id');

    if ( get(this, 'istio') ) {
      return get(this, 'router').transitionTo('authenticated.project.istio.project-istio.rules', projectId);
    } else {
      return get(this, 'router').transitionTo('apps-tab.index', projectId);
    }
  },

  shouldFallBackToYaml() {
    const questions = get(this, 'selectedTemplateModel.allQuestions') || [];

    return !!questions.some((question) => get(question, 'type') === 'password' && !!isNumeric(get(question, 'answer')) && get(question, 'answer') !== '');
  },
});
