import { computed, get, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';
import StatefulPromise from 'shared/utils/stateful-promise';
import $ from 'jquery';

export default Component.extend({
  layout,
  // possible passed-in values with their defaults:
  content:            null,
  prompt:             null,
  optionValuePath:    'value',
  optionLabelPath:    'label',
  optionGroupPath:    'group',
  optionDisabledPath: 'disabled',

  value:                     null,
  useContentForDefaultValue: false,
  localizedPrompt:           false,
  localizedLabel:            false,
  localizedHtmlLabel:        false,
  disabled:                  false,
  attributeBindings:         [
    'disabled',
    'asyncContent.loading:disabled'
  ],
  classNameBindings: [
    'asyncContent.loading:loading',
    'asyncContent.loaded:loaded',
    'asyncContent.error:error',
  ],
  classNames:         ['new-select'],

  // leaking changes to it via a 2-way binding
  _selection: reads('selection'),

  // shadow the passed-in `selection` to avoid
  init() {
    this._super(...arguments);
    if (!this.get('content')) {
      this.set('content', []);
    }

    this.on('change', this, this._change);
  },

  willDestroyElement() {
    this.off('change', this, this._change);
  },

  setDefaultValueObserver: observer('asyncContent.value', function() {
    const content = get(this, 'asyncContent.value');

    if (get(this, 'useContentForDefaultValue') && content && content.length > 0 && !get(this, 'value')) {
      this.setValue(content.firstObject);
    }
  }),

  asyncContent: computed('content', function() {
    return StatefulPromise.wrap(get(this, 'content'), []);
  }),

  ungroupedContent: computed('asyncContent.value', 'optionGroupPath', function() {
    var groupPath = this.get('optionGroupPath');
    var out = [];

    this.get('asyncContent.value').forEach((opt) => {
      var key = get(opt, groupPath);

      if ( !key ) {
        out.push(opt);
      }
    });

    return out;
  }),

  groupedContent: computed('asyncContent.value', 'optionGroupPath', function() {
    var groupPath = this.get('optionGroupPath');
    var out = [];

    this.get('asyncContent.value').forEach((opt) => {
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
  }),

  action() {
    return this;
  },

  setValue(selection) {
    const value = get(this, 'value');

    if ( selection ) {
      if (typeof value === 'function') {
        value(get(selection, this.get('optionValuePath')));
      } else {
        this.set('value', get(selection, this.get('optionValuePath')));
      }
    } else {
      this.set('value', null);
    }
  },

  _change() {
    const selectEl = $(this.element).find('select')[0];
    const selectedIndex = selectEl.selectedIndex;

    if ( selectedIndex === -1 ) {
      return;
    }

    const selectedValue = selectEl.options[selectedIndex].value;
    const content = this.get('asyncContent');

    const selection = content.value.filterBy(this.get('optionValuePath'), selectedValue)[0];


    // set the local, shadowed selection to avoid leaking
    // changes to `selection` out via 2-way binding
    this.set('_selection', selection);

    const changeCallback = this.get('action');

    if ( changeCallback ) {
      changeCallback(selection);
    }

    this.setValue(selection);
  }
});
