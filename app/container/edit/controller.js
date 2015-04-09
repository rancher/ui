import Ember from 'ember';
import EditContainer from 'ui/mixins/edit-container';

export default Ember.ObjectController.extend(EditContainer, {
  editing: true,

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
});
