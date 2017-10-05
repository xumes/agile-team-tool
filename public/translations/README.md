# i18n
## Translation JSON files
### Naming convention
All translation JSON files should be saved to the `public/translations` directory with the following naming convention:
```
`${language_code}-${country_code}.json`

//Ex.
// en-us.json
// fr-ca.json
```

### Structure
* The JSON files should have a 1:1 mapping of properties between each other.
* Keys should be in kebab-case.
* Currently, valid values for each property are plain objects for sectioning off paths, strings, and html strings.
```json
{
  "app": {
    "normal-string": "Hello World!",
    "html-string": "Welcome, <strong>Sign In</strong>.",
    . . .
  },
  . . .
}
```

## Translating Your React Component
At the beginning of your component’s file you’ll want to `import` or `require` the i18n Class instance:
```javascript
import i18n from './public/js/i18n/i18n.js';
// OR
const i18n = require('./public/js/i18n/i18n.js').default;
```

Then leverage the `t` and `parseReact` methods to dynamically insert translation JSON content into your component:

```javascript
import React from 'react';
import i18n from './public/js/i18n/i18n.js';

const Welcome = (props) => {
  return (
    <div>
      <img src="./hello-world.jpg" alt={i18n.t('app.normal-string')} />
      {i18n.parseReact('app.html-string')}
    </div>
  );
};

export default Welcome;
```
