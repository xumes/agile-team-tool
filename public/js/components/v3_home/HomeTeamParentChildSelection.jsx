var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');

var HomeTeamParentChildSelection = React.createClass({
  componentDidMount: function() {
    $("select").select2(); 
   },

  render: function() {        
    var self = this;
    var selparent1Style = {'display': 'block'};

    return (
      <div class="pncteam-midcontent">
        <div class="optbox-1 rpad">
        
          <div class="pncteam-bg">
            <InlineSVG src={require('../../../img/Att-icons/att-icons_parent+squad.svg')}></InlineSVG>
          </div>
          <div class='team-parent-child-hierarchy-p'>  

             <div class='line1' style={{'width':150}}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_arrow-thin-grey.svg')}></InlineSVG>
             </div>
    
             <div class="optsel-parent" style={selparent1Style} >     
               <select name="pc-hier-selparent" id="pc-hier-selparent" class="pc-hier-selparent" onChange={self.props.onchangeParentHierchSel} >
                <option key='NA' value='NA'>Select parent team</option>
                <option key='NoParent' value='NoParent'>Top tier / No Parent Above / Not Listed</option>
                 {this.props.populateDefaultParentOption}
                 {this.props.populateTeamNames}
                </select>
            </div>

            <div class='line2' style={{'width':150}}>
               <InlineSVG src={require('../../../img/Att-icons/att-icons_arrow-thin-grey.svg')}></InlineSVG>
            </div>

            <div class="curteam-block">Current Team (being made)</div>

             <div class='line3' style={{'width':143}}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_arrow-thin-grey.svg')}></InlineSVG>
             </div>

             <div class="optsel-child" style={selparent1Style} >     
               <select name="pc-hier-selChild" id="pc-hier-selChild" class="pc-hier-selChild" onClick={this.props.onchangeParentHierchSel}>
                <option value='NA'>Add children team(s)</option>
                <option value='NoChild'>Not Listed</option>
                 {this.props.populateTeamNames}
                </select>
            </div>


          </div>

        </div>

        <div class="clearboth"></div>
      </div>
    );
  }
});

module.exports = HomeTeamParentChildSelection;
