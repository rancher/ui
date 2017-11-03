import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  settings: Ember.inject.service(),

  classNames: ['accordion-wrapper'],

  isEmpty: Ember.computed.empty('service.lbConfig.config'),

  statusClass: null,
  status: function() {
    let k = STATUS.CONFIGURED;
    if ( this.get('isEmpty') ) {
      k = STATUS.NONE;
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`);
  }.property('isEmpty'),
});
