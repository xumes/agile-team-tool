var _ = require('underscore');
var React = require('react');

var TeamErrorValidationHandler = React.createClass({
  getInitialState: function() {
    return {
      errors: new Object(),
      formFields: []
    }
  },
  componentWillReceiveProps: function(newProps) {
    this.state.errors = new Object();
    if (_.has(newProps.formError.error, 'responseJSON') && _.has(newProps.formError.error.responseJSON, 'errors') && _.isEqual(newProps.formError.error.responseJSON.name, 'ValidationError')) {
      this.state.errors = newProps.formError.error.responseJSON.errors
    } else if (_.has(newProps.formError.error, 'responseJSON') && _.has(newProps.formError.error.responseJSON, 'error')) {
      this.state.errors = newProps.formError.error.responseJSON;
    } else if (_.has(newProps.formError.error, 'responseText')) {
      this.state.errors = JSON.parse(newProps.formError.error.responseText).errors;
    } else if (!_.isEmpty(newProps.formError.error.responseText)) {
      this.state.errors = JSON.parse(newProps.formError.error.responseText);
    } else if (!_.isEmpty(newProps.formError.error)) {
      this.state.errors = ['An error has occurred while performing the operation.'];
    }
    this.state.formFields = newProps.formError.map
    this.handleErrors();
  },
  handleErrors: function() {
    //console.log('handleErrors', this.state);
    var errors = this.state.errors;
    var formFields = this.state.formFields;
    var msg = '';
    var msgList = [];
    // find all db related errors
    _.each(formFields, function(f) {
      clearFieldErrorHighlight(f.id);
      if (!_.isEmpty(errors) && !_.isEmpty(errors[f.field])) {
        setFieldErrorHighlight(f.id);
        if (msgList.indexOf(f.field) == -1) {
          msgList.push(f.field);
          if (msg != '') msg += '\n';
          msg += errors[f.field].message;
        }
      }
    });
    // all other errors
    _.each(errors, function(err) {
      if (err instanceof String) {
        if (msg != '') msg += '\n';
        msg += err;
      }
    });
    if (msg != '')
      showMessagePopup(msg);
  },
  render: function() {
    return(
      <div/>
    );
  }
});

module.exports = TeamErrorValidationHandler;
