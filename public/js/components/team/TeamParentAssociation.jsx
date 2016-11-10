var React = require('react');

var TeamParentAssociation = React.createClass({


  render: function() {
    var self = this;
    var overallStyle = {
      'display': this.props.visible == false ? 'none': 'block'
    };
    return (
      <div class='ibm-show-hide ibm-widget-processed' id='parentAssociationSection' style={overallStyle}>
        <h2 class='ibm-bold ibm-h4'>
          <a class='' title='Expand/Collapse'onClick={()=>self.props.showHideSection('parentAssociationSection')}>
            Parent Team Association
          </a>
        </h2>
      </div>
    )
  }



});

module.exports = TeamParentAssociation;
