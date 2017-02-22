import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  serviceSelectorStr: function() {
    let all = this.get('serviceSelector')||[];
    return Object.keys(all).map((key) => {
      let val = all[key];
      return key + (val ? '=' + val : '');
    }).join(', ');
  }.property('serviceSelector'),
});
