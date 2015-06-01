import Ember from 'ember';

export default Ember.Component.extend({
  model: null,
  classNames: ['pod','host','resource-action-hover'],
  classNameBindings: ['stateBorder','isMachine:machine-host'],

  actions: {
    newContainer: function() {
      this.get('model').send('newContainer');
    },
  },

  isMachine: Ember.computed.equal('model.type','machine'),
  isActive: Ember.computed.equal('model.state','active'),

  showAdd: function() {
    return this.get('isActive') && !this.get('isMachine');
  }.property('isActive','isMachine'),

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),

  stateBorder: function() {
    return this.get('model.stateColor').replace("text-","border-top-");
  }.property('model.stateColor'),

  labelArray: function() {
    var out = [];
    var obj = this.get('model.labels')||{};
    var keys = Ember.keys(obj).sort();
    keys.forEach(function(key) {
      if ( key.indexOf('io.rancher') === -1 )
      {
        out.push(Ember.Object.create({
          key: key,
          value: obj[key],
          isUser: true,
          kind: 'User',
        }));
      }
    });

    return out;
  }.property('model.labels.@each.{key,value}'),
});
