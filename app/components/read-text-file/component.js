import Ember from 'ember';

export default Ember.Component.extend({
  model        : null,
  placeholder  : "",
  tooltip      : "Read from a file",
  accept       : "text/*",
  btnClass     : "btn btn-primary",
  btnLabel     : "Read from File",
  encode       : false,

  tagName      : ['div'],
  classNames   : ['input-group'],

  _boundChange : null,

  actions: {
    click() {
      this.$('INPUT[type=file]')[0].click();
    }
  },

  didInsertElement() {
    this.set('_boundChange', (event) => { this.change(event); });
    this.$('INPUT[type=file]').on('change', this.get('_boundChange'));
  },

  willDestroyElement() {
    this.$('INPUT[type=file]').off('change', this.get('_boundChange'));
  },

  change(event) {
    var input = event.target;
    if ( input.files && input.files[0] ) {
      var reader = new FileReader();
      reader.onload = (event2) => {
        var out = event2.target.result;

        if (this.get('encode')) {
          out = btoa(out);
        }

        this.set('model', out);
      };
      reader.readAsText(input.files[0]);
    }
  },
});
