import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, NewOrEdit, {
  classNames: ['large-modal'],
  originalModel: Ember.computed.alias('modalService.modalOpts'),
  error: null,
  credentials: null,
  model: null,
  editing: true,
  primaryResource: null,

  init: function() {
    this._super(...arguments);
    var orig = this.get('originalModel');

    this.set('model',Ember.Object.create({
      allRegistries: orig.get('registries'),
      registry: orig.get('registry').clone(),
      credential: orig.get('credential').clone()
    }));

    this.setProperties({
      'primaryResource': this.get('model.credential'),
      'activeDriver': 'custom',
      'editing': true
    });
  },

  doneSaving: function() {
    this.send('cancel');
  },
});
