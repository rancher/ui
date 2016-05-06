import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  actions: {
    edit: function() {
      this.get('application').setProperties({
        editCertificate: true,
        originalModel: this,
      });
    },
  },
  availableActions: function() {
    var a = this.get('actionLinks');
    if ( !a )
    {
      return [];
    }

    var choices = [
      { label: 'action.remove',     icon: 'icon icon-trash',          action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
      { label: 'action.restore',    icon: 'icon icon-medicalcross',   action: 'restore',      enabled: !!a.restore },
      { label: 'action.purge',      icon: '',                         action: 'purge',        enabled: !!a.purge },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',  action: 'goToApi',      enabled: true },
      { divider: true },
      { label: 'action.edit',       icon: 'icon icon-edit',           action: 'edit',         enabled: !!a.update },
    ];

    return choices;
  }.property('actionLinks.{remove,restore,purge,update}'),
  issuedDate: function() {
    return new Date(this.get('issuedAt'));
  }.property('issuedAt'),

  expiresDate: function() {
    return new Date(this.get('expiresAt'));
  }.property('expiresAt'),

  expiresSoon: function() {
    var diff = (this.get('expiresDate')).getTime() - (new Date()).getTime();
    var days = diff/(86400*1000);
    return days <= 8;
  }.property('expiresDate'),

  displayIssuer: function() {
    return (this.get('issuer')||'').split(/,/)[0].replace(/^CN=/i,'');
  }.property('issuer'),

  isValid: function() {
    var now = new Date();
    return this.get('expiresDate') > now && this.get('issuedDate') < now;
  }.property('expiresDate','issuedDate'),

  displaySans: function() {
    // subjectAlternativeNames can be null:
    return (this.get('subjectAlternativeNames')||[]).slice().removeObject(this.get('CN'));
  }.property('CN','subjectAlternativeNames.[]'),

  countableSans: function() {
    var sans = this.get('displaySans').slice();
    if ( this.get('CN') )
    {
      sans.pushObject(this.get('CN'));
    }

    var commonBases = sans.filter((name) => {
      return name.indexOf('*.') === 0 || name.indexOf('www.') === 0;
    }).map((name) => {
      return name.substr(2);
    });

    return this.get('displaySans').slice().removeObjects(commonBases);
  }.property('displaySans.[]','CN'),

  displayDetailedName: function() {
    var name = (this.get('name') || '('+this.get('id')+')');
    var str = name;
    var cn = this.get('CN');
    var sans = this.get('countableSans.length');

    var more = '';
    if ( cn )
    {
      if ( cn !== name )
      {
        more += cn;
      }

      if ( sans > 0 )
      {
        more += ' + ' + sans + ' other' + (sans === 1 ? '' : 's');
      }
    }

    if ( more )
    {
      str += ' (' + more + ')';
    }

    return str;
  }.property('id','name','CN','countableSans.length')
});
