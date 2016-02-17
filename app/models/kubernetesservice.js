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
});

export default KubernetesService;
