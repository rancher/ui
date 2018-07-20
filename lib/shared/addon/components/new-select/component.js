import { defineProperty, computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  tagName:            'select',
  // possible passed-in values with their defaults:
  content:            null,
  prompt:             null,
  optionValuePath:    'value',
  optionLabelPath:    'label',
  optionGroupPath:    'group',
  optionDisabledPath: 'disabled',
  // Used to be Ember.K but that has been depreciated - action to fire on change
  value:              null,
  localizedPrompt:    false,
  localizedLabel:     false,
  localizedHtmlLabel: false,
  disabled:           false,
  attributeBindings:  ['disabled'],

  ungroupedContent: null,
  groupedContent:   null,

  // leaking changes to it via a 2-way binding
  _selection: reads('selection'),

  // shadow the passed-in `selection` to avoid
  init() {
    this._super(...arguments);
    if (!this.get('content')) {
      this.set('content', []);
    }

    defineProperty(this, 'ungroupedContent', computed(`content.@each.${ this.get('optionGroupPath') }`, () => {
      var groupPath = this.get('optionGroupPath');
      var out = [];

      this.get('content').forEach((opt) => {
        var key = get(opt, groupPath);

        if ( !key ) {
          out.push(opt);
        }
      });

      return out;
    }));

    defineProperty(this, 'groupedContent', computed(`content.@each.${ this.get('optionGroupPath') }`, () => {
      var groupPath = this.get('optionGroupPath');
      var out = [];

      this.get('content').forEach((opt) => {
        var key = get(opt, groupPath);

        if ( key ) {
          var group = out.filterBy('group', key)[0];

          if ( !group ) {
            group = {
              group:   key,
              options: []
            };
            out.push(group);
          }

          group.options.push(opt);
        }
      });

      return out.sortBy(groupPath);
    }));

    this.on('change', this, this._change);
  },

  willDestroyElement() {
    this.off('change', this, this._change);
  },

  action() {
    return this;
  },
  _change() {
    const selectEl = this.$()[0];
    const selectedIndex = selectEl.selectedIndex;

    if ( selectedIndex === -1 ) {
      return;
    }

    const selectedValue = selectEl.options[selectedIndex].value;
    const content = this.get('content');

    const selection = content.filterBy(this.get('optionValuePath'), selectedValue)[0];

    // set the local, shadowed selection to avoid leaking
    // changes to `selection` out via 2-way binding
    this.set('_selection', selection);

    const changeCallback = this.get('action');

    if ( changeCallback ) {
      changeCallback(selection);
    }

    if ( selection ) {
      this.set('value', get(selection, this.get('optionValuePath')));
    } else {
      this.set('value', null);
    }
  }
});
