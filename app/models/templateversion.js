import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';
import Ember from 'ember';

export default Resource.extend({
  projects: Ember.inject.service(),

  headers: function() {
    return {
      [C.HEADER.PROJECT_ID]: this.get('projects.current.id')
    };
  }.property('project.current.id'),

  filesAsArray: function() {
    var obj = (this.get('files')||{});
    var out = [];

    Object.keys(obj).forEach((key) => {
      out.push({name: key, body: obj[key]});
    });

    return out;
  }.property('files'),

  supportsOrchestration(orch) {
    orch = orch.replace(/.*\*/,'');
    if ( orch === 'k8s' ) {
      orch = 'kubernetes';
    }
    let list = ((this.get('labels')||{})[C.LABEL.ORCHESTRATION_SUPPORTED]||'').split(/\s*,\s*/).filter((x) => x.length > 0);
    return list.length === 0 || list.includes(orch);
  },
});
