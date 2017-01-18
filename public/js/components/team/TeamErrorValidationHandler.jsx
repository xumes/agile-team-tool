var _ = require('underscore');
var React = require('react');
var utils = require('../utils.jsx');

var TeamErrorValidationHandler = React.createClass({
  getInitialState: function() {
    return {
      errors: {},
      formFields: []
    }
  },
  componentWillReceiveProps: function(newProps) {
    this.state.errors = {};
    if (_.has(newProps.formError.error, 'responseJSON') && _.has(newProps.formError.error.responseJSON, 'errors') && _.isEqual(newProps.formError.error.responseJSON.name, 'ValidationError')) {
      this.state.errors = newProps.formError.error.responseJSON.errors
    } else if (_.has(newProps.formError.error, 'responseJSON') && _.has(newProps.formError.error.responseJSON, 'errors')) {
      this.state.errors = newProps.formError.error.responseJSON.errors;
    } else if (_.has(newProps.formError.error, 'responseText')) {
      this.state.errors = JSON.parse(newProps.formError.error.responseText);
    } else if (!_.isEmpty(newProps.formError.error)) {
      this.state.errors = ['An error has occurred while performing the operation.'];
    }
    this.state.formFields = newProps.formError.map
    this.handleErrors();
  },
  handleErrors: function() {
    var errors = this.state.errors;
    var formFields = this.state.formFields;
    console.log(errors,formFields);
    var msg = '';
    var msgList = [];
    var frmList = [];
    // find all db related errors
    _.each(formFields, function(f) {
      if (frmList.indexOf(f.id) == -1)
        utils.clearFieldErrorHighlight(f.id);

      if (!_.isEmpty(errors) && !_.isEmpty(errors[f.field])) {
        utils.setFieldErrorHighlight(f.id);
        if (msgList.indexOf(f.field) == -1) {
          msgList.push(f.field);
          frmList.push(f.id);
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
      alert(msg);
  },
  render: function() {
    return(
      <div/>
    );
  }
});

module.exports = TeamErrorValidationHandler;
