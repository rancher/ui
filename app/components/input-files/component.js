import Ember from 'ember';

export default Ember.Component.extend({
  ary          : null,
  accept       : "text/*",
  addActionLabel: 'generic.emptyString',
  namePlaceholder: 'generic.emptyString',
  valuePlaceholder: 'generic.emptyString',

  actions: {
    add() {
      this.get('ary').pushObject({
        name: '',
        value: '',
      });
    },

    remove(file) {
      this.get('ary').removeObject(file);
    }
  },

  init() {
    this._super(...arguments);
    this.set('ary', []);
  },

  onFilesChanged: Ember.observer('ary.@each.{name,value}', function() {
    let out = {};

    this.get('ary').forEach((file) => {
      if ( file.name && file.value ) {
        out[file.name] = file.value;
      }
    });

    this.sendAction('changed', out);
  }),
});
