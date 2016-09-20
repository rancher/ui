import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  cleanProjectUrl: Ember.computed('links.project', function() {
    let projectUrl = this.get('links.project');
    let pattern = new RegExp('^([a-z]+://|//)', 'i');

    if (projectUrl) {
      if (!pattern.test(projectUrl)) {
        projectUrl = `http://${projectUrl}`;
      }
    }

    return Ember.String.htmlSafe(projectUrl);
  }),

  defaultName: Ember.computed('id','templateBase', function() {
    var name = this.get('id');
    var base = this.get('templateBase');

    name = name.replace(/^[^:\/]+[:\/]/,'');  // Strip the "catalog-name:"
    if ( base )
    {
      var idx = name.indexOf(base);
      if ( idx === 0 )
      {
        name = name.substr(base.length+1); // Strip the "template-base*"
      }
    }

    // Strip anything else invalid
    name = name.replace(/[^a-z0-9-]+/ig,'');

    return name;
  }),
});
