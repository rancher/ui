import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ShellQuote from 'npm:shell-quote';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';
import { compare as compareVersion } from 'ui/utils/parse-version';

export default Ember.Component.extend(NewOrEdit, {
  intl: Ember.inject.service(),
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),

  allTemplates: null,
  templateResource: null,
  stackResource: null,
  versionsArray: null,
  versionsLinks: null,
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

  didReceiveAttrs: function() {
    this._super(...arguments);
    this.set('selectedTemplateModel', null);

    Ember.run.scheduleOnce('afterRender', () => {
      if ( this.get('selectedTemplateUrl') ) {
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
  },

  updateReadme: function() {
    let model = this.get('selectedTemplateModel');
    this.set('readmeContent', null);
    if ( model && model.hasLink('readme') ) {
      model.followLink('readme').then((response) => {
        this.set('readmeContent', response);
      });
    }
  },

  sortedVersions: function() {
    let out = this.get('versionsArray').sort((a,b) => {
      return compareVersion(a.version, b.version);
    });

    let def = this.get('templateResource.defaultVersion');
    if ( this.get('showDefaultVersionOption') && this.get('defaultUrl') ) {
      out.unshift({version:  this.get('intl').t('newCatalog.version.default', {version: def}), link: 'default'});
    }

    return out;
  }.property('versionsArray','templateResource.defaultVersion'),

  defaultUrl: function() {
    var defaultVersion = this.get('templateResource.defaultVersion');
    var versionLinks = this.get('versionLinks');

    if ( defaultVersion && versionLinks && versionLinks[defaultVersion] ) {
      return versionLinks[defaultVersion];
    }

    return null;
  }.property('templateResource.defaultVersion','versionLinks'),

  templateChanged: function() {
    var url = this.get('selectedTemplateUrl');

    if ( url === 'default' ) {
      let defaultUrl = this.get('defaultUrl');
      if ( defaultUrl ) {
        url = defaultUrl;
      } else {
        url = null;
      }
    }

    if (url) {
      this.set('loading', true);

      var version = this.get('settings.rancherVersion');
      if ( version ) {
        url = Util.addQueryParam(url, 'rancherVersion', version);
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
        this.updateReadme();
        this.set('loading', false);
      }, ( /*error*/ ) => {});
    } else {
      this.set('selectedTemplateModel', null);
      this.updateReadme();
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
        dockerCompose: files['docker-compose.yml.tpl'] || files['docker-compose.yml'],
        rancherCompose: files['rancher-compose.yml.tpl'] || files['rancher-compose.yml'],
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
    if (this.get('editing')) {
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
    var projectId = this.get('projects.current.id');
    if ( this.get('stackResource.system') )
    {
      return this.get('router').transitionTo('stack', projectId, this.get('primaryResource.id'), {queryParams: {which: 'infra'}});
    }
    else
    {
      return this.get('router').transitionTo('stack', projectId, this.get('primaryResource.id'));
    }
  }
});
