import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { computed } from '@ember/object'
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  router: service(),
  intl: service(),

  state: 'active',

  actions: {
    edit() {
      get(this, 'router').transitionTo('authenticated.project.certificates.detail.edit', get(this, 'id'));
    },
  },

  availableActions: computed('links.{update,remove}', function() {
    let l = get(this, 'links');

    let choices = [
      { label: 'action.edit',       icon: 'icon icon-edit',           action: 'edit',         enabled: !!l.update },
      { divider: true },
      { label: 'action.remove',     icon: 'icon icon-trash',          action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',  action: 'goToApi',      enabled: true },
    ];

    return choices;
  }),

  issuedDate: computed('issuedAt', function() {
    return new Date(get(this, 'issuedAt'));
  }),

  expiresDate: computed('expiresAt', function() {
    return new Date(get(this, 'expiresAt'));
  }),

  expiresSoon: computed('expiresDate', function() {
    var diff = (get(this, 'expiresDate')).getTime() - (new Date()).getTime();
    var days = diff/(86400*1000);
    return days <= 8;
  }),

  displayIssuer: computed('issuer', function() {
    return (get(this, 'issuer')||'').split(/,/)[0].replace(/^CN=/i,'');
  }),

  // All the SANs that aren't the CN
  displaySans: computed('cn','subjectAlternativeNames.[]', function() {
    const sans = get(this,'subjectAlternativeNames')||'';
    const cn = get(this, 'cn')||'';

    if ( !sans ) {
      return [];
    }

    return sans.split(',')
      .removeObject(cn)
      .filter((san) => {
        return (san+'').indexOf('@') === -1;
      });
  }),

  // The useful SANs; Removes "domain.com" when the cert is for "www.domain.com"
  countableSans: computed('displaySans.[]','cn', function() {
    var sans = get(this, 'displaySans').slice();
    if ( get(this, 'cn') )
    {
      sans.pushObject(get(this, 'cn'));
    }

    var commonBases = sans.filter((name) => {
      return name.indexOf('*.') === 0 || name.indexOf('www.') === 0;
    }).map((name) => {
      return name.substr(name.indexOf('.'));
    });

    return get(this, 'displaySans').slice().removeObjects(commonBases);
  }),

  // "cn.com and 5 others" (for table view)
  displayDomainName: computed('cn','countableSans.length', function() {
    const intl = get(this, 'intl');
    const cn = get(this, 'cn');
    const sans = get(this, 'countableSans.length');
    const wildcard = cn.substr(0,1) === '*';

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

    return intl.t(key, { cn, sans });
  }),

  // "user-provided-name (cn-if-different-than-user-name.com + 5 others)"
  displayDetailedName: computed('displayName','cn','countableSans.length', function() {
    var name = get(this, 'displayName');
    var cn = get(this, 'cn');
    var sans = get(this, 'countableSans.length');
    var out = name;

    var more = '';
    if ( cn ) {
      if ( cn !== name ) {
        more += cn;
      }

      if ( sans > 0 ) {
        more += ' + ' + sans + ' other' + (sans === 1 ? '' : 's');
      }
    }

    if ( more ) {
      out += ' (' + more + ')';
    }

    return out;
  }),
});
