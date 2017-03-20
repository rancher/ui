import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, NewOrEdit, {
  classNames: ['large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
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

});
