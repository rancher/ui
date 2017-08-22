import Resource from 'ember-api-store/models/resource';

var Amazonec2config = Resource.extend({
  type: 'githubConfig',
});


Amazonec2config.reopenClass({
  //tags are in a really dumb format, key1,value1,key2,value2
  // so we need to fix them before they get to the user
  mangleIn: function(data/* , store */) {
    if ( data.tags.length > 0 ) {
      let tags    = data.tags.split(',');
      let tagsOut = {};

      for (var i = 0 ; i < tags.length-1 ; i += 2){
        tagsOut[tags[i]] = tags[i+1];
      }

      data.tags = tagsOut;
    }

    return data;
  },
  mangleOut: function(data/* , store */) {
    if ( data.tags && Object.keys(data.tags) ) {
      let tags    = data.tags;
      let tagsOut = [];

      // key1,value1,key2,value2
      Object.keys(tags).forEach((key) => {
        tagsOut.push(key,tags[key]);
      });

      data.tags = tagsOut.join(',');
    }

    return data;
  }
});

export default Amazonec2config;
