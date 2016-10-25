import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

export default Resource.extend({
  isSystem: function() {
    if ( this.get('system') ) {
      return true;
    }

    let labels = this.get('labels');
    return labels && !!labels[C.LABEL.SYSTEM_TYPE];
  }.property('system','labels'),
});
