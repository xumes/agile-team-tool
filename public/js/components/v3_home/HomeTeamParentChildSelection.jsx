var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');

var HomeTeamParentChildSelection = React.createClass({
  componentDidMount: function() {
   },

  render: function() {
    var selparent1Style = {'display': 'block'};

    return (
      <div class="pncteam-midcontent">
        <div class="optbox-1 rpad">

          <div class="pncteam-bg">
            <InlineSVG src={require('../../../img/Att-icons/att-icons_parent+squad.svg')}></InlineSVG>
          </div>
          <div class='team-parent-child-hierarchy-p'>  

             <div class='line1' style={{'width':130}}>
             </div>
             <div class='pointer-arrow-right-parent'>
                <InlineSVG src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
             </div>

             <div class="optsel-parent" style={selparent1Style} >     
               <select name="pc-hier-selparent" id="pc-hier-selparent" class="pc-hier-selparent" onClick={this.props.onchangeParentHierchSel}>
                <option>Select parent team</option>
                 {this.props.populateTeamNames}
                </select>
            </div>


             <div class='line2' style={{'width':130}}>
             </div>
             <div class='pointer-arrow-right-current'>
                <InlineSVG src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
             </div>

             <div class='line3' style={{'width':90}}>
             </div>
             <div class='pointer-arrow-right-child'>
                <InlineSVG src={require('../../../img/Att-icons/play-arrow.svg')}></InlineSVG>
             </div>




          </div>

        </div>

        <div class="clearboth"></div>
      </div>
    );
  }
});

module.exports = HomeTeamParentChildSelection;
