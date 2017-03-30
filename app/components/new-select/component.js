import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'select',
  // possible passed-in values with their defaults:
  content: null,
  prompt: null,
  optionValuePath: 'value',
  optionLabelPath: 'label',
  optionGroupPath: 'group',
  optionDisabledPath: 'disabled',
  action: function() {return this;}, // Used to be Ember.K but that has been depreciated - action to fire on change
  value: null,
  localizedPrompt: false,
  localizedLabel: false,
  disabled: false,
  attributeBindings: ['disabled'],

  ungroupedContent: null,
  groupedContent: null,

  // shadow the passed-in `selection` to avoid
  // leaking changes to it via a 2-way binding
  _selection: Ember.computed.reads('selection'),

  init() {
    this._super(...arguments);
    if (!this.get('content')) {
      this.set('content', []);
    }

    this.set('ungroupedContent', Ember.computed('content.@each.'+this.get('optionGroupPath'), () => {
      var groupPath = this.get('optionGroupPath');
      var out = [];
      this.get('content').forEach((opt) => {
        var key = Ember.get(opt, groupPath);
        if ( !key )
        {
          out.push(opt);
        }
      });

      return out;
    }));

    this.set('groupedContent', Ember.computed('content.@each.'+this.get('optionGroupPath'), () => {
      var groupPath = this.get('optionGroupPath');
      var out = [];

      this.get('content').forEach((opt) => {
        var key = Ember.get(opt, groupPath);
        if ( key )
        {
          var group = out.filterBy('group', key)[0];
          if ( !group )
          {
            group = {group: key, options: []};
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

  _change() {
    const selectEl = this.$()[0];
    const selectedIndex = selectEl.selectedIndex;
    const selectedValue = selectEl.options[selectedIndex].value;
    const content = this.get('content');

    const selection = content.filterBy(this.get('optionValuePath'), selectedValue)[0];

    // set the local, shadowed selection to avoid leaking
    // changes to `selection` out via 2-way binding
    this.set('_selection', selection);

    const changeCallback = this.get('action');
    if ( changeCallback )
    {
      changeCallback(selection);
    }

    if ( selection )
    {
      this.set('value', Ember.get(selection, this.get('optionValuePath')));
    }
    else
    {
      this.set('value', null);
    }
  }
});
