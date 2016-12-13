import Ember from 'ember';

export default Ember.Component.extend({
  // Inputs
  initialValues    : null,
  addActionLabel   : 'formValueArray.addActionLabel',
  valueLabel       : 'formValueArray.valueLabel',
  valuePlaceholder : 'formValueArray.valuePlaceholder',
  showProTip       : true,

  ary              : null,
  asValues         : null,

  actions: {
    add() {
      this.get('ary').pushObject(Ember.Object.create({value: ''}));
      Ember.run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.$('INPUT.value').last()[0].focus();
      });
    },

    remove(obj) {
      this.get('ary').removeObject(obj);
    },

    pastedValues(str) {
      var ary = this.get('ary');
      str = str.trim();

      var lines = str.split(/\r?\n/);
      lines.forEach((line) => {
        line = line.trim();
        if ( !line )
        {
          return;
        }

        ary.pushObject(Ember.Object.create({value: line}));
      });

      // Clean up empty user entries
      var toRemove = [];
      ary.forEach((item) => {
        if ( !item.get('value') )
        {
          toRemove.push(item);
        }
      });

      ary.removeObjects(toRemove);
    },
  },

  init() {
    this._super(...arguments);

    var ary = [];
    (this.get('initialValues')||[]).forEach((value) => {
      ary.push(Ember.Object.create({value: value}));
    });

    this.set('ary', ary);
  },

  asValuesObserver: function() {
    var out = this.get('ary').filterBy('value').map((row) => {
      return row.get('value');
    });

    this.set('asValues', out);
    this.sendAction('changed', out);
  }.observes('ary.@each.{value}'),
});
