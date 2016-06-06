import Ember from 'ember';

export default Ember.Component.extend({
  editing       : false,
  clone         : null,
  originalModel : null,
  errors        : null,
  model         : null,
  snapshotName  : null,

  actions: {
    cancel: function() {
      this.sendAction('dismiss');
    },
    saveSnapshot: function() {
      let opts = {
        name: this.get('snapshotName')
      };
      this.get('model').doAction('snapshot', opts).then(() => {
        this.sendAction('dismiss');
      });

    }
  },

  didReceiveAttrs() {
    this.set('clone', this.get('originalModel').clone());
    this.set('model', this.get('originalModel').clone());
    this.set('snapshotName', `${this.get('originalModel.name')}-${Math.round(new Date().getTime()/1000.0)}`);
  },

  didRender() {
    setTimeout(() => {
      this.$('INPUT')[0].focus();
    }, 500);
  },

});
