import Ember from 'ember';

export default Ember.Component.extend({
  // Inputs
  // You can either set model or name+description
  model                  : null,
  name                   : null,
  description            : null,

  _name                  : '',
  _description           : '',

  nameLabel              : 'formNameDescription.name.label',
  namePlaceholder        : 'formNameDescription.name.placeholder',
  nameHelpText           : '',
  nameRequired           : false,
  nameDisabled           : false,

  descriptionLabel       : 'formNameDescription.description.label',
  descriptionHelp        : '',
  descriptionPlaceholder : 'formNameDescription.description.placeholder',
  descriptionRequired    : false,
  descriptionDisabled    : false,
  descriptionShown       : true,
  descriptionExpanded    : false,
  expandDescriptionAction: 'formNameDescription.description.expand',

  rowClass: 'row',
  bothColClass: 'col span-6',
  colClass: 'col span-12',

  init() {
    this._super(...arguments);

    if ( this.get('model') ) {
      this.modelChanged();
    } else {
      this.setProperties({
        _name: this.get('name'),
        _description: this.get('description'),
      });
    }

    if ( (this.get('_description')||'').length ) {
      this.set('descriptionExpanded', true);
    }
  },

  actions: {
    expandDescription() {
      this.set('descriptionExpanded', true);
      Ember.run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        var el = this.$('.description')[0];
        if ( el ) {
          el.focus();
        }
      });
    },
  },

  modelChanged: function() {
    this.setProperties({
      _name: this.get('model.name'),
      _description: this.get('model.description'),
    });

    if ( (this.get('model.description')||'').length ) {
      this.set('descriptionExpanded', true);
    }
  }.observes('model'),

  nameChanged: function() {
   Ember.run.once(() => {
    let val = this.get('_name');
    if ( this.get('model') ) {
      this.set('model.name', val);
    } else {
      this.set('name', val);
    }
   });
  }.observes('_name'),

  descriptionChanged: function() {
   Ember.run.once(() => {
    let val = this.get('_description');
    if ( this.get('model') ) {
      this.set('model.description', val);
    } else {
      this.set('description', val);
    }
   });
  }.observes('_description'),

  didInsertElement() {
    Ember.run.next(() => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      this.$('INPUT')[0].focus();
    });
  },
});
