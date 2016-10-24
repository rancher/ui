import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

export default Resource.extend({
  projects: Ember.inject.service(),

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

    if ( name === 'k8s' ) {
      name = 'kubernetes';
    }

    return name;
  }),

  machineHasIcon: Ember.computed('templateBase', function(){
    if (this.get('templateBase') === 'machine') {
      if (this.get('links.icon')) {
        return this.get('links.icon');
      }
    }
    return false;
  }),

  supportsOrchestration(orch) {
    orch = orch.replace(/.*\*/,'');
    if ( orch === 'k8s' ) {
      orch = 'kubernetes';
    }
    let list = ((this.get('labels')||{})[C.LABEL.ORCHESTRATION_SUPPORTED]||'').split(/\s*,\s*/).filter((x) => x.length > 0);
    return list.length === 0 || list.includes(orch);
  },

  supported: function() {
    let orch = this.get('projects.current.orchestration')||'cattle';
    if ( (this.get('category')||'').toLowerCase() === 'orchestration' ) {
      return orch === 'cattle';
    } else {
      return this.supportsOrchestration(orch);
    }
  }.property('labels','projects.current.orchestration'),
});
