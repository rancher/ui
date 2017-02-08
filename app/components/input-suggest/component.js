import Ember from 'ember';
import DropdownComponentMixin from 'ember-rl-dropdown/mixins/rl-dropdown-component';

export default Ember.Component.extend(DropdownComponentMixin, {
  value: null,

  grouped: null, // {group1: [val1, val2], group2: [val3, val4]}
  choices: null, // or [val1, val2, val3, val4]

  classNames: ['input-group','dropdown','dropdown-right'],

  init() {
    this._super(...arguments);
    // event handlers don't get bound context by default...
    this.onOpen = onOpen.bind(this);
  },

  actions: {
    select(value) {
      this.set('value', value);
      this.send('closeDropdown');
    }
  }
});

function onOpen() {
  this.$('.dropdown-menu').css({
    right: '0',
    maxWidth: '100%',
    maxHeight: '300px',
    overflow: 'hidden',
    overfloyY: 'auto'
  });
}
