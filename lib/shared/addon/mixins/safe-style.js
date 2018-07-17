import Mixin from '@ember/object/mixin';

export default Mixin.create({
  safeStyle:  null,
  _safeStyle: function() {
    if ( this.get('safeStyle') ) {
      return this.get('safeStyle').htmlSafe();
    } else {
      return ''.htmlSafe();
    }
  }.property('safeStyle'),

  attributeBindings: ['_safeStyle:style'],
});
