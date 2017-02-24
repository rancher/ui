import Ember from 'ember';

export default Ember.Service.extend({
  modalType: 'generic-modal',
  modalOpts: null,
  modalVisible: false,
  lastScroll: null,
  closeWithOutsideClick: Ember.computed.alias('modalOpts.closeWithOutsideClick'),
  toggleModal: function(type=null, opts=null) {
    if (opts) {
      this.set('modalOpts', opts);
    }

    this.set('modalType', type);

    if ( this.get('modalVisible') ) {
      this.set('modalVisible', false);
      this.set('modalOpts', null);
      Ember.run.next(() => {
        document.body.scrollTop = this.get('lastScroll');
      });
    } else {
      this.set('lastScroll', document.body.scrollTop);
      this.set('modalVisible', true);
      document.body.scrollTop = 0;
    }
  },
});
