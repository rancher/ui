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
      Object.keys(sel).forEach((key) => {
        out.push({label: key, value: sel[key]});
      });
    }

    return out;
  }.property('spec.selector'),

  selectedPods: function() {
    var selectors = this.get('selectorsAsArray');
    if ( selectors.length === 0 )
    {
      return [];
    }

    var matching = this.get('k8s.pods').slice();
    selectors.forEach((sel) => {
      matching = matching.filter((pod) => {
        return pod.hasLabel(sel.label, sel.value);
      });
    });

    return matching;
  }.property('selectorsAsArray.@each.{label,value}','k8s.pods.[]')
});
