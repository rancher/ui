import Ember from 'ember';

export default Ember.Mixin.create({
  tab: null,

  actions: {
    selectTab: function(name) {
      this.set('tab', name);
      this.$('.tab').removeClass('active');
      this.$('.tab[data-section="'+name+'"]').addClass('active');
      this.$('.section').addClass('hide');
      this.$('.section[data-section="'+name+'"]').removeClass('hide');
    }
  }
});
