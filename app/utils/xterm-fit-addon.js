export function proposeGeometry(term) {
  if (!term.element.parentElement) {
    return null;
  }
  var parentElementStyle = window.getComputedStyle(term.element.parentElement),
    parentElementHeight = parseInt(parentElementStyle.getPropertyValue('height')),
    parentElementWidth = Math.max(0, parseInt(parentElementStyle.getPropertyValue('width')) - 17),
    elementStyle = window.getComputedStyle(term.element),
    elementPaddingVer = parseInt(elementStyle.getPropertyValue('padding-top')) + parseInt(elementStyle.getPropertyValue('padding-bottom')),
    elementPaddingHor = parseInt(elementStyle.getPropertyValue('padding-right')) + parseInt(elementStyle.getPropertyValue('padding-left')),
    availableHeight = parentElementHeight - elementPaddingVer,
    availableWidth = parentElementWidth - elementPaddingHor,
    subjectRow = term.rowContainer.firstElementChild,
    contentBuffer = subjectRow.innerHTML,
    characterHeight,
    rows,
    characterWidth,
    cols,
    geometry;

  subjectRow.style.display = 'inline';
  subjectRow.innerHTML = 'W'; // Common character for measuring width, although on monospace
  characterWidth = subjectRow.getBoundingClientRect().width;
  subjectRow.style.display = ''; // Revert style before calculating height, since they differ.
  characterHeight = parseInt(subjectRow.offsetHeight);
  subjectRow.innerHTML = contentBuffer;

  rows = Math.floor(availableHeight / characterHeight);
  cols = Math.floor(availableWidth / characterWidth);

  geometry = { cols: cols, rows: rows };
  return geometry;
}
