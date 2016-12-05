var React = require('react');

var OverallResultItem = React.createClass({

  render: function() {
    var self = this;
    // var assessed_cmpnt = self.props.assessed_cmpnt;
    // var practiceId = assessed_cmpnt.practiceId;
    // var practiceName = assessed_cmpnt.practiceName;
    var currentScore = self.props.currentScore.toFixed(1) || '-';
    var targetScore = self.props.targetScore.toFixed(1) || '-';
    var assessorTarget = self.props.assessorTarget;
    var assessed_index = self.props.x;
    var id = self.props.id;
    var hasIndAssessment = self.props.hasIndAssessment;
    var graphId = '';
    var label = 'Overall';
    if (id == 'resultBody') {
      graphId = 'container';
    } else if (id == 'deliveryResult') {
      graphId = 'deliveryContainer';
    }
    var ctr = self.props.counter;
    // console.log('OverallResultItem render ctr:', ctr);
    // console.log('OverallResultItem render assessed_index:', assessed_index);
    // console.log('OverallResultItem render id:', id);
    // console.log('OverallResultItem render graphId:', graphId);
    // console.log('OverallResultItem render label:', label);
    return (
      <tr>
        <td><a role='button' href='javascript:void(0);' onClick={(e) => self.props.displaySelectedChart(e, assessed_index, label, graphId)}>{label}</a></td>
        <td>{currentScore}</td>
        <td>{targetScore}</td>
        {hasIndAssessment && <td>{assessorTarget}</td>}
      </tr>
    );
  }
});
module.exports = OverallResultItem;
