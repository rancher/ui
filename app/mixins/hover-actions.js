import Ember from 'ember';

function onHide() {
  this.set('isMenuShown', false);
  if ( !this.get('isMouseIn') )
  {
    this.$().removeClass('hover');
  }
}

function onShow() {
  this.set('isMenuShown', true);
}

function onEnter() {
  this.set('isMouseIn',true);
  this.$().addClass('hover');
}

function onLeave() {
  this.set('isMouseIn',false);
  if ( !this.get('isMenuShown') )
  {
    this.$().removeClass('hover');
  }
}

export default Ember.Mixin.create({
  boundLeave: null,
  boundEnter: null,
  boundHide: null,
  boundShow: null,
  isMouseIn: false,
  isMenuShown: false,
  didInsertElement: function() {
    this._super();

    var boundHide = onHide.bind(this);
    var boundShow = onShow.bind(this);
    var boundEnter = onEnter.bind(this);
    var boundLeave = onLeave.bind(this);

    this.set('boundHide', boundHide);
    this.set('boundShow', boundShow);
    this.set('boundEnter', boundEnter);
    this.set('boundLeave', boundLeave);

    this.$('.resource-actions').on('hide.bs.dropdown', boundHide);
    this.$('.resource-actions').on('show.bs.dropdown', boundShow);
    this.$().on('mouseenter', boundEnter);
    this.$().on('mouseleave', boundLeave);
  },

  willDestroyElement: function() {
    this._super();

    this.$('.resource-actions').off('hide.bs.dropdown', this.get('boundHide'));
    this.$('.resource-actions').off('show.bs.dropdown', this.get('boundShow'));
    this.$().off('mouseleave', this.get('boundLeave'));
    this.$().off('mouseenter', this.get('boundEnter'));
  }
});
