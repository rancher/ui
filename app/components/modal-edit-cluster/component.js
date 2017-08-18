import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, NewOrEdit, {
  classNames: ['large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  editing: true,
  model: null,

  willInsertElement: function() {
    this._super(...arguments);
    var orig = this.get('originalModel');
    if ( orig ) {
      var clone = orig.clone();
      this.setProperties({
        editing: true,
        model: clone,
        createProject: null,
      });
    } else {
      this.setProperties({
        editing: false,
        model: this.get('userStore').createRecord({
          type: 'cluster',
        }),
        createProject: this.get('userStore').createRecord({
          type: 'project',
          name: 'Default',
        }),
      });
    }
  },

  didInsertElement() {
    this.$('INPUT')[0].focus();
  },

  didSave() {
    let project = this.get('createProject');
    if ( project ) {
      project.set('clusterId', this.get('model.id'));
      return project.save();
    }
  },

  doneSaving: function() {
    this.send('cancel');
  }
});
