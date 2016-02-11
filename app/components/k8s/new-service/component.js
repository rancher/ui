import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import SelectTab from 'ui/mixins/select-tab';

const serviceTypes = [
  {label: 'Cluster IP', value: 'ClusterIP'},
  {label: 'Node Port', value: 'NodePort'},
  {label: 'Load Balancer', value: 'LoadBalancer'},
];

export default Ember.Component.extend(NewOrEdit, SelectTab, {
  primaryResource: null,
  spec: Ember.computed.alias('primaryResource.template.spec'),

  editing: false,

  actions: {
    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },
  },

  serviceTypeChoices: function() {
    return serviceTypes;
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

  willSave() {
    var out = this._super.apply(this,arguments);

    this.set('primaryResource.template.metadata', {
      name: this.get('model.name'),
    });

    return out;
  },

  doneSaving() {
    this.sendAction('done');
  },
});
