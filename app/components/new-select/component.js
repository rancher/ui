import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'select',
  // possible passed-in values with their defaults:
  content: null,
  prompt: null,
  optionValuePath: 'value',
  optionLabelPath: 'label',
  action: Ember.K, // action to fire on change
  value: null,

  // shadow the passed-in `selection` to avoid
  // leaking changes to it via a 2-way binding
  _selection: Ember.computed.reads('selection'),

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

  _change() {
    const selectEl = this.$()[0];
    const selectedIndex = selectEl.selectedIndex;
    const content = this.get('content');

    // decrement index by 1 if we have a prompt
    const hasPrompt = !!this.get('prompt');
    const contentIndex = hasPrompt ? selectedIndex - 1 : selectedIndex;

    const selection = content.objectAt(contentIndex);

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
