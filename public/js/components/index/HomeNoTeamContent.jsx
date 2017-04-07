var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');

var HomeNoTeamContent = React.createClass({
  render: function() {
    return (
      <div id='noTeamContent'>
        <h1>{'Welcome'}</h1>
        <h2>{'It seems you are not registered with a team.'}</h2>
        <h3>{'Not a problem, you have two choices:'}</h3>
        <div class='second-level-title'>
          <div><span>{'1'}</span></div>
          <h4>{'Join an existing team'}</h4>
        </div>
        <p>{'The most used option... simply click on the "All Teams" tab to the left, search through existing teams and contact the Team Lead or the Iteration Manager to be added.'}</p>
        <div class='second-level-title' style={{'top':'15.4rem'}}>
          <div><span>{'2'}</span></div>
          <h4>{'Create a new team'}</h4>
        </div>
        <p style={{'top':'15.4rem'}}>{'If your team does not already exist, the other option is to select the Create New Team icon ( '}<a style={{'color': 'inherit'}}><img src={'../../../img/Att-icons/att-icons_Add.svg'}></img></a>{' ) to the right of \'All Teams\' and follow the directions.'}</p>
      </div>
    )
  }
});

module.exports = HomeNoTeamContent;
