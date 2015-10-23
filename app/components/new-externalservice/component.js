import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  service: null,

  primaryResource: Ember.computed.alias('service'),

  actions: {
    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },
  },

  didInsertElement() {
    this.$('INPUT')[0].focus();
  },

  validate() {
    var errors = [];
    if ( !this.get('service.externalIpAddresses.length') && !this.get('service.hostname') )
    {
      errors.push('Choose one or more targets to send traffic to');
    }
    else
    {
      this._super();
      errors = this.get('errors')||[];
    }


    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }

    return true;
  },

  willSave: function() {
    this.set('service.launchConfig',{});
    return this._super.apply(this,arguments);
  },

  doneSaving() {
    this.send('done');
  },
});
