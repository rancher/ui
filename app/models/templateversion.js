import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  filesAsArray: function() {
    var obj = (this.get('files')||{});
    var out = [];

    Object.keys(obj).forEach((key) => {
      out.push({name: key, body: obj[key]});
    });

    return out;
  }.property('files'),
});
