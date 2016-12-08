var React = require('react');

var OverallResultItem = React.createClass({

  render: function() {
    var self = this;
    var assessed_cmpnt = self.props.assessed_cmpnt;
    var currentScore = assessed_cmpnt.currentScore.toFixed(1) || '-';
    var targetScore = assessed_cmpnt.targetScore.toFixed(1) || '-';
    var assessorTarget = assessed_cmpnt.assessorTarget;
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
