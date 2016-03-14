import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import C from 'ui/utils/constants';

export default Ember.Component.extend(NewOrEdit,{
  originalModel: null,
  model: null,
  clone: null,
  justCreated: false,

  didReceiveAttrs() {
    this.set('clone', this.get('originalModel').clone());
    this.set('model', this.get('originalModel').clone());
    this.set('justCreated', false);
  },

  didInsertElement() {
    setTimeout(() => {
      this.$('INPUT[type="text"]')[0].focus();
    }, 250);
  },

  editing: function() {
    return !!this.get('clone.id');
  }.property('clone.id'),

  doSave: function() {
    var model = this.get('primaryResource');
    var opt =  {
      headers: {
        [C.HEADER.PROJECT]: undefined
      }
    };

    return model.save(opt).then((newData) => {
      return this.mergeResult(newData);
    });
  },

  doneSaving: function(neu) {
    if ( this.get('editing') )
    {
      this.send('cancel');
    }
    else
    {
      this.setProperties({
        justCreated: true,
        clone: neu.clone()
      });
    }
  },

  actions: {
    outsideClick: function() {},

    cancel: function() {
      this.sendAction('dismiss');
    }
  },

});
