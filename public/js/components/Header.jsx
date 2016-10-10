var React = require('react');

var Header = React.createClass({
  render: function() {
    return (
      <div>
        <h2 class="ibm-bold ibm-h3">{this.props.title}</h2>
        <div class="ibm-rule ibm-alternate-1">
          <hr />
        </div>
      </div>
    )
  }
});

module.exports = Header;