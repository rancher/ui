export function resizeDropdown(event) {
  // Preserve compatibility with existing signature
  var $item = $('.dropdown-menu', event.target);
  var target = event.relatedTarget;
  var right = $item.hasClass('dropdown-menu-right');
  return positionDropdown($item, target, right);
}

export function positionDropdown(menu, trigger, right, offset) {
  // https://github.com/twbs/bootstrap/issues/10756#issuecomment-41041800
  var direction = (right === true ? 'right' : 'left');
  var $menu = $(menu);

  // reset position
  menu.css({
    top: 0,
    left: 0
  });

  let pco = {
    item: $menu,
    target: trigger,
    itemAt: 'top ' + direction,
    targetAt: 'bottom ' + direction,
    flip: 'both',
    stick: 'all' // ensure the menu stays on screen
  };

  if (offset) {
    pco.itemOffset = offset;
  }

  // calculate new position
  var calculator = new $.PositionCalculator(pco);
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
