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
        window.scrollTo(0, this.get('lastScroll'));
      });
    } else {
      this.set('lastScroll', window.scrollY);
      this.set('modalVisible', true);
      window.scrollTo(0, 0);
    }
  },
});
