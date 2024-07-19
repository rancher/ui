## Module Report
### Unknown Global

**Global**: `Ember.Handlebars`

**Location**: `lib/shared/addon/helpers/linkify.js` at line 15

```js
  }

  content = Ember.Handlebars.Utils.escapeExpression(content);

  content = linkifyStr(content, {
```

### Unknown Global

**Global**: `Ember.Handlebars`

**Location**: `lib/shared/addon/helpers/nl-to-br.js` at line 6

```js

export function nlToBr(params) {
  var val = Ember.Handlebars.Utils.escapeExpression(params[0] || '');

  return new htmlSafe(val.replace(/\n/g, '<br/>\n'));
```

### Unknown Global

**Global**: `Ember.beginPropertyChanges`

**Location**: `lib/shared/addon/mixins/subscribe.js` at line 111

```js
    let projectId, type, forceRemove;

    Ember.beginPropertyChanges();
    while ( event ) {
      if ( !event.data ) {
```

### Unknown Global

**Global**: `Ember.endPropertyChanges`

**Location**: `lib/shared/addon/mixins/subscribe.js` at line 143

```js
      event = queue.dequeue();
    }
    Ember.endPropertyChanges();
    // console.log(`Processed ${count} ${this.label} change events`);

```
