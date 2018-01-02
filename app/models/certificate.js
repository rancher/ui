import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  modalService: service('modal'),
  actions: {
    edit: function() {
      this.get('modalService').toggleModal('modal-edit-certificate', this);
    },
  },
  availableActions: function() {
    let l = this.get('links');

    let choices = [
      { label: 'action.edit',       icon: 'icon icon-edit',           action: 'edit',         enabled: !!l.update },
      { divider: true },
      { label: 'action.remove',     icon: 'icon icon-trash',          action: 'promptDelete', enabled: !!l.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',  action: 'goToApi',      enabled: true },
    ];

    return choices;
  }.property('links.{update,remove}'),

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
    return (this.get('subjectAlternativeNames')||[])
      .slice()
      .removeObject(this.get('cn'))
      .filter((san) => {
        return (san+'').indexOf('@') === -1;
      });
  }.property('cn','subjectAlternativeNames.[]'),

  countableSans: function() {
    var sans = this.get('displaySans').slice();
    if ( this.get('cn') )
    {
      sans.pushObject(this.get('cn'));
    }

    var commonBases = sans.filter((name) => {
      return name.indexOf('*.') === 0 || name.indexOf('www.') === 0;
    }).map((name) => {
      return name.substr(2);
    });

    return this.get('displaySans').slice().removeObjects(commonBases);
  }.property('displaySans.[]','cn'),

  displayDetailedName: function() {
    var name = (this.get('name') || '('+this.get('id')+')');
    var str = name;
    var cn = this.get('cn');
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
  }.property('id','name','cn','countableSans.length')
});
