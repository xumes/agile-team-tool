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
    "html-string": "Welcome, <strong>Sign In</strong>."
  }
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

## i18n Class additional properties
### userLang
The user's language is determined when the Class is instantiated and saved to this property.

### languages
A plain object containing all loaded languages.

### fallback
The fallback language object (currently hard-coded for en-us).

### data
The current language object.

## i18n Class additional methods
At the moment, these are simply helper methods for testing and troubleshooting. There is currently no functionality in our application for users to select their language. Language selection is based off of the `navigator.language` setting of the user's browser, for now.

### i18n.fetchAndLoadLanguage(lcCc:String, [forceFetch:Boolean])
This method will fetch the language passed to it ('lc-cc'). Once fetched, `userLang`, `languages`, and `data` properties are automatically updated.
If a language was previously fetched, this method will load the cached version _unless_ passed `true` as the second parameter, and is forced to fetch a new version.
**Returns** [Object] The fetched language JSON object.

### i18n.removeLanguage(lcCc:String)
This method removes the language passed to it from the `languages` property. **NOTE** It will not remove the currently loaded language nor the fallback language.
**Returns** [Object] The removed language.

## Testing and Troubleshooting
You can force a language to load for the application without having to change your browser settings. The automatic language selection can be overridden by using a query string within your URL:
```
http://localhost:3000/?lc=fr&cc=ca
```

You can also review the application for any missed translations by adding the following query string within your URL:
```
http://localhost:3000/?i18n=highlight
```
This will highlight all text on the page that was generated from the i18n engine. Any text that remains un-highlighted will need to be updated to use the engine when applicable.
