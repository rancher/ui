import Ember from 'ember';
import ContainerChoices from 'ui/mixins/container-choices';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

export default Ember.Component.extend(ContainerChoices, {
  // Inputs
  editing: null,
  instance: null,

  linksArray: Ember.computed.alias('instance.instanceLinks'),

  tagName: '',
  errors: null,

  actions: {
    addLink: function() {
      let links = this.get('linksArray');
      if ( !links ) {
        links = [];
        this.set('linksArray', links);
      }

      links.pushObject(this.get('store').createRecord({
        type: 'link',
        name: '',
        alias: '',
      }));
    },

    removeLink: function(obj) {
      this.get('linksArray').removeObject(obj);
    },
  },

  statusClass: null,
  status: function() {
    let k = STATUS.NONE;
    let count = (this.get('linksArray')||[]).filterBy('name').get('length') || 0;

    if ( count ) {
      if ( this.get('errors.length') ) {
        k = STATUS.INCOMPLETE;
      } else {
        k = STATUS.COUNTCONFIGURED;
      }
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }.property('linksArray.@each.name'),
});
