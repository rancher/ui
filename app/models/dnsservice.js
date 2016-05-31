import Ember from 'ember';
import Service from 'ui/models/service';

const esc = Ember.Handlebars.Utils.escapeExpression;

var DnsService = Service.extend({
  type: 'dnsService',
  intl: Ember.inject.service(),

  healthState: function() {
    let out = this.get('intl').findTranslationByKey('generic.healthy');
    return this.get('intl').formatMessage(out);
  }.property('intl._locale'),

  displayDetail: function() {
    let intl = this.get('intl');
    let toTranslation = intl.findTranslationByKey('generic.to');
    let noneTranslation = intl.findTranslationByKey('generic.none');
    toTranslation = intl.formatMessage(toTranslation);
    noneTranslation = intl.formatMessage(noneTranslation);

    var services = '';
    (this.get('consumedServicesWithNames')||[]).forEach((map, idx) => {
      services += '<span>'+ (idx === 0 ? '' : ', ') +
      (map.get('service.environmentId') === this.get('environmentId') ? '' : esc(map.get('service.displayEnvironment')) + '/') +
      esc(map.get('service.displayName')) + '</span>';
    });

    var out = '<label>'+ toTranslation +': </label>' + services || '<span class="text-muted">'+ noneTranslation +'</span>';

    return out.htmlSafe();
  }.property('consumedServicesWithNames.@each.{name,service}','consumedServicesUpdated', 'intl._locale'),
});

export default DnsService;