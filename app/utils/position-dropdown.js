export function resizeDropdown(event) {
  // Preserve compatibility with existing signature
  var $item = $('.dropdown-menu', event.target);
  var target = event.relatedTarget;
  var right = $item.hasClass('dropdown-menu-right');
  return positionDropdown($item, target, right);
}

export function positionDropdown(menu, trigger, right) {
  // https://github.com/twbs/bootstrap/issues/10756#issuecomment-41041800
  var direction = (right === true ? 'right' : 'left');
  var $menu = $(menu);

  // reset position
  menu.css({
    top: 0,
    left: 0
  });

  // calculate new position
  var calculator = new $.PositionCalculator({
    item: $menu,
    target: trigger,
    itemAt: 'top ' + direction,
    itemOffset: {
      y: 3,
      x: 0,
      mirror: true
    },
    targetAt: 'bottom ' + direction,
    flip: 'both'
  });
  var posResult = calculator.calculate();

  // set new position
  if ( $menu && posResult && posResult.moveBy ) {
    $menu.css({
      top: posResult.moveBy.y + 'px',
      left: posResult.moveBy.x + 'px'
    });
  }
  return null;
}

export default {
  resizeDropdown: resizeDropdown,
  positionDropdown: positionDropdown
};
