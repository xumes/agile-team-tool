# Unit Testing
`npm run test`

## Resources
* [Karma](https://karma-runner.github.io/1.0/index.html)
* [Jasmine](https://jasmine.github.io/2.0/introduction.html)
* [Enzyme](http://airbnb.io/enzyme/docs/api/)

*Note* Examples from the `Enzyme` API docs use assertions from the `expect` module. It is a fantastic resource, but we’ll need to rewrite the assertions from the examples using `Jasmine` syntax.

## Folder/File Naming Pattern
* Specs should be added in a new directory `__tests__` within the component or model directory it is associated with.
* Unit tests should be added to a subdirectory, `unit`, and all filenames should end in, `.spec.js`.

```
|-- public
  |-- component | model
    |-- __tests__
      |-- unit
        unit-test.spec.js
```

### Filtering Unit Tests
Jasmine comes with the built-in ability to filter tests.
* `fdescribe` spec blocks that you want to *focus* on when running tests.
* `xdescribe` spec blocks that you want to *exclude* when running tests.
*Note* Don’t forget to revert all `fdescribe` and `xdescribe` block to a normal `describe`block before committing the spec.
