import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { alternateLabel } from 'ui/utils/platform';
import ModalBase from 'ui/mixins/modal-base';
import layout from './template';


export default Component.extend(ModalBase, {
  layout,
  classNames: ['medium-modal'],
  resources: alias('modalService.modalOpts.resources'),
  alternateLabel: alternateLabel,
  settings: service(),
  intl: service(),

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

  isEnvironment: computed('resources', function() {
    return !!this.get('resources').findBy('type','project');
  }),

  isCluster: computed('resources', function() {
    return !!this.get('resources').findBy('type','cluster');
  }),

  isBound: computed('resources', function() {
    const found = this.get('resources').findBy('type','persistentVolume');
    return !!found && found.state === 'bound';
  }),

  didRender: function() {
    setTimeout(() => {
      try {
        this.$('BUTTON')[0].focus();
      } catch (e) {}
    }, 500);
  }
});
