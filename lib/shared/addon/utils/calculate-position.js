export default function(_, _2, _destination, { renderInPlace }) {
  if (renderInPlace) {
    return calculateInPlacePosition(...arguments);
  } else {
    return calculateWormholedPosition(...arguments);
  }
}

export function calculateWormholedPosition(trigger, content, destination, {
  horizontalPosition, verticalPosition, matchTriggerWidth, previousHorizontalPosition, previousVerticalPosition
}) {
  // Re-implement calculateWormholePosition
  // https://git.io/vhf7p
  // See WJW comment below
  let scroll        = {
    left: window.pageXOffset,
    top:  window.pageYOffset
  };
  let {
    left: triggerLeft,
    top: triggerTop,
    width: triggerWidth,
    height: triggerHeight
  }                 = trigger.getBoundingClientRect();
  let {
    height: dropdownHeight,
    width: dropdownWidth
  }                 = content.getBoundingClientRect();
  let viewportWidth = document.body.clientWidth || window.innerWidth;
  let style         = {};

  // Apply containers' offset
  let anchorElement  = destination.parentNode;
  let anchorPosition = window.getComputedStyle(anchorElement).position;

  while (anchorPosition !== 'relative' && anchorPosition !== 'absolute' && anchorElement.tagName.toUpperCase() !== 'BODY') {
    anchorElement = anchorElement.parentNode;
    anchorPosition = window.getComputedStyle(anchorElement).position;
  }

  if (anchorPosition === 'relative' || anchorPosition === 'absolute') {
    let rect             = anchorElement.getBoundingClientRect();

    triggerLeft          = triggerLeft - rect.left;
    triggerTop           = triggerTop - rect.top;
    let { offsetParent } = anchorElement;

    if (offsetParent) {
      triggerLeft -= anchorElement.offsetParent.scrollLeft;
      triggerTop -= anchorElement.offsetParent.scrollTop;
    }
  }

  // Calculate drop down width
  dropdownWidth = matchTriggerWidth ? triggerWidth : dropdownWidth;

  if (matchTriggerWidth) {
    style.width = dropdownWidth;
  }

  // Calculate horizontal position
  let triggerLeftWithScroll = triggerLeft + scroll.left;

  if (horizontalPosition === 'auto' || horizontalPosition === 'auto-left') {
    // Calculate the number of visible horizontal pixels if we were to place the
    // dropdown on the left and right
    let leftVisible  = Math.min(viewportWidth, triggerLeft + dropdownWidth) - Math.max(0, triggerLeft);
    let rightVisible = Math.min(viewportWidth, triggerLeft + triggerWidth) - Math.max(0, triggerLeft + triggerWidth - dropdownWidth);

    if (dropdownWidth > leftVisible && rightVisible > leftVisible) {
      // If the drop down won't fit left-aligned, and there is more space on the
      // right than on the left, then force right-aligned
      horizontalPosition = 'right';
    } else if (dropdownWidth > rightVisible && leftVisible > rightVisible) {
      // If the drop down won't fit right-aligned, and there is more space on
      // the left than on the right, then force left-aligned
      horizontalPosition = 'left';
    } else {
      // Keep same position as previous
      horizontalPosition = previousHorizontalPosition || 'left';
    }
  } else if (horizontalPosition === 'auto-right') {
    // Calculate the number of visible horizontal pixels if we were to place the
    // dropdown on the left and right
    let leftVisible  = Math.min(viewportWidth, triggerLeft + dropdownWidth) - Math.max(0, triggerLeft);
    let rightVisible = Math.min(viewportWidth, triggerLeft + triggerWidth) - Math.max(0, triggerLeft + triggerWidth - dropdownWidth);

    if (dropdownWidth > rightVisible && leftVisible > rightVisible) {
      // If the drop down won't fit right-aligned, and there is more space on the
      // left than on the right, then force left-aligned
      horizontalPosition = 'left';
    } else if (dropdownWidth > leftVisible && rightVisible > leftVisible) {
      // If the drop down won't fit left-aligned, and there is more space on
      // the right than on the left, then force right-aligned
      horizontalPosition = 'right';
    } else {
      // Keep same position as previous
      horizontalPosition = previousHorizontalPosition || 'right';
    }
  }

  if (horizontalPosition === 'right') {
    style.right = viewportWidth - (triggerLeftWithScroll + triggerWidth);
  } else if (horizontalPosition === 'center') {
    style.left = triggerLeftWithScroll + (triggerWidth - dropdownWidth) / 2;
  } else {
    style.left = triggerLeftWithScroll;
  }

  // Calculate vertical position
  let triggerTopWithScroll = triggerTop;

  /**
   * Fixes bug where the dropdown always stays on the same position on the screen when
   * the <body> is relatively positioned
   */
  let isBodyPositionRelative = window.getComputedStyle(document.body).getPropertyValue('position') === 'relative';

  if (!isBodyPositionRelative) {
    triggerTopWithScroll += scroll.top;
  }

  if (verticalPosition === 'above') {
    style.top = triggerTopWithScroll - dropdownHeight;
  } else if (verticalPosition === 'below') {
    style.top = triggerTopWithScroll + triggerHeight;
  } else {
    let viewportBottom  = scroll.top + window.innerHeight;
    let enoughRoomBelow = triggerTopWithScroll + triggerHeight + dropdownHeight < viewportBottom;
    let enoughRoomAbove = triggerTop > dropdownHeight;

    if (previousVerticalPosition === 'below' && !enoughRoomBelow && enoughRoomAbove) {
      verticalPosition = 'above';
    } else if (previousVerticalPosition === 'above' && !enoughRoomAbove && enoughRoomBelow) {
      verticalPosition = 'below';
    } else if (!previousVerticalPosition) {
      // WJW - Library code always opts for above if we can't go either way
      // I used all the lib code and opted for always going below in the event that
      // we can't go above or below.
      // other wise the lib positioning works as it does normally
      if (!enoughRoomAbove && !enoughRoomBelow) {
        verticalPosition = 'below';
      } else {
        verticalPosition = enoughRoomBelow ? 'below' : 'above';
      }
    } else {
      verticalPosition = previousVerticalPosition;
    }

    style.top = triggerTopWithScroll + (verticalPosition === 'below' ? triggerHeight : -dropdownHeight);
  }

  return {
    horizontalPosition,
    verticalPosition,
    style
  };
}

