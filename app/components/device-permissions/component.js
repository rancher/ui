import Ember from 'ember';

export default Ember.Component.extend({
  choices: [
    {value: 'r', label: 'read'},
    {value: 'w', label: 'write'},
    {value: 'm', label: 'mknod'}
  ],

  selection: null,

  init: function() {
    this._super();
    if ( !this.get('selection') )
    {
      var parts = this.get('selectionAsString').split('');
      var selection = this.get('choices').filter(function(choice) {
        return parts.indexOf(choice.value) >= 0;
      });
      this.set('selection', selection);
    }
  },

  selectionAsString: '',
  selectionDidChange: function() {
    var str = '';
    this.get('selection').forEach(function(choice) {
      str += choice.value;
    });
    this.set('selectionAsString', str);
  }.observes('selection.[]'),

  didInsertElement: function() {
    var moreClass = this.get('buttonClass')||'';
    var opts = {
      buttonClass: 'btn btn-default' + (moreClass ? ' '+moreClass : ''),
      numberDisplayed: 2,
      nonSelectedText: 'None',
      allSelectedText: 'All',

      templates: {
        li: '<li><a><label></label></a></li>',
      },
    };

    this.$('SELECT').multiselect(opts);
  },
});
