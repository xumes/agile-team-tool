var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');

var HomeTeamParentChildSelection = React.createClass({
  componentDidMount: function() {
    $("#pc-hier-selChild").prop('disabled', true);
    $("#pc-hier-selparent").select2(); 
    $("#pc-hier-selChild").select2(); 
    $("#pc-hier-selparent").change(this.props.onchangeParentHierchSel);
    $("#pc-hier-selChild").change(this.props.onchangeChildHierchSel);
   },

   childDeleteHandler: function(id) {
     console.log('childDeleteHandler',id);
     $('.team-setup-children p#'+id+'').remove();
     $('#pc-hier-selChild option[value="'+id+'"]').removeAttr('disabled');
//     $('#pc-hier-selChild').select2({'dropdownParent':$('#teamTreeSetupBlock')});
   },

   test: function(){
     console.log('I AM HERE');
   },

/*  childSelectHandler: function(e) {
    var self = this;
    var selectedChild = $('#pc-hier-selChild option:selected').val();
    if (!_.isEmpty(selectedChild)) {
      var childTeam = _.find(self.state.selectableChildren, function(team) {
        if (team._id == selectedChild) return team;
      })
      if ($('.team-setup-children p#'+selectedChild).length > 0) {
        //alert(childTeam.name + ' is already listed.');
        return;
      }
      var children = self.state.children;
      console.log('children before: ' + children.length);
      children.push(childTeam);
      children = _.sortBy(children, 'name');
      console.log('children after: ' + children.length);

      self.setState({children:children});
    }
  },
  */

  render: function() {        
    var self = this;
    var selparent1Style = {'display': 'block'};

    var childTeams = null;
    //var children = {};

    var children= [];

    childTeams = children.map(function(item, index) {
      return (
         <p key={index} id={item._id}>
          <h title={item.name}>{item.name}</h>
          <InlineSVG class='list-child-remove-icon' src={require('../../../img/Att-icons/att-icons_remove.svg')} onClick={self.childDeleteHandler.bind(null, item._id)}></InlineSVG> </p>
        )
    });
 
    return (

      <div class='home-modal-block-content'>
         <div class='team-hier-block'>
           <div class='team-setup-icon-hier'>
           <InlineSVG src={require('../../../img/Att-icons/att-icons_parent+squad.svg')}></InlineSVG>
           </div>

          <div class='team-parent-child-hierarchy-p'>  
             <div class='line1' style={{'width':150}}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_arrow-thin-grey.svg')} name="imgSvg"></InlineSVG>
             </div>
            <div class='line2' style={{'width':150}}>
               <InlineSVG src={require('../../../img/Att-icons/att-icons_arrow-thin-grey.svg')}></InlineSVG>
            </div>
             <div class='line3' style={{'width':150}}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_arrow-thin-grey.svg')}></InlineSVG>
             </div>

             <div class="optsel-parent" style={selparent1Style} >     
               <select name="pc-hier-selparent" id="pc-hier-selparent" class="pc-hier-selparent" onChange={this.props.onchangeParentHierchSel}>
                <option key='NA' value='NA'>Select parent team</option>
                <option key='NoParent' value='NoParent'>Top tier / No Parent Above / Not Listed</option>
                 {this.props.populateDefaultParentOption}
                 {this.props.populateParentTeamNames}
                </select>
            </div>

            <div class="curteam-block">Current Team (being made)</div>

             <div class="optsel-child" style={selparent1Style} >     
               <select name="pc-hier-selChild" id="pc-hier-selChild" class="pc-hier-selChild" onClick={this.props.onchangeParentHierchSel}>
                <option value='NA'>Add children team(s)</option>
                <option value='NoChild'>Not Listed</option>
                 {this.props.populateChildrenTeamNames}
                </select>
            </div>                

            <div>
                  <div class='team-hier-children'>
                    {childTeams}
                  </div>   
            </div>

          </div>    
         </div>

        <div class="clearboth"></div>
      </div>
    );
  }
});

module.exports = HomeTeamParentChildSelection;
