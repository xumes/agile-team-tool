var React = require('react');

var TeamChildAssociation = React.createClass({


  render: function() {
    var self = this;

    return (
      <div class='ibm-show-hide ibm-widget-processed' id='childAssociationSection'>
        <h2 class='ibm-bold ibm-h4'>
          <a class='' title='Expand/Collapse' onClick={()=>self.props.showHideSection('childAssociationSection')}>
            Team Child Association
          </a>
        </h2>
      </div>
    )
  }



});

module.exports = TeamChildAssociation;
