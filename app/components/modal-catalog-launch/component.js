import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  primaryResource: Ember.computed.alias('environmentResource'),
  actions: {
    cancel: function() {
      this.sendAction('dismiss');
    }
  },
  environmentResource: null,
  versionsArray: null,
  selectedTemplate: null,
  selectedTemplateModel: null,
  success: false,
  loading: false,
  templateName: null,
  templateDescription: null,
  versions: Ember.on('init', function() {
    var verArr = [];
    _.forEach(this.get('originalModel.versionLinks'), (value, key) => {
      verArr.push({
        version: key,
        link: value
      });
    });
    this.set('versionsArray', verArr);
  }),
  templateChanged: function() {
    this.set('loading', true);
    Ember.$.ajax(this.get('selectedTemplate'), 'GET').then((response) => {
      this.set('selectedTemplateModel', response);
      this.set('loading', false);
    }, ( /*error*/ ) => {});
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

    this.set('saving', true);
    this.set('environmentResource', this.get('store').createRecord({
      type: 'environment',
      name: this.get('templateName'),
      description: this.get('templateDescription'),
      dockerCompose: this.get('selectedTemplateModel').dockerCompose,
      rancherCompose: this.get('selectedTemplateModel').rancherCompose
    }));

    return true;
  },
  validate: function() {
    var errors = [];

    if (!this.get('selectedTemplateModel').name) {
      errors.push('Name is required');
    }
    if (!this.get('selectedTemplateModel').description) {
      errors.push('Description is required');
    }

    if (errors.length) {
      this.set('errors', errors.uniq());
      return false;
    }

    return true;
  },
  doneSaving: function() {
    this.sendAction('dismiss');
    return this.get('router').transitionTo('environment', this.get('primaryResource.id'));
  }

});
