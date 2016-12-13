import Ember from 'ember';

export default Ember.Mixin.create({
  k8s: Ember.inject.service(),

  selectorsAsArray: function() {
    var out = [];
    var sel = this.get('spec.selector');
    if ( typeof sel === 'string' )
    {
      sel.split(/\s*,\s*/).filter((str) => { return str.length > 0; }).forEach((pair) => {
        var idx = pair.indexOf('=');
        if ( idx >= 0 )
        {
          out.push({label: pair.substr(0,idx), value: pair.substr(idx+1) });
        }
      });
    }
    else if ( typeof sel === 'object' )
    {
      if ( sel.matchLabels ) {
        Object.keys(sel.matchLabels).forEach((key) => {
          out.push({label: key, value: sel.matchLabels[key]});
        });
      }
      else
      {
        Object.keys(sel).forEach((key) => {
          out.push({label: key, value: sel[key]});
        });
      }
    }

    return out;
  }.property('spec.selector'),

  _selected(field,method) {
    var selectors = this.get('selectorsAsArray');
    if ( selectors.length === 0 )
    {
      return [];
    }

    var ns = this.get('k8s.namespace.id');

    var matching = this.get(field).slice();
    selectors.forEach((sel) => {
      matching = matching.filter((r) => {
        if ( r.metadata && r.metadata.namespace && r.metadata.namespace !== ns ) {
          return false;
        }

        return r[method](sel.label, sel.value);
      });
    });

    return matching;
  },

  selectedPods: function() {
    return this._selected('k8s.pods','hasLabel');
  }.property('selectorsAsArray.@each.{label,value}','k8s.pods.[]','k8s.namespace.id'),

  selectedReplicaSets: function() {
    return this._selected('k8s.replicasets','hasLabel');
  }.property('selectorsAsArray.@each.{label,value}','k8s.replicasets.[]','k8s.namespace.id'),
});
