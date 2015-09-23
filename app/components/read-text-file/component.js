import Ember from 'ember';

export default Ember.Component.extend({
  tagName: ['span'],
  accept: "text/*",
  btnClass: "btn-sm btn-primary",
  btnLabel: "Read from File",

  _boundChange: null,

  actions: {
    click() {
      this.$('INPUT')[0].click();
    }
  },

  didInsertElement() {
    this.set('_boundChange', (event) => { this.change(event); });
    this.$('INPUT').on('change', this.get('_boundChange'));
  },

  willDestroyElement() {
    this.$('INPUT').off('change', this.get('_boundChange'));
  },

  change(event) {
    var input = event.target;
    if ( input.files && input.files[0] )
    {
      var reader = new FileReader();
      reader.onload = (event2) => {
        this.sendAction('action', event2.target.result);
      };
      reader.readAsText(input.files[0]);
    }
  },
});
