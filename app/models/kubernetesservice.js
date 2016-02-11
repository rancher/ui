import Service from 'ui/models/service';
import Ember from 'ember';

const esc = Ember.Handlebars.Utils.escapeExpression;

var KubernetesService = Service.extend({
  type: 'kubernetesService',
  spec: Ember.computed.alias('template.spec'),

  displayPorts: function() {
    var pub = '';
    (this.get('spec.ports')||[]).forEach((port, idx) => {
      pub += '<span>' + (idx === 0 ? '' : ', ') +
        esc(port.port) +
        '</span>';
    });

    var out =  '<label>Ports: </label>' + (pub||'<span class="text-muted">None</span>');

    return out.htmlSafe();
  }.property('spec.ports.[]'),

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
});

export default KubernetesService;
