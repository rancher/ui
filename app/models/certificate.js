import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { computed } from '@ember/object'
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  router:       service(),
  intl:         service(),
  allWorkloads: service(),

  state: 'active',

  workloads: computed('allWorkloads.list.@each.{containers,volumes}', 'name', 'namespaceId', function() {
    return (get(this, 'allWorkloads.list') || []).map((item) => item.obj).filter((workload) => {
      if ( this.namespaceId && get(workload, 'namespaceId') !== this.namespaceId) {
        return false;
      }
      const volume = (get(workload, 'volumes') || []).find((volume) => get(volume, 'secret.secretName') === this.name);
      const env = (get(workload, 'containers') || []).find((container) => (get(container, 'environmentFrom') || []).find((env) => get(env, 'source') === 'secret' && get(env, 'sourceName') === this.name));

      return volume || env;
    });
  }),

  issuedDate: computed('issuedAt', function() {
    return new Date(this.issuedAt);
  }),

  expiresDate: computed('expiresAt', function() {
    return new Date(this.expiresAt);
  }),

  expiresSoon: computed('expiresDate', function() {
    var diff = (this.expiresDate).getTime() - (new Date()).getTime();
    var days = diff / (86400 * 1000);

    return days <= 8;
  }),

  displayIssuer: computed('issuer', function() {
    return (this.issuer || '').split(/,/)[0].replace(/^CN=/i, '');
  }),

  // All the SANs that aren't the CN
  displaySans: computed('cn', 'subjectAlternativeNames.[]', function() {
    const sans = this.subjectAlternativeNames || '';
    const cn = this.cn || '';

    if ( !sans ) {
      return [];
    }

    return sans.removeObject(cn)
      .filter((san) => (`${ san }`).indexOf('@') === -1);
  }),

  // The useful SANs; Removes "domain.com" when the cert is for "www.domain.com"
  countableSans: computed('displaySans.[]', 'cn', function() {
    var sans = this.displaySans.slice();

    if ( this.cn ) {
      sans.pushObject(this.cn);
    }

    var commonBases = sans.filter((name) => name.indexOf('*.') === 0 || name.indexOf('www.') === 0).map((name) => name.substr(name.indexOf('.')));

    return this.displaySans.slice()
      .removeObjects(commonBases);
  }),

  // "cn.com and 5 others" (for table view)
  displayDomainName: computed('cn', 'countableSans.length', function() {
    const intl = this.intl;
    const cn = this.cn;

    if ( !cn ) {
      return intl.t('generic.none');
    }

    const sans = get(this, 'countableSans.length');
    const wildcard = cn.substr(0, 1) === '*';

    let key;

    if ( wildcard ) {
      if ( sans ) {
        key = 'certificatesPage.domainNames.wildcardWithSan'
      } else {
        key = 'certificatesPage.domainNames.wildcardSingle'
      }
    } else if ( sans ) {
      key = 'certificatesPage.domainNames.withSan';
    } else {
      key = 'certificatesPage.domainNames.single';
    }

    return intl.t(key, {
      cn,
      sans
    });
  }),

  // "user-provided-name (cn-if-different-than-user-name.com + 5 others)"
  displayDetailedName: computed('displayName', 'cn', 'countableSans.length', function() {
    var name = this.displayName;
    var cn = this.cn;
    var sans = get(this, 'countableSans.length');
    var out = name;

    var more = '';

    if ( cn ) {
      if ( cn !== name ) {
        more += cn;
      }

      if ( sans > 0 ) {
        more += ` + ${  sans  } other${  sans === 1 ? '' : 's' }`;
      }
    }

    if ( more ) {
      out += ` (${  more  })`;
    }

    return out;
  }),
  actions: {
    edit() {
      this.router.transitionTo('authenticated.project.certificates.detail.edit', this.id);
    },
  },

});
