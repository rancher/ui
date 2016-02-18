export function initialize(/* application */) {
  var body = jQuery('BODY');

  body.on('mouseenter','.resource-action-hover', function() {
    var $this = $(this);
    $this.addClass('hover');
    $this.data('isMouseIn', true);
  });

  body.on('mouseleave','.resource-action-hover', function() {
    var $this = $(this);
    $this.data('isMouseIn', false);
    if ( !$this.data('isMenuShown') )
    {
      $this.removeClass('hover');
    }
  });

  body.on('show.bs.dropdown','.resource-action-hover', function() {
    var $this = $(this);
    $this.data('isMenuShown', true);
  });

  body.on('hide.bs.dropdown','.resource-action-hover', function() {
    var $this = $(this);
    $this.data('isMenuShown', false);
    if ( !$this.data('isMouseIn') )
    {
      $this.removeClass('hover');
    }
  });

}

export default {
  name: 'resource-action-hover',
  initialize: initialize
};
