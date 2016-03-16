import Ember from 'ember';

export default Ember.Component.extend({
  rSelected: false,
  wSelected: false,
  mSelected: false,

  selection: null,

  init: function() {
    this._super();
    var sel = this.get('initialSelection');
    this.setProperties({
      rSelected: sel.indexOf('r') >= 0,
      wSelected: sel.indexOf('w') >= 0,
      mSelected: sel.indexOf('m') >= 0,
    });
  },

  actions: {
    selectChanged(x, ele) {
      var str = $(ele.target).val().join('');
      this.sendAction('changed', str);
    },
  },

  didInsertElement: function() {
    var moreClass = this.get('buttonClass')||'';
    var opts = {
      buttonClass: 'btn btn-default' + (moreClass ? ' '+moreClass : ''),
      numberDisplayed: 2,
      nonSelectedText: 'None',
      allSelectedText: 'All',

      templates: {
        li: '<li><a href="#"><label></label></a></li>',
      },
    };

    this.$('SELECT').multiselect(opts);
  },
});