export function calculateInPlacePosition(trigger, content, destination, { horizontalPosition, verticalPosition }) {
  let dropdownRect;
  let positionData = {};

  if (horizontalPosition === 'auto') {
    let triggerRect = trigger.getBoundingClientRect();
    let viewportRight = window.pageXOffset + window.innerWidth;

    dropdownRect = content.getBoundingClientRect();
    positionData.horizontalPosition = triggerRect.left + dropdownRect.width > viewportRight ? 'right' : 'left';
  } else if (horizontalPosition === 'center') {
    let { width: triggerWidth } = trigger.getBoundingClientRect();
    let { width: dropdownWidth } = content.getBoundingClientRect();

    positionData.style = { left: (triggerWidth - dropdownWidth) / 2 };
  } else if (horizontalPosition === 'auto-right') {
    let triggerRect = trigger.getBoundingClientRect();
    let dropdownRect = content.getBoundingClientRect();

    positionData.horizontalPosition = triggerRect.right > dropdownRect.width ? 'right' : 'left';
  } else if (horizontalPosition === 'right') {
    positionData.horizontalPosition = 'right';
  }

  if (verticalPosition === 'above') {
    positionData.verticalPosition = verticalPosition;
    dropdownRect = dropdownRect || content.getBoundingClientRect();
    positionData.style = { top: -dropdownRect.height };
  } else {
    positionData.verticalPosition = 'below';
  }

  return positionData;
}
