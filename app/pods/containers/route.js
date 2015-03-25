import Ember from 'ember';
import UnmanagedProxy from 'ui/utils/unmanaged-array-proxy';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('container').then((all) => {
      var proxy = UnmanagedProxy.create({
        sortProperties: ['name','id'],
        sourceContent: all
      });
      return proxy;
    });
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Containers'});
  },
});
