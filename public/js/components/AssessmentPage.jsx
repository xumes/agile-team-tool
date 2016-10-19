var React = require('react');
var Header = require('./Header.jsx');
var AssessmentPageFormOne = require('./AssessmentPageFormOne.jsx');
var AssessmentPageFormTwo = require('./AssessmentPageFormTwo.jsx');
var AssessmentPageLastUpdate = require('./AssessmentPageLastUpdate.jsx');
var AssessmentTemplates = require('./AssessmentTemplates.jsx');
var AssessmentButtons = require('./AssessmentButtons.jsx');

var AssessmentPage = React.createClass({
  render: function() {
    return (<div id="assessmentForm">
                {/* START choose squad team, select or create assessment form */}
                <AssessmentPageFormOne />
                {/* END choose squad team, select or create assessment form */}
                
                {/* START assessment generic buttons */}
                <AssessmentButtons />
                {/* END assessment generic buttons */}
              
                {/* START Project or Operations team Form Two */}
                <AssessmentPageFormTwo />
                {/* END Project or Operations team Form Two */}

                {/* START Assessment Template */}
                <AssessmentTemplates />
                {/* END Assessment Template */}

                {/* START assessment last update */}
                <AssessmentPageLastUpdate />
                {/* END assessment last update */}

                {/* START assessment generic buttons */}
                <AssessmentButtons />
                {/* END assessment generic buttons */}
              </div>)
  }
});

module.exports = AssessmentPage;
