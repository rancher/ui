import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  templateResource: null,
  environmentResource: null,
  versionsArray: null,
  versionsLinks: null,
  serviceChoices: null,

  primaryResource: Ember.computed.alias('environmentResource'),
  editing: Ember.computed.notEmpty('primaryResource.id'),

  previewOpen: false,
  questionsArray: null,
  selectedTemplateUrl: null,
  selectedTemplateModel: null,

  actions: {
    cancel: function() {
      this.sendAction('cancel');
    },

    togglePreview: function() {
      if ( this.get('previewOpen') )
      {
        this.highlightAll();
      }

      this.toggleProperty('previewOpen');
    }
  },

  didInitAttrs() {
    this._super.apply(this,arguments);

    // Select the default version
    var def = this.get('templateResource.version');
    var links = this.get('versionLinks');
    if ( links[def] )
    {
      this.set('selectedTemplateUrl', links[def]);
    }
    else
    {
      this.set('selectedTemplateUrl', null);
    }

    this.templateChanged();
  },

  highlightAll: function() {
    this.$('CODE').each(function(idx, elem) {
      Prism.highlightElement(elem);
    });
  },

  templateChanged: function() {
    var link = this.get('selectedTemplateUrl');
    if ( link )
    {
      this.set('loading', true);

      var current = this.get('environmentResource.environment');
      Ember.$.ajax(link, 'GET').then((response) => {
        if ( response.questions )
        {
          response.questions.forEach((item) => {
            if ( typeof current[item.variable] !== 'undefined' )
            {
              item.answer = current[item.variable];
            }
            else
            {
              if (item.type === 'service') {
                var defaultStack = false;
                this.get('model.serviceChoices').forEach((service) => {
                  service.stack = `${service.envName}/${service.name}`;
                  if (item.default === service.stack) {
                    defaultStack = true;
                  }
                });

                if (defaultStack) {
                  item.answer = item.default;
                } else {
                  item.answer = null;
                }
              } else {
                item.answer = item.default;
              }
            }
          });
        }

        this.set('selectedTemplateModel', response);
        this.set('loading', false);

        Ember.run.next(() => {
          this.highlightAll();
        });
      }, ( /*error*/ ) => {});
    }
    else
    {
      this.set('selectedTemplateModel', null);
    }
  }.observes('selectedTemplateUrl'),

  validate() {
    var errors = [];

    if ( !this.get('editing') && !this.get('environmentResource.name') )
    {
      errors.push('Name is required');
    }

    if ( this.get('selectedTemplateModel.questions') )
    {
      this.get('selectedTemplateModel.questions').forEach((item) => {
        if ( item.required && item.type !== 'boolean' && !item.answer )
        {
          errors.push(`${item.label} is required`);
        }
      });
    }

    if ( errors.length )
    {
      this.set('errors', errors.uniq());
      this.$().parent().scrollTop(0);
      return false;
    }

    return true;
  },

  willSave() {
    this.set('errors', null);
    var ok = this.validate();
    if ( !ok )
    {
      // Validation failed
      return false;
    }

    var answers = {};
    (this.get('selectedTemplateModel.questions')||[]).forEach((item) => {
      answers[item.variable] = item.answer;
    });

    this.get('environmentResource').setProperties({
      dockerCompose: this.get('selectedTemplateModel.dockerCompose'),
      rancherCompose: this.get('selectedTemplateModel.rancherCompose'),
      environment: answers,
      externalId: this.get('selectedTemplateModel.uuid')
    });

    return true;
  },

  doSave() {
    if ( this.get('editing') )
    {
      return this.get('environmentResource').doAction('upgrade', {
        dockerCompose: this.get('environmentResource.dockerCompose'),
        rancherCompose: this.get('environmentResource.rancherCompose'),
        environment: this.get('environmentResource.environment'),
        externalId: this.get('selectedTemplateModel.uuid')
      });
    }
    else
    {
      return this._super.apply(this, arguments);
    }
  },

  doneSaving() {
    this.sendAction('dismiss');
    return this.get('router').transitionTo('environment', this.get('primaryResource.id'));
  }

});
