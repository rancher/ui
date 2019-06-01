import { next, once } from '@ember/runloop';
import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';

export default Component.extend({
  layout,
  // Inputs
  // You can either set model or name+description
  model:       null,
  name:        null,
  description: null,
  editing:     true,

  _name:        '',
  _description: '',

  nameLabel:       'formNameDescription.name.label',
  namePlaceholder: 'formNameDescription.name.placeholder',
  nameHelpText:    '',
  nameRequired:    false,
  nameDisabled:    false,

  descriptionLabel:        'formNameDescription.description.label',
  descriptionHelp:         '',
  descriptionPlaceholder:  'formNameDescription.description.placeholder',
  descriptionRequired:     false,
  descriptionDisabled:     false,
  descriptionShown:        true,
  descriptionExpanded:     false,
  expandDescriptionAction: 'formNameDescription.description.expand',

  rowClass:     'row',
  bothColClass: 'col span-6 mb-0 mt-0',
  colClass:     'col span-12 mb-0 mt-0',

  init() {
    this._super(...arguments);

    if ( get(this, 'model') ) {
      this.modelChanged();
    } else {
      this.setProperties({
        _name:        get(this, 'name'),
        _description: get(this, 'description'),
      });
    }

    if ( (get(this, '_description') || '').length ) {
      set(this, 'descriptionExpanded', true);
    }
  },

  didInsertElement() {
    next(() => {
      if ( this.isDestroyed || this.isDestroying || get(this, 'nameDisabled')) {
        return;
      }

      const elem = this.$('INPUT')[0]

      if ( elem ) {
        elem.focus();
      }
    });
  },
  actions: {
    expandDescription() {
      set(this, 'descriptionExpanded', true);
      next(() => {
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
      _name:        get(this, 'model.name'),
      _description: get(this, 'model.description'),
    });

    if ( (get(this, 'model.description') || '').length ) {
      set(this, 'descriptionExpanded', true);
    }
  }.observes('model'),

  nameChanged: function() {
    once(() => {
      let val = get(this, '_name');

      if ( get(this, 'model') ) {
        set(this, 'model.name', val);
      } else {
        set(this, 'name', val);
      }
    });
  }.observes('_name'),

  descriptionChanged: function() {
    once(() => {
      let val = get(this, '_description');

      if ( get(this, 'model') ) {
        set(this, 'model.description', val);
      } else {
        set(this, 'description', val);
      }
    });
  }.observes('_description'),

});
