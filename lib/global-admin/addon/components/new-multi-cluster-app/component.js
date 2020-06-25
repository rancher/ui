import Errors from 'ui/utils/errors';
import {
  get, set, computed, setProperties, observer
} from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import { alias, notEmpty, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { task } from 'ember-concurrency';
import YAML from 'yamljs';
import layout from './template';
import { stringifyAnswer } from 'shared/utils/evaluate';
import { isEmpty } from '@ember/utils';
import CatalogApp from 'shared/mixins/catalog-app';
import { all } from 'rsvp';
import { evaluate } from 'shared/utils/evaluate';
import $ from 'jquery';

const OVERRIDE_HEADERS = [
  {
    translationKey: 'newMultiClusterApp.overrides.table.scope',
    name:           'scope',
    sort:           ['scope'],
  },
  {
    translationKey: 'newMultiClusterApp.overrides.table.question',
    name:           'question',
    sort:           ['question'],
  },
  {
    translationKey: 'newMultiClusterApp.overrides.table.answer',
    name:           'answer',
    sort:           ['answer'],
  },
];

export default Component.extend(NewOrEdit, CatalogApp, {
  catalog:                   service(),
  intl:                      service(),
  scope:                     service(),
  router:                    service(),
  settings:                  service(),
  globalStore:               service(),

  layout,
  allTemplates:              null,
  templateResource:          null,
  versionsArray:             null,
  versionsLinks:             null,
  actuallySave:              true,
  showHeader:                true,
  showPreview:               true,
  decoding:                  false,
  upgradeStrategy:           false,
  titleAdd:                  'newCatalog.titleAdd',
  titleUpgrade:              'newCatalog.titleUpgrade',
  selectVersionAdd:          'newCatalog.selectVersionAdd',
  selectVersionUpgrade:      'newCatalog.selectVersionUpgrade',
  saveUpgrade:               'newCatalog.saveUpgrade',
  saveNew:                   'newCatalog.saveNew',
  sectionClass:              'box mb-20',
  showDefaultVersionOption:  false,

  classNames:                ['launch-catalog', 'launch-multicluster-app'],
  multiClusterApp:           null,
  srcSet:                    false,

  detailExpanded:            false,
  previewOpen:               false,
  previewTab:                null,
  questionsArray:            null,
  selectedTemplateUrl:       null,
  selectedTemplateModel:     null,
  readmeContent:             null,
  appReadmeContent:          null,
  pastedAnswers:             null,
  noAppReadme:               null,
  selectedFileContetnt:      null,
  answerOverrides:           null,
  projects:                  null,
  clusters:                  null,
  isClone:                   false,
  projectsToAddOnUpgrade:    null,
  projectsToRemoveOnUpgrade: null,
  editable:                  null,
  mcAppIsSaving:             false,

  overridesHeaders:          OVERRIDE_HEADERS,

  isGKE:                     alias('scope.currentCluster.isGKE'),

  primaryResource:           alias('multiClusterApp'),
  editing:                   notEmpty('primaryResource.id'),
  isLonghorn:                equal('templateResource.id', C.STORAGE.LONGHORN_CATALOG_TEMPLATE_ID),

  init() {
    this._super(...arguments);

    set(this, 'editable', {
      selectedTemplateUrl: null,
      multiClusterApp:     { targets: [], },
    });

    this.initAttrs();
    this.initUpgradeStrategy();

    scheduleOnce('afterRender', () => {
      if ( get(this, 'selectedTemplateUrl') ) {
        this.templateChanged();
      } else {
        this.initSelectedTemplateModel();
      }

      set(this, 'editable.selectedTemplateUrl', get(this, 'selectedTemplateUrl'));
    });
    if (get(this, 'multiClusterApp.targets')) {
      set(this, 'editable.multiClusterApp.targets', [...get(this, 'multiClusterApp.targets')]);
    }
  },

  didRender() {
    this.initCatalogIcon();
  },

  actions: {
    addTarget(targetIn) {
      if (targetIn && !get(targetIn, 'type')) {
        const {
          editing, projectsToAddOnUpgrade, projectsToRemoveOnUpgrade
        }    = this;
        const multiClusterApp = this.editable.multiClusterApp;

        let target = null;
        let toRemoveMatch = (projectsToRemoveOnUpgrade || []).findBy('projectId', get(targetIn, 'value'));

        if (toRemoveMatch) {
          // a project was remove then re-added
          this.projectsToRemoveOnUpgrade.removeObject(targetIn);

          target = toRemoveMatch;
        } else {
          target = this.globalStore.createRecord({
            type:      'target',
            projectId: get(targetIn, 'value'),
          });
        }

        if (editing) {
          projectsToAddOnUpgrade.pushObject(target);
        }

        if (multiClusterApp.targets) {
          multiClusterApp.targets.pushObject(target);
        } else {
          set(multiClusterApp, 'targets', [target]);
        }
      }
    },

    removeTarget(target) {
      const {
        editing, projectsToRemoveOnUpgrade, projectsToAddOnUpgrade
      } = this;

      let targetToAddMatch = (projectsToAddOnUpgrade || []).findBy('projectId', get(target, 'projectId'));

      if (targetToAddMatch) {
        // a project was added then removed
        this.projectsToAddOnUpgrade.removeObject(targetToAddMatch);
      } else {
        if (editing) {
          projectsToRemoveOnUpgrade.pushObject(target);
        }
      }

      get(this, 'editable.multiClusterApp.targets').removeObject(target);
    },

    addRole(roleId, roleToRemove) {
      let { roles } = this.multiClusterApp;

      if (!roles) {
        roles = [];
      }

      if (roles.indexOf(roleToRemove) > -1) {
        roles.removeObject(roleToRemove);
      }

      if (roleId !== '') {
        roles.pushObject(roleId);

        set(this, 'multiClusterApp.roles', roles);
      } else {
        // its possible that the user set extra roles via the api, we shouldn't clobber those roles as well.
        if (roles.length > 1) {
          set(this, 'multiClusterApp.roles', roles);
        } else {
          set(this, 'multiClusterApp.roles', null);
        }
      }
    },

    addAuthorizedPrincipal(principal) {
      if (principal) {
        let { members = [] } = this.multiClusterApp;

        if (!members) {
          members = [];
        }

        members.pushObject(principal);

        set(this, 'multiClusterApp.members', members);
      }
    },

    removeMember(member) {
      let { members } = this.multiClusterApp;

      members.removeObject(member);
    },

    gotError(err) {
      set(this, 'errors', [Errors.stringify(err)]);
    },

    addAnswerOverride() {
      let { answerOverrides } = this;
      let nueOverride = {
        scope:         null,
        question:      null,
        answer:        null,
        isSubQuestion: false,
      }

      if (answerOverrides) {
        answerOverrides.pushObject(nueOverride);
      } else {
        answerOverrides = [nueOverride];
      }

      set(this, 'answerOverrides', answerOverrides);
    },

    removeAnswerOverride(answer) {
      this.answerOverrides.removeObject(answer);
    },

    addDependentSubQuestions(answers) {
      let { answerOverrides } = this;

      answerOverrides.pushObjects(answers);
    },

    removeDependentSubQuestions(answers) {
      let { answerOverrides } = this;

      answerOverrides.removeObjects(answers);
    },

    toogleDetailedDescriptions() {
      set(this, 'detailExpanded', true);
    },

    cancel() {
      if (this.cancel) {
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

  updateAnswerOverrides: observer('selectedTemplateModel', 'multiClusterApp.answers.@each.{values}', function() {
    if (this.mcAppSaving) {
      return;
    }

    let { selectedTemplateModel = {} } = this;

    const questions       = get(selectedTemplateModel, 'questions')
    const customAnswers   = questions ? get(selectedTemplateModel, 'customAnswers') : get(this, 'multiClusterApp.answers');
    const answerOverrides = [];

    Object.keys(customAnswers).forEach( (customAnswerKey) => {
      let answer = get(customAnswers, customAnswerKey);

      if (isGlobalAnswersCollection(answer)) {
        if (this.isClone || this.editing) {
          Object.keys(answer.values).forEach((valueKey) => {
            ( questions || []).forEach((q) => {
              if (get(q, 'variable') === valueKey) {
                customAnswers[customAnswerKey];
                let allAnswersFromInput = get(customAnswers, `${ customAnswerKey }.values`);
                let answerFromInput     = allAnswersFromInput ? allAnswersFromInput[valueKey] : null;

                try {
                  answerFromInput = JSON.parse(answerFromInput)
                } catch (e) {
                }

                set(q, 'answer', answerFromInput);
              } else if (get(q, 'subquestions') && get(q, 'subquestions').findBy('variable', valueKey)) {
                let sqMatch             = get(q, 'subquestions').findBy('variable', valueKey);
                let allAnswersFromInput = get(customAnswers, `${ customAnswerKey }.values`);
                let answerFromInput     = allAnswersFromInput ? allAnswersFromInput[valueKey] : null;

                set(sqMatch, 'answer', answerFromInput);
              }
            });
          });
        }
      } else {
        Object.keys(answer.values).forEach((valueKey) => {
          let isSubQuestion = false;

          (questions || []).forEach((q) => {
            if (get(q, 'subquestions') && get(q, 'subquestions').findBy('variable', valueKey)) {
              isSubQuestion  = true;
            }
          });

          let nueOverride = {
            scope:         answer.clusterId || answer.projectId,
            answer:        answer.values[valueKey] ? answer.values[valueKey] : null,
            question:      valueKey,
            isSubQuestion,
          }

          answerOverrides.pushObject(nueOverride);
        });
      }
    });

    set(this, 'answerOverrides', answerOverrides);

    function isGlobalAnswersCollection(answer) {
      if (isEmpty(answer.clusterId) && isEmpty(answer.projectId)) {
        return true;
      } else {
        return false;
      }
    }
  }),

  upgradeStrategyChanged: observer('upgradeStrategy', function() {
    const {
      upgradeStrategy, multiClusterApp, globalStore
    } = this;

    if (upgradeStrategy) {
      set(multiClusterApp, 'upgradeStrategy', globalStore.createRecord({
        type:          'upgradeStrategy',
        rollingUpdate: globalStore.createRecord({
          type:      'rollingUpdate',
          batchSize: 1,
          interval:  1,
        })
      }));
    } else {
      set(multiClusterApp, 'upgradeStrategy', null);
    }
  }),

  templateOrHelmChartQuestions: computed('selectedTemplateModel', 'selectedTemplateModel.allQuestions.@each.{answer,variable}', function() {
    let { selectedTemplateModel, multiClusterApp } = this;
    let nueQuestions = [];

    if (get(selectedTemplateModel, 'questions')) {
      return get(selectedTemplateModel, 'questions');
    } else {
      if (get(multiClusterApp, 'answers.firstObject.values')) {
        let helmQuestions = get(multiClusterApp, 'answers.firstObject.values');

        nueQuestions = Object.keys(helmQuestions).map((qk) => {
          return {
            variable: qk,
            answer:   helmQuestions[qk],
          };
        });
      }

      return nueQuestions;
    }
  }),

  answers: computed('templateOrHelmChartQuestions.@each.{variable,answer}', function() {
    const out = {};

    const allQuestions = [];

    (get(this, 'templateOrHelmChartQuestions') || []).forEach((item) => {
      allQuestions.push(item);
      (get(item, 'subquestions') || []).forEach((sub) => {
        allQuestions.push(sub);
      });
    });

    const filteredQuestions = allQuestions.filter((q) => evaluate(q, allQuestions));

    filteredQuestions.forEach((item) => {
      out[item.variable] = stringifyAnswer(item.answer);
    });

    return out;
  }),

  answersArray: computed('selectedTemplateModel.questions', 'selectedTemplateModel.customAnswers', 'primaryResource.answers', function() {
    const model = get(this, 'selectedTemplateModel');

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
      return get(this, 'primaryResource.answers.firstObject.values');
    }
  }),

  answersString: computed('answersArray.@each.{variable,answer}', function() {
    const model = get(this, 'selectedTemplateModel');

    if (get(model, 'questions')) {
      let neu = {};

      (get(this, 'answersArray') || []).filter((a) => typeof a.answer !== 'object' ).forEach((a) => {
        neu[a.variable] = isEmpty(a.answer) ? a.default : a.answer;
      });

      const customAnswers = get(model, 'customAnswers') || {};

      Object.keys(customAnswers).forEach((key) => {
        if ( typeof customAnswers[key] !== 'object' ) {
          neu[key] = customAnswers[key];
        }
      });

      return YAML.stringify(neu);
    } else {
      return JSON.stringify(get(this, 'answersArray'));
    }
  }),

  allProjectsAndClustersUngrouped: computed('projects.[]', 'primaryResource.targets.@each.projectId', function() {
    let out = [];

    get(this, 'clusters').forEach( (c) => {
      out.pushObject({
        name:      get(c, 'name'),
        value:     get(c, 'id'),
        isCluster: true,
      });

      c.get('projects').forEach( (p) => {
        out.pushObject({
          name:      get(p, 'name'),
          value:     get(p, 'id'),
          isProject: true,
        });
      });
    });

    return out;
  }),


  getTemplate: task(function * () {
    let url = get(this, 'editable.selectedTemplateUrl');

    if ( url === 'default' ) {
      let defaultUrl = get(this, 'defaultUrl');

      if ( defaultUrl ) {
        url = defaultUrl;
      } else {
        url = null;
      }
    }

    if (url) {
      let version = get(this, 'settings.rancherVersion');

      if ( version ) {
        url = Util.addQueryParam(url, 'rancherVersion', version);
      }

      let current = get(this, 'primaryResource.answers');

      if ( !current ) {
        current = {};
        set(this, 'primaryResource.answers', current);
      }

      var selectedTemplateModel = yield get(this, 'catalog').fetchByUrl(url)
        .then((response) => {
          if (response.questions) {
            const questions = [];
            const customAnswers = {};

            response.questions.forEach((q) => {
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
                item.answer = item.default || null;
              }
            });

            Object.keys(current).forEach((key) => {
              const q = questions.findBy('variable', key);

              if ( !q ) {
                customAnswers[key] = current[key];
              }
            });

            response.customAnswers = customAnswers;
          }

          return response;
        });

      setProperties(this, {
        selectedTemplateModel,
        'primaryResource.templateVersionId': selectedTemplateModel.id,
      });

      const files = Object.keys(selectedTemplateModel.get('files')) || [];

      if ( files.length > 0 ) {
        const valuesYaml = files.find((file) => file.endsWith('/values.yaml'));

        set(this, 'previewTab', valuesYaml ? valuesYaml : files[0]);
      }
    } else {
      setProperties(this, {
        selectedTemplateModel: null,
        readmeContent:         null,
        appReadmeContent:      null,
        noAppReadme:           false,
      })
    }

    this.updateReadme();
  }),

  validate() {
    this._super(...arguments);
    const errors = get(this, 'errors') || [];

    errors.pushObjects(get(this, 'selectedTemplateModel').validationErrors(this.answers) || []);
    errors.pushObjects(this.validateTargetsProjectIds());

    set(this, 'errors', errors.uniq());

    return errors.length === 0;
  },

  validateTargetsProjectIds() {
    let errors = [];
    let targets = get(this, 'editable.multiClusterApp.targets');

    if (targets && targets.length >= 1) {
      targets.forEach((target) => {
        if (!get(target, 'projectId')) {
          errors.push(this.intl.t('validation.targets.missingProjectId'));
        }
      });
    }

    return errors;
  },

  willSave() {
    set(this, 'errors', null);

    const { primaryResource } = this;

    set(primaryResource, 'targets', this.editable.multiClusterApp.targets);
    set(primaryResource, 'answers', this.buildAnswerMap())

    const ok = this.validate();

    if (!ok) {
      // Validation failed
      return false;
    }

    if ( get(this, 'actuallySave') ) {
      if (this.editing) {
        return this.doProjectActions();
      } else {
        return true;
      }
    } else {
      return false;
    }
  },

  doProjectActions() {
    const { primaryResource } = this;
    const { projectsToAddOnUpgrade, projectsToRemoveOnUpgrade } = this;
    const promises = [];

    const toAdd = (projectsToAddOnUpgrade || []).map((p) => get(p, 'projectId')).uniq();
    const toRemove = (projectsToRemoveOnUpgrade || []).map((p) => get(p, 'projectId')).uniq();

    const filteredToAdd = toAdd.filter((id) => !toRemove.includes(id));
    const filteredToRemove = toRemove.filter((id) => !toAdd.includes(id));

    if ( filteredToAdd.length > 0 ) {
      promises.push(primaryResource.doAction('addProjects', { projects: filteredToAdd }));
    }

    if ( filteredToRemove.length > 0 ) {
      promises.push(primaryResource.doAction('removeProjects', { projects: filteredToRemove }));
    }

    if (promises.length > 0) {
      return all(promises)
        .then(() => {
          return true;
        })
        .catch((/* handled by growl error */) => {
          return false;
        });
    } else {
      return true;
    }
  },

  doneSaving() {
    return this.router.transitionTo('global-admin.multi-cluster-apps');
  },

  buildAnswerMap() {
    const {
      globalStore, answers, answerOverrides
    }          = this;
    let answer = {
      type:      'answer',
      clusterId: null,
      projectId: null,
      values:    null
    };
    let out = [];

    let globalAnswers = answer;

    set(globalAnswers, 'values', answers);

    out.pushObject(globalStore.createRecord(globalAnswers));

    if (answerOverrides && answerOverrides.length > 0) {
      answerOverrides.forEach( (override) => {
        let outMatch         = out.findBy('clusterId', override.scope) || out.findBy('projectId', override.scope);
        let questionVariable = get(override, 'question.variable') ? override.question.variable : override.question;

        if (outMatch) {
          outMatch.values[questionVariable] = stringifyAnswer(override.answer);
        } else {
          let newOverrideAnswer = {
            type:      'answer',
            clusterId: null,
            projectId: null,
            values:    {}
          };
          let overrideScope = get(this, 'allProjectsAndClustersUngrouped').findBy('value', override.scope);

          if (get(overrideScope, 'isProject')) {
            set(newOverrideAnswer, 'projectId', override.scope);
          }

          if (get(overrideScope, 'isCluster')) {
            set(newOverrideAnswer, 'clusterId', override.scope);
          }

          newOverrideAnswer.values[questionVariable] = stringifyAnswer(override.answer);

          out.pushObject(globalStore.createRecord(newOverrideAnswer));
        }
      });
    }

    return out;
  },

  initAttrs() {
    setProperties(this, {
      selectedTemplateModel:     null,
      projectsToAddOnUpgrade:    [],
      projectsToRemoveOnUpgrade: [],
    });
  },

  initCatalogIcon() {
    if (!this.get('srcSet')) {
      set(this, 'srcSet', true);

      const $icon = $('img');

      $icon.attr('src', $icon.data('src'));

      $('img').on('error', () => {
        $icon.attr('src', `${ this.get('app.baseAssets') }assets/images/generic-catalog.svg`);
      });
    }
  },

  initSelectedTemplateModel() {
    let def = get(this, 'templateResource.defaultVersion');
    const latest = get(this, 'templateResource.latestVersion');
    const current = get(this, 'primaryResource.externalIdInfo.version');
    const links = get(this, 'versionLinks');

    set(this, 'selectedTemplateUrl', links[current] || links[def] || links[latest] || null);
  },

  initUpgradeStrategy() {
    const { multiClusterApp } = this;

    if (get(multiClusterApp, 'upgradeStrategy.rollingUpdate')) {
      set(this, 'upgradeStrategy', true);
    }
  },

});
