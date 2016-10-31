var React = require('react');

var TeamAssessment = React.createClass({
  render: function() {
    var overallStyle = {
      'display': this.props.visible == false ? 'none': 'block'
    };

    if (this.props.selectedTeam.team == undefined) {
      return null;
    } else {
      if (this.props.selectedTeam.type != 'squad') {
        return (
          <div class='ibm-container-body' id='assessmentPageSection'>
            <h2 class='ibm-bold ibm-h4'>Assessment information</h2>
            <div id='nonSquadAssessmentPageSection' style={{'display': 'block'}}>
              <p>Non squad team does not manage assessment information.</p>
            </div>
          </div>
        )
      } else {
        return (
          <div class='ibm-container-body' id='assessmentPageSection'>
            <h2 class='ibm-bold ibm-h4'>Assessment information</h2>
              <div style={{'float':'left', 'fontSize':'14px', 'width':'100%'}} class='tcaption'>
                <em id='assessmentTitle' class='ibm-bold'>Assessment Information</em>
                <p style={{'float': 'right'}} class='ibm-button-link'>
                  <input type='button' class='ibm-btn-pri ibm-btn-small' id='assessBtn' value='Create assessment' onclick='manageAssessment();' disabled='disabled'/>
                </p>
              </div>
              <div id='squadAssessmentPageSection' style={{'display': 'block', 'marginTop': '15px'}}>
                <table class='ibm-data-table' id='assessmentTable' summary='List of assessment information' style={{'fontSize': '90%'}}>
                  <thead>
                    <tr>
                      <th scope='col' width='1%'></th>
                      <th scope='col' width='30%'>Assessment/Creation Date</th>
                      <th scope='col' width='35%'>Status</th>
                      <th scope='col' width='35%'>Last Update User</th>
                    </tr>
                  </thead>
                  <tbody id='assessmentList'>
                  </tbody>
                </table>
                <div id='moreAssessments' style={{'display': 'block'}}>
                  <p>
                    <label> <a class='ibm-arrow-forward-bold-link'>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; More..</a> </label>
                  </p>
                </div>
                <div id='lessAssessments' style={{'display': 'block'}}>
                  <p>
                    <label> <a class='ibm-arrow-forward-bold-link'>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Less..</a> </label>
                  </p>
                </div>
              </div>
          </div>
        )
      }
    }
  }



});

module.exports = TeamAssessment;
