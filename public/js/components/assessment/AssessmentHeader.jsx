var React = require('react');
var _ = require('underscore');

var Header = React.createClass({
  render: function() {
   var paddingStyle = {
     'padding':'5px'
   };

   if (_.isEmpty(this.props.assessment.assessment) || this.props.assessment.assessment.assessmentStatus == 'Draft') {
      var showStyle = {
        'display': 'none'
      };
    } else {
      showStyle = {
        'display': 'inline'
      };
    }

    return (
      <div>
        <h2 class="ibm-bold ibm-h3">{this.props.title}
        <span style={showStyle}>
            <span style={paddingStyle}>|</span>
              <span id="progressLink"><a href={'/progress?id='+this.props.assessment.teamId+'&assessId='+this.props.assessment.assessment._id}>Assessment Summary</a></span>

        </span>
        </h2>
        <div class="ibm-rule ibm-alternate">
          <hr />
        </div>
      </div>
    )
  }
});

module.exports = Header;
