import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ShellQuote from 'npm:shell-quote';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { compare as compareVersion } from 'ui/utils/parse-version';

export default Ember.Component.extend(NewOrEdit, {
  k8s: Ember.inject.service(),
  intl: Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),

  allTemplates: null,
  templateResource: null,
  stackResource: null,
  versionsArray: null,
  versionsLinks: null,
  serviceChoices: null,
  actuallySave: true,
  showHeader: true,
  showPreview: true,
  showName: true,
  titleAdd: 'newCatalog.titleAdd',
  titleUpgrade: 'newCatalog.titleUpgrade',
  selectVersionAdd: 'newCatalog.selectVersionAdd',
  selectVersionUpgrade: 'newCatalog.selectVersionUpgrade',
  saveUpgrade: 'newCatalog.saveUpgrade',
  saveNew: 'newCatalog.saveNew',
  sectionClass: 'well',
  showDefaultVersionOption: false,

  classNames: ['launch-catalog'],

  primaryResource: Ember.computed.alias('stackResource'),
  templateBase: Ember.computed.alias('templateResource.templateBase'),
  editing: Ember.computed.notEmpty('stackResource.id'),

  previewOpen: false,
  previewTab: null,
  questionsArray: null,
  selectedTemplateUrl: null,
  selectedTemplateModel: null,
  readmeContent: null,

  actions: {
    cancel: function() {
      this.sendAction('cancel');
    },

    togglePreview: function() {
      this.toggleProperty('previewOpen');
    },

    selectPreviewTab: function(tab) {
      this.set('previewTab', tab);
    },

    changeTemplate: function(tpl) {
      this.get('application').transitionToRoute('catalog-tab.launch', tpl.id);
    },
  },

  onInit: function() {
    this._super();
    this.set('selectedTemplateModel', null);

    Ember.run.scheduleOnce('afterRender', () => {
      if ( this.get('selectedTemplateUrl') === 'default') {
        this.templateChanged();
      } else {
        var def = this.get('templateResource.defaultVersion');
        var links = this.get('versionLinks');
        if (links[def]) {
          this.set('selectedTemplateUrl', links[def]);
        } else {
          this.set('selectedTemplateUrl', null);
        }
      }
    });
  }.on('init'),

  updateReadme: function() {
    let model = this.get('selectedTemplateModel');
    this.set('readmeContent', null);
    if ( model && model.hasLink('readme') ) {
      model.followLink('readme').then((response) => {
        this.set('readmeContent', response);
      });
    }
  }.observes('selectedTemplateModel.links.readme'),

  sortedVersions: function() {
    let out = this.get('versionsArray').sort((a,b) => {
      return compareVersion(a.version, b.version);
    });

    let def = this.get('templateResource.defaultVersion');
    if ( this.get('showDefaultVersionOption') && def ) {
      out.unshift({version:  this.get('intl').t('newCatalog.version.default', {version: def}), link: 'default'});
    }

    return out;
  }.property('versionsArray','templateResource.defaultVersion'),

  templateChanged: function() {
    var url = this.get('selectedTemplateUrl');
    if (url) {
      this.set('loading', true);

      if ( url === 'default' ) {
        var def = this.get('templateResource.defaultVersion');
        var links = this.get('versionLinks');
        if ( def && links ) {
          url = links[def];
        }
      }

      var version = this.get('settings.rancherVersion');
      if ( version ) {
        url = Util.addQueryParam(url, 'minimumRancherVersion_lte', version);
      }


      var current = this.get('stackResource.environment');
      if ( !current ) {
        current = {};
        this.set('stackResource.environment', current);
      }

      this.get('store').request({
        url: url
      }).then((response) => {
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

        this.set('selectedTemplateModel', response);
        this.set('previewTab', Object.keys(response.get('files')||[])[0]);
        this.set('loading', false);
      }, ( /*error*/ ) => {});
    } else {
      this.set('selectedTemplateModel', null);
      this.set('readmeContent', null);
    }
  }.observes('selectedTemplateUrl','templateResource.defaultVersion'),

  answers: function() {
    var out = {};
    (this.get('selectedTemplateModel.questions') || []).forEach((item) => {
      out[item.variable] = item.answer;
    });

    return out;
  }.property('selectedTemplateModel.questions.@each.{variable,answer}'),

  answersArray: Ember.computed.alias('selectedTemplateModel.questions'),

  answersString: function() {
    return (this.get('answersArray')||[]).map((obj) => {
      if (obj.answer === null || obj.answer === undefined) {
        return obj.variable + '=';
      } else {
        return obj.variable + '=' + ShellQuote.quote([obj.answer]);
      }
    }).join("\n");
  }.property('answersArray.@each.{variable,answer}'),

  validate() {
    var errors = [];

    if (!this.get('editing') && !this.get('stackResource.name')) {
      errors.push('Name is required');
    }

    if (this.get('selectedTemplateModel.questions')) {
      this.get('selectedTemplateModel.questions').forEach((item) => {
        if (item.required && item.type !== 'boolean' && !item.answer) {
          errors.push(`${item.label} is required`);
        }
      });
    }

    if (errors.length) {
      this.set('errors', errors.uniq());
      return false;
    }

    return true;
  },

  newExternalId: function() {
    return C.EXTERNAL_ID.KIND_CATALOG + C.EXTERNAL_ID.KIND_SEPARATOR + this.get('selectedTemplateModel.id');
  }.property('selectedTemplateModel.id'),

  willSave() {
    this.set('errors', null);
    var ok = this.validate();
    if (!ok) {
      // Validation failed
      return false;
    }

    let files = this.get('selectedTemplateModel.files');
    let stack = this.get('stackResource');

    if ( this.get('actuallySave') ) {
      stack.setProperties({
        dockerCompose: files['docker-compose.yml'],
        rancherCompose: files['rancher-compose.yml'],
        environment: this.get('answers'),
        externalId: this.get('newExternalId'),
      });

      return true;
    } else {
      let versionId = null;
      if ( this.get('selectedTemplateUrl') !== 'default' && this.get('selectedTemplateModel') ) {
        versionId = this.get('selectedTemplateModel.id');
      }

      this.sendAction('doSave', {
        templateId: this.get('templateResource.id'),
        templateVersionId: versionId,
        answers: this.get('answers'),
      });
      return false;
    }
  },

  doSave() {
    var stack = this.get('stackResource');
    if ( this.get('templateBase') === 'kubernetes' ) {
      if ( this.get('k8s.supportsStacks') ) {
        if ( this.get('editing') ) {
          return stack.doAction('upgrade', {
            templates: this.get('selectedTemplateModel.files'),
            environment: stack.get('environment'),
            externalId: this.get('newExternalId'),
            namespace: this.get('k8s.namespace.metadata.name'),
          });
        } else {
          return this.get('store').createRecord({
            type: 'kubernetesStack',
            name: stack.get('name'),
            description: stack.get('description'),
            templates: this.get('selectedTemplateModel.files'),
            environment: stack.get('environment'),
            externalId: this.get('newExternalId'),
            namespace: this.get('k8s.namespace.metadata.name'),
          }).save().then((newData) => {
            return this.mergeResult(newData);
          });
        }
      } else {
        return this.get('k8s').catalog({
          files: this.get('selectedTemplateModel.files'),
          environment: stack.get('environment')
        });
      }
    } else if ( this.get('templateBase') === 'swarm' ) {
      return this.get('store').createRecord({
        type: 'composeProject',
        name: stack.get('name'),
        description: stack.get('description'),
        templates: this.get('selectedTemplateModel.files'),
        externalId: this.get('newExternalId'),
        environment: stack.get('environment')
      }).save().then((newData) => {
        return this.mergeResult(newData);
      });
    } else if (this.get('editing')) {
      return stack.doAction('upgrade', {
        dockerCompose: stack.get('dockerCompose'),
        rancherCompose: stack.get('rancherCompose'),
        environment: stack.get('environment'),
        externalId: this.get('newExternalId'),
      });
    } else {
      return this._super.apply(this, arguments);
    }
  },

  doneSaving() {
    var base = this.get('templateBase');
    var projectId = this.get('projects.current.id');
    if ( base === 'kubernetes' )
    {
      var nsId = this.get('k8s.namespace.id');
      if ( this.get('k8s.supportsStacks') ) {
        return this.get('router').transitionTo('k8s-tab.namespace.stacks', projectId, nsId);
      } else {
        return this.get('router').transitionTo('k8s-tab.namespace.services', projectId, nsId);
      }
    }
    else if ( base === 'swarm' )
    {
      return this.get('router').transitionTo('swarm-tab.projects', projectId);
    }
    else
    {
      if ( this.get('stackResource.system') )
      {
        return this.get('router').transitionTo('stack', projectId, this.get('primaryResource.id'), {queryParams: {which: 'infra'}});
      }
      else
      {
        return this.get('router').transitionTo('stack', projectId, this.get('primaryResource.id'));
      }
    }
  }

});
