import Ember from 'ember';
import { alternateLabel } from 'ui/utils/platform';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['medium-modal'],
  resources: Ember.computed.alias('modalService.modalOpts.resources'),
  alternateLabel: alternateLabel,
  settings: Ember.inject.service(),
  intl: Ember.inject.service(),

  showProtip: function() {
    let show = this.get('modalService.modalOpts.showProtip');
    if ( show === undefined ) {
      show = true;
    }

    return show;
  }.property('modalService.modalOpts.showProtip'),

  actions: {
    confirm: function() {
      this.get('resources').forEach((resource) => {
        if ( resource.cb ) {
          resource.cb();
        } else {
          resource.delete();
        }
      });

      this.send('cancel');
    },

  },

  isEnvironment: Ember.computed('resources', function() {
    return !!this.get('resources').findBy('type','project');
  }),

  didRender: function() {
    setTimeout(() => {
      try {
        this.$('BUTTON')[0].focus();
      } catch (e) {}
    }, 500);
  }
});
