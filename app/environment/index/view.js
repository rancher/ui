import Ember from 'ember';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';

export default Ember.View.extend({
  pods: function() {
    var services = (this.get('context.services')||[]);
    var unremoved = UnremovedArrayProxy.create({sourceContent: services});
    unremoved.set('sortProperties', ['name','id']);
    return unremoved;
  }.property('context.services'),
});
