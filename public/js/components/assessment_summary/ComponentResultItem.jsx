var React = require('react');

var ComponentResultItem = React.createClass({

  render: function() {
    var self = this;
    var assessed_cmpnt = self.props.assessed_cmpnt;
    var practiceId = assessed_cmpnt.practiceId;
    var practiceName = assessed_cmpnt.practiceName;
    var currentScore = assessed_cmpnt.currentScore || '-';
    var targetScore = assessed_cmpnt.targetScore || '-';
    var assessorTarget = assessed_cmpnt.assessorTarget;
    var assessed_index = self.props.x;
    var id = self.props.id;
    var hasIndAssessment = self.props.hasIndAssessment;
    var graphId = '';

    if (id == 'resultBody') {
      graphId = 'container';
    } else if (id == 'deliveryResult') {
      graphId = 'deliveryContainer';
    }
    // console.log('ComponentResultItem render assessed_index:', assessed_index);
    // console.log('ComponentResultItem render id:', id);
    // console.log('ComponentResultItem render graphId:', graphId);
    // console.log('ComponentResultItem render practiceName:', practiceName);
    return (
      <tr>
        <td><a role='button' href='javascript:void(0);' onClick={(e) => self.props.displaySelectedChart(e, assessed_index, practiceId, graphId)} >{practiceName}</a></td>
        <td>{currentScore}</td>
        <td>{targetScore}</td>
        {hasIndAssessment && <td>{assessorTarget}</td>}
      </tr>
    );
  }
});
module.exports = ComponentResultItem;
