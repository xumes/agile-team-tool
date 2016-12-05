var React = require('react');

var Header = React.createClass({
  render: function() {
   var paddingStyle = {
     'padding':'5px'
   };

   if (this.props.noShowSummary) {
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
              <span id="progressLink"><a href="/progress">Assessment Summary</a></span>

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
