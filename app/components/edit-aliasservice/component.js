import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import EditService from 'ui/mixins/edit-service';
import { addAction } from 'ui/utils/add-view-action';

export default Ember.Component.extend(NewOrEdit, EditService, {
  editing: true,
  loading: true,
  allServices: Ember.inject.service(),

  actions: {
    addServiceLink:        addAction('addServiceLink',  '.service-link'),

    outsideClick: function() {},

    cancel: function() {
      this.sendAction('dismiss');
    }
  },

  didInsertElement: function() {
    Ember.run.next(this, 'loadDependencies');
  },

  loadDependencies: function() {
    var service = this.get('originalModel');

    var dependencies = [
      this.get('allServices').choices(),
    ];

    Ember.RSVP.all(dependencies, 'Load container dependencies').then((results) => {
      var clone = service.clone();
      var model = Ember.Object.create({
        service: clone,
        allServices: results[0],
      });

      this.setProperties({
        originalModel: service,
        model: model,
        service: clone,
      });

      this.initFields();
      this.set('loading', false);
    });
  },

  canScale: false,

  doneSaving: function() {
    this.sendAction('dismiss');
  }
});
