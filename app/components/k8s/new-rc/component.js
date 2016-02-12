import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { emptyContainer } from 'ui/k8s-tab/namespace/rcs/new/route';

export default Ember.Component.extend(NewOrEdit, {
  primaryResource: null,
  rcTemplate: Ember.computed.alias('primaryResource.template'),
  rcSpec: Ember.computed.alias('rcTemplate.spec'),
  podTemplate: Ember.computed.alias('rcSpec.template'),
  podSpec: Ember.computed.alias('podTemplate.spec'),

  containerIndex: 0,

  init() {
    this._super();
    window.newrc = this;
  },

  actions: {
    selectContainer(index) {
      this.set('containerIndex', index);
      if ( this.$() )
      {
        this.$().children('[data-containerindex]').addClass('hide');
        var body = this.$().children('[data-containerindex="'+index+'"]')[0];
        if ( body )
        {
          $(body).removeClass('hide');
          $("INPUT[type='text']", body)[0].focus();
        }
      }
    },

    addContainer() {
      var ary = this.get('podSpec.containers');
      ary.pushObject(emptyContainer());

      // Wait for it to be added to the DOM...
      Ember.run.next(() => {
        this.send('selectContainer', ary.get('length')-1);
      });
    },

    removeContainer() {
      var idx = this.get('containerIndex');
      var ary = this.get('podSpec.containers');
      ary.removeAt(idx);
      if ( idx >= ary.get('length') )
      {
        Ember.run.next(() => {
          this.send('selectContainer', ary.get('length')-1);
        });
      }
    },

    setScale(scale) {
      this.set('rcSpec.replicas', scale);
    },

    toggleAdvanced() {
      this.set('advanced', !this.get('advanced'));
    },

    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },
  },

  didInsertElement() {
    this.$("INPUT[type='text']")[0].focus();
  },

  activeContainer: function() {
    var idx = this.get('containerIndex');
    return this.get('podSpec.containers').objectAt(idx);
  }.property('containerIndex'),

  containerChoices: function() {
    var out = [];
    (this.get('podSpec.containers')||[]).forEach((item, index) => {
      out.push({
        index: index,
        enabled: true,
        name: Ember.get(item,'name') || `(Container #${index+1})`
      });
    });

    return out;
  }.property('podSpec.containers.@each.name'),

  doneSaving() {
    this.sendAction('done');
  },
});
