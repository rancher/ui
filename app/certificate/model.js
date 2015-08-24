import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  displayName: function() {
    var str =  (this.get('name') || '('+this.get('id')+')');
    var cn = this.get('cn');
    var sans = this.get('subjectAlternativeNames.length');

    if ( cn )
    {
      str += ' (' + cn;
      if ( sans > 0 )
      {
        str += ' + ' + sans + ' other' + (sans === 1 ? '' : 's');
      }
      str += ')';
    }

    return str;
  }.property('id','name','cn','subjectAlternativeNames.length')
});
