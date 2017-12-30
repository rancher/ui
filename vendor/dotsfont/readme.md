DotsFont: A font made of only dots
===
This font is to enable a work-around for `-webkit-text-security` property.

![Preview](./dotsfont.png)

Usage
---

Download the font

```css
@font-face {
  font-family: 'dotsfont';
  src: url('dotsfont.eot');
  src: url('dotsfont.eot?#iefix') format('embedded-opentype'),
       url('dotsfont.woff') format('woff'),
       url('dotsfont.ttf') format('truetype'),
       url('dotsfont.svg#dotsfontregular') format('svg');
}

[conceal]:not(:active):not(:focus) {
  font-family: 'dotsfont';
}
```

```html
<span conceal>hide me</span>
```

License
---

Copyright (c) 2016, Kyle Welsby (kyle@mekyle.com)

This Font Software is licensed under the SIL Open Font License, Version 1.1. This license is included in this repository (OFL.txt), and is also available with a FAQ at: http://scripts.sil.org/OFL