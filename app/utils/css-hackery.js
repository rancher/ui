export function findRule(selector, sheetTitle) {
  var sheet = findSheet(sheetTitle);
  var rules;

  if ( sheet )
  {
    try {
      rules = sheet.cssRules || sheet.rules;
    }
    catch (e) {
      // You can't read external stylesheets...
      return null;
    }

    for ( var j = 0 ; j < rules.length ; j++ )
    {
      if ( (rules[j].selectorText||'').toLowerCase() === selector )
      {
        return rules[j];
      }
    }
  }

  return null;
}

export function findSheet(title) {
  var sheets = document.styleSheets;

  if ( sheets )
  {
    var sheet;
    for ( var i = 0 ; i < sheets.length ; i++ )
    {
      sheet = sheets[i];
      if ( sheet.title === title )
      {
        return sheet;
      }
    }
  }

  return null;
}

export function createSheet(title) {
  var style = document.createElement('style');
  style.setAttribute('title',title);
  style.appendChild(document.createTextNode(''));
  document.head.appendChild(style);
  return style.sheet;
}

export function addRule(sheet, selector, rules, index) {
  if ( sheet.insertRule )
  {
    sheet.insertRule(selector + "{" + rules + "}", index);
  }
  else if ( sheet.addRule )
  {
    sheet.addRule(selector, rules, index);
  }
}

export default {
  findRule: findRule,
  findSheet: findSheet,
  createSheet: createSheet,
  addRule: addRule,
};
