import Ember from 'ember';

export default Ember.Component.extend({
  prefs: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),
  stickyHeader: false,
  activity: null,
  sortBy: 'name',
  body: null,
  filtered: function(){
    return this.get('body')
  }.property('body'),
  expandFn:function(/*item*/) {
    // item.toggleProperty('expanded');
  },
  dateNow: null,
  dateInterval: null,
  didInsertElement(){
    this._super(...arguments);
    Ember.run.once(()=>{
      var interval = window.setInterval(()=>{
        this.set('dateNow',Date.now())
      },1000);
      this.set('dateInterval',interval);
    });
  },
  willDestroyElement(){
    this._super(...arguments);
    var interval = this.get('dateInterval');
    interval&&window.clearInterval(interval);
  },
  actions: {
    sendAction: function (model, action) {
      return model.send(action)
    },
  },
});
