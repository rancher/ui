# Internationalization #

Every piece of localizable text is put into the translation files here.

 - Files must be named matching a locale in the list at https://github.com/andyearnshaw/Intl.js/tree/master/locale-data/jsonp (with a `.yaml` extension).`
 - The code refers to the appropriate key and it is looked up for the current language to get the string to be displayed.
 - If the key does not exist in the current language, the English value is used as a fallback.
 - If there is no English value either, the un-translated key is shown

Pluralization

Variables can be pluralized with the syntax:

```
You have {numPhotos, plural,
  =0 {no photos.}
  =1 {one photo.}
  other {# photos.}}
```

# Docs #

See [ember-intl wiki](https://github.com/jasonmit/ember-intl/wiki) for more info about supported features in translations, and [ICU](http://userguide.icu-project.org/formatparse/messages) for more info about pluralization.

# Testing #

 - You can press shift+L to toggle between the current language and a special `none` language which will show the translation keys for every string.
 - When starting up the ember server, a warning will be printed for each key that is in `en-us` but missing from another language.
