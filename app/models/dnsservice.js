import Ember from 'ember';
import Service from 'ui/models/service';

const esc = Ember.Handlebars.Utils.escapeExpression;

var DnsService = Service.extend({
  type: 'dnsService',
  intl: Ember.inject.service(),

  healthState: 'healthy',

  displayDetail: function() {
    let intl = this.get('intl');
    let toTranslation = intl.tHtml('generic.to');
    let noneTranslation = intl.tHtml('generic.none');

    var services = '';
    (this.get('consumedServicesWithNames')||[]).forEach((map, idx) => {
      services += '<span>'+ (idx === 0 ? '' : ', ') +
      (map.get('service.stackId') === this.get('stackId') ? '' : esc(map.get('service.displayStack')) + '/') +
      esc(map.get('service.displayName')) + '</span>';
    });

    var out = '<label>'+ toTranslation +': </label>' + services || '<span class="text-muted">'+ noneTranslation +'</span>';

    return out.htmlSafe();
  }.property('consumedServicesWithNames.@each.{name,service}','intl._locale'),
});

export default DnsService;
