import Ember from 'ember';
import NewOrEditContainer from '../../container/edit/new-or-edit';

export default Ember.ObjectController.extend(NewOrEditContainer, {
  editing: true,

  initFields: function() {
    this.initPorts();
    this.initLinks();
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
      if ( neu !== obj.get('publicPort') )
      {
        console.log('Changing port',obj.toJSON(),'to',neu);
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
      if ( neu !== obj.get('targetInstanceId') )
      {
        console.log('Changing link',obj.toJSON(),'to',neu);
        obj.set('targetInstanceId', neu);
        promises.push(obj.save());
      }
    });

    return Ember.RSVP.all(promises);
  },
});
