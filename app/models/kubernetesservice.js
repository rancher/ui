import Service from 'ui/models/service';
import Ember from 'ember';

const esc = Ember.Handlebars.Utils.escapeExpression;

var KubernetesService = Service.extend({
  type: 'kubernetesService',

  displayPorts: function() {
    var pub = '';
    (this.get('ports')||[]).forEach((port, idx) => {
      pub += '<span>' + (idx === 0 ? '' : ', ') +
        esc(port.port) +
        '</span>';
    });

    var out =  '<label>Ports: </label>' + (pub||'<span class="text-muted">None</span>');

    return out.htmlSafe();
  }.property('ports.[]'),

  displaySelectors: function() {
    var pub = '';
    (this.get('selectorContainer')||'').
      split(/\s*,\s*/).
      filter((str) => { return str.length > 0; }).
      forEach((selector, idx) => {
        pub += '<span>' + (idx === 0 ? '' : ', ') +
          esc(selector) +
          '</span>';
      });

    var out =  '<label>Selectors: </label>' + (pub||'<span class="text-muted">None</span>');

    return out.htmlSafe();
  }.property('ports.[]'),
});

export default KubernetesService;
