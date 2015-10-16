import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  primaryResource: Ember.computed.alias('environmentResource'),
  editing: false,

  actions: {
    cancel: function() {
      this.sendAction('dismiss');
    },
    togglePreview: function() {
      if (this.get('previewOpen')) {
        this.highlightAll();
      }
      this.toggleProperty('previewOpen');
    }
  },

  highlightAll: function() {
    this.$('CODE').each(function(idx, elem) {
      Prism.highlightElement(elem);
    });
  },

  environmentResource: null,
  versionsArray: null,
  selectedTemplate: null,
  selectedTemplateModel: null,
  success: false,
  loading: false,
  templateName: null,
  templateDescription: null,
  previewOpen: false,

  versions: Ember.on('init', function() {
    var links = this.get('originalModel.versionLinks');
    var verArr = Object.keys(links).map((key) => {
      return {version: key, link: links[key]};
    });
    this.set('versionsArray', verArr);

    // Select the default version
    var def = this.get('originalModel.version');
    if ( links[def] )
    {
      this.set('selectedTemplate', links[def]);
    }
  }),

  templateChanged: function() {
    var link = this.get('selectedTemplate');
    if ( link )
    {
      this.set('loading', true);
      Ember.$.ajax(link, 'GET').then((response) => {
        if (response.questions) {
          response.questions.forEach((item) => {
            item.answer = item.default;
          });
        }
        this.set('selectedTemplateModel', response);
        this.set('loading', false);
        Ember.run.later(() => {
          this.highlightAll();
        });
      }, ( /*error*/ ) => {});
    }
    else
    {
      this.set('selectedTemplateModel', null);
    }
  }.observes('selectedTemplate'),

  willSave: function() {
    this.set('errors', null);
    var ok = this.validate();
    if (!ok) {
      // Validation failed
      return false;
    }

    if (this.get('saving')) {
      // Already saving
      return false;
    }

    var environments = {};
    this.get('selectedTemplateModel.questions').forEach((item) => {
      environments[item.variable] = item.answer;
    });
    this.set('saving', true);
    this.set('environmentResource', this.get('store').createRecord({
      type: 'environment',
      name: this.get('templateName'),
      description: this.get('templateDescription'),
      dockerCompose: this.get('selectedTemplateModel.dockerCompose'),
      rancherCompose: this.get('selectedTemplateModel.rancherCompose'),
      environment: environments,
      uuid: this.get('selectedTemplateModel.uuid')
    }));

    return true;
  },

  validate: function() {
    var errors = [];
    if (!this.get('templateName')) {
      errors.push('Name is required');
    }

    if (this.get('selectedTemplateModel.questions')) {
      this.get('selectedTemplateModel.questions').forEach((item) => {
        if (item.required && !item.answer){
          errors.push(`${item.label} is required`);
        }
      });
    }

    if (errors.length) {
      this.set('errors', errors.uniq());
      this.$().parent().scrollTop(0);
      return false;
    }

    return true;
  },

  doneSaving: function() {
    this.sendAction('dismiss');
    return this.get('router').transitionTo('environment', this.get('primaryResource.id'));
  }

});
