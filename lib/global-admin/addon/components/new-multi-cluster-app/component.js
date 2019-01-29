import Errors from 'ui/utils/errors';
import {
  get, set, computed, setProperties, observer
} from '@ember/object';
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
import { stringifyAnswer } from 'shared/utils/evaluate';
import { isEmpty } from '@ember/utils';
import CatalogApp from 'shared/mixins/catalog-app';

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

const MEMBERS_HEADERS = [
  {
    translationKey: 'newMultiClusterApp.members.table.name',
    name:           'name',
    sort:           ['userPrincipalId', 'groupPrincipalId'],
  },
  {
    translationKey: 'newMultiClusterApp.members.table.type',
    name:           'type',
    sort:           ['displayType'],
    width:          175
  },
  {
    translationKey: 'newMultiClusterApp.members.table.accessType',
    name:           'accessType',
    sort:           ['accessType'],
  },
]

export default Component.extend(NewOrEdit, CatalogApp, {
  catalog:                  service(),
  intl:                     service(),
  scope:                    service(),
  router:                   service(),
  settings:                 service(),
  globalStore:              service(),

  layout,
  allTemplates:             null,
  templateResource:         null,
  versionsArray:            null,
  versionsLinks:            null,
  actuallySave:             true,
  showHeader:               true,
  showPreview:              true,
  decoding:                 false,
  upgradeStrategy:          false,
  titleAdd:                 'newCatalog.titleAdd',
  titleUpgrade:             'newCatalog.titleUpgrade',
  selectVersionAdd:         'newCatalog.selectVersionAdd',
  selectVersionUpgrade:     'newCatalog.selectVersionUpgrade',
  saveUpgrade:              'newCatalog.saveUpgrade',
  saveNew:                  'newCatalog.saveNew',
  sectionClass:             'box mb-20',
  showDefaultVersionOption: false,

  classNames:               ['launch-catalog', 'launch-multicluster-app'],
  multiClusterApp:          null,
  srcSet:                   false,

  detailExpanded:           false,
  previewOpen:              false,
  previewTab:               null,
  questionsArray:           null,
  selectedTemplateUrl:      null,
  selectedTemplateModel:    null,
  readmeContent:            null,
  appReadmeContent:         null,
  pastedAnswers:            null,
  noAppReadme:              null,
  selectedFileContetnt:     null,
  answerOverrides:          null,
  projects:                 null,
  clusters:                 null,
  optionsForAccessType:     null,
  isClone:                  false,

  overridesHeaders:         OVERRIDE_HEADERS,
  membersHeaders:           MEMBERS_HEADERS,

  isGKE:                    alias('scope.currentCluster.isGKE'),

  primaryResource:          alias('multiClusterApp'),
  editing:                  notEmpty('primaryResource.id'),

  init() {
    this._super(...arguments);
    set(this, 'selectedTemplateModel', null);

    this.initOptionsForMembersAccessType();
    this.initUpgradeStrategy();

    scheduleOnce('afterRender', () => {
      if ( get(this, 'selectedTemplateUrl') ) {
        this.templateChanged();
      } else {
        this.initSelectedTemplateModel();
      }

      if (!this.isClone && !this.editing) {
        this.send('addTarget');
      }
    });
  },

  didRender() {
    this.initCatalogIcon();
  },

  actions: {

    addAuthorizedPrincipal(principal) {
      if (principal) {
        let { members } = this.multiClusterApp;
        const { principalType, id } = principal;

        const nue = {
          type:        'member',
          accessType:  null,
          displayType: get(principal, 'displayType') || principalType,
          displayName: get(principal, 'displayName') || get(principal, 'loginName') || get(principalType, 'id'),
        };

        if (!members) {
          members = [];
        }

        if (principalType === 'group') {
          set(nue, 'groupPrincipalId', id);
        } else if (principalType === 'user') {
          set(nue, 'userPrincipalId', id);
        }


        members.pushObject(nue);
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

    addTarget() {
      const target = this.globalStore.createRecord({ type: 'target' });
      const app    = get(this, 'primaryResource');

      if (app.targets) {
        app.targets.pushObject(target);
      } else {
        set(app, 'targets', [target]);
      }
    },

    removeTarget(target) {
      get(this, 'primaryResource.targets').removeObject(target);
    },

    toogleDetailedDescriptions() {
      set(this, 'detailExpanded', true);
    },

    cancel() {
      this.sendAction('cancel');
    },

    togglePreview() {
      this.toggleProperty('previewOpen');
    },

    selectPreviewTab(tab) {
      set(this, 'previewTab', tab);
    },
  },

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

  answers: computed('selectedTemplateModel.questions.@each.{variable,answer}', function() {
    const out = {};

    (get(this, 'selectedTemplateModel.questions') || []).forEach((item) => {
      out[item.variable] = stringifyAnswer(item.answer);
      (get(item, 'subquestions') || []).forEach((sub) => {
        out[sub.variable] = stringifyAnswer(sub.answer);
      });
    });

    const customAnswers = get(this, 'selectedTemplateModel.customAnswers.firstObject.values') || {};

    Object.keys(customAnswers).forEach((key) => {
      out[key] = stringifyAnswer(customAnswers[key]);
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
      return get(this, 'primaryResource.answers');
    }
  }),

  answersString: computed('answersArray.@each.{variable,answer}', function() {
    const model = get(this, 'selectedTemplateModel');

    if (get(model, 'questions')) {
      let neu = {};

      (get(this, 'answersArray') || []).forEach((a) => {
        neu[a.variable] = isEmpty(a.answer) ? a.default : a.answer;
      });

      const customAnswers = get(model, 'customAnswers') || {};

      Object.keys(customAnswers).forEach((key) => {
        neu[key] = customAnswers[key];
      });

      return YAML.stringify(neu);
    } else {
      return JSON.stringify(get(this, 'answersArray'));
    }
  }),

  allProjectsGroupedByCluster: computed('projects.[]', 'primaryResource.targets.@each.projectId', function() {
    return get(this, 'projects').map( (p) => {
      const clusterDisplayNameOrNa =  get(p, 'cluster.displayName') || this.intl.t('generic.na');

      const out = {
        name:    get(p, 'name'),
        value:   get(p, 'id'),
        cluster: `Cluster: ${ clusterDisplayNameOrNa }`
      };

      if (get(this, 'primaryResource.targets').findBy('projectId', p.id)) {
        set(out, 'disabled', true);
      } else {
        if (!out.disabled) {
          set(out, 'disabled', false);
        }
      }

      return out;
    });
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
    let url = get(this, 'selectedTemplateUrl');

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
    this._super();

    const errors = get(this, 'errors') || [];

    errors.pushObjects(get(this, 'selectedTemplateModel').validationErrors() || []);

    if (errors.length) {
      set(this, 'errors', errors.uniq());

      return false;
    }

    return true;
  },

  willSave() {
    set(this, 'errors', null);
    const ok = this.validate();
    const { primaryResource/* , answers */ } = this;

    if (!ok) {
      // Validation failed
      return false;
    }

    if ( get(this, 'actuallySave') && get(this, 'selectedTemplateModel.questions')) {
      primaryResource.set('answers', this.buildAnswerMap())

      return true;
    } else {
      return false;
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

  initCatalogIcon() {
    if (!this.get('srcSet')) {
      set(this, 'srcSet', true);

      const $icon = this.$('img');

      $icon.attr('src', $icon.data('src'));

      this.$('img').on('error', () => {
        $icon.attr('src', `${ this.get('app.baseAssets') }assets/images/generic-catalog.svg`);
      });
    }
  },

  initSelectedTemplateModel() {
    let def     = get(this, 'templateResource.defaultVersion');
    const links = get(this, 'versionLinks');
    const app   = get(this, 'primaryResource');

    if (get(app, 'id') && !get(this, 'upgrade')) {
      def = get(app, 'externalIdInfo.version');
    }

    if (links[def]) {
      set(this, 'selectedTemplateUrl', links[def]);
    } else {
      set(this, 'selectedTemplateUrl', null);
    }

    return;
  },

  initUpgradeStrategy() {
    const { multiClusterApp } = this;

    if (get(multiClusterApp, 'upgradeStrategy.rollingUpdate')) {
      set(this, 'upgradeStrategy', true);
    }
  },

  initOptionsForMembersAccessType() {
    set(this, 'optionsForAccessType', this.globalStore.getById('schema', 'member').optionsFor('accessType') || []);

    return;
  },

});
