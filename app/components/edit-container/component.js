import Ember from 'ember';
import EditContainer from 'ui/mixins/edit-container';

export default Ember.Component.extend(EditContainer, {
  editing: true,
  loading: true,

  instance: null,
  ports: null,
  instanceLinks: null,
  allHosts: null,

  actions: {
    outsideClick: function() {},

    cancel: function() {
      this.sendAction('dismiss');
    }
  },

  didInsertElement: function() {
    Ember.run.next(this, 'loadDependencies');
  },

  loadDependencies: function() {
    var instance = this.get('originalModel');

    return Ember.RSVP.all([
      instance.followLink('ports'),
      instance.followLink('instanceLinks'),
      this.get('store').findAll('host'), // Need inactive ones in case a link points to an inactive host
    ]).then((results) => {
      var model = Ember.Object.create({
        instance: instance,
        ports: results[0],
        instanceLinks: results[1],
        allHosts: results[2],
      });

      this.setProperties({
        originalModel: instance,
        model: model,
        ports: model.ports,
        instanceLinks: model.instanceLinks,
        allHosts: model.allHosts,
      });

      this.initFields();
      this.set('loading', false);
    });
  },

  didSave: function() {
    return Ember.RSVP.all([
      this.savePorts(),
      this.saveLinks(),
    ]);
  },

  savePorts: function() {
    var promises = [];
    this.get('portsArray').forEach(function(port) {
      var neu = parseInt(port.public,10);
      if ( isNaN(neu) )
      {
        neu = null;
      }

      var obj = port.obj;
      if ( neu !== Ember.get(obj,'publicPort') )
      {
        //console.log('Changing port',obj.serialize(),'to',neu);
        obj.set('publicPort', neu);
        promises.push(obj.save());
      }
    });

    return Ember.RSVP.all(promises);
  },

  saveLinks: function() {
    var promises = [];
    this.get('linksArray').forEach(function(link) {
      var neu = link.targetInstanceId;
      var obj = link.obj;
      if ( neu !== Ember.get(obj,'targetInstanceId') )
      {
        //console.log('Changing link',obj.serialize(),'to',neu);
        obj.set('targetInstanceId', neu);
        promises.push(obj.save());
      }
    });

    return Ember.RSVP.all(promises);
  },

  doneSaving: function() {
    this.sendAction('dismiss');
  },
});
