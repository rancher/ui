import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import SelectTab from 'ui/mixins/select-tab';

export default Ember.Component.extend(NewOrEdit, SelectTab, {
  primaryResource: null,
  editing: false,

  actions: {
    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },
  },

  serviceTypChoices: function() {
    return this.get('store').getById('schema','kubernetesservice').get('resourceFields.serviceType.options').map((val) => {
      return {
        label: val,
        value: val,
      };
    });
  }.property(),

  didInsertElement() {
    if ( this.get('isVm') )
    {
      this.send('selectTab','disks');
    }
    else
    {
      this.send('selectTab','command');
    }

    this.$("INPUT[type='text']")[0].focus();
  },

  doneSaving() {
    this.sendAction('done');
  },
});
