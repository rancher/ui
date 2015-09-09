export function resizeDropdown(event, data) {
  // https://github.com/twbs/bootstrap/issues/10756#issuecomment-41041800
  var $item = $('.dropdown-menu', event.target);
  var target = data.relatedTarget;

  var direction = ($item.hasClass('dropdown-menu-right') ? 'right' : 'left');

  // reset position
  $item.css({
    top: 0,
    left: 0
  });

  // calculate new position
  var calculator = new $.PositionCalculator({
    item: $item,
    target: target,
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
  $item.css({
    top: posResult.moveBy.y + 'px',
    left: posResult.moveBy.x + 'px'
  });
  return null;
}

export default {
  resizeDropdown: resizeDropdown
};
