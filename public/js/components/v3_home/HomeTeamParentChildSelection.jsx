var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');

var HomeTeamParentChildSelection = React.createClass({
  getInitialState: function() {
    return {
      children: [],
      childCount: 0,
      defaultParentObjects: [
        {name: 'Parent of my currently selected team', id: 'parentOfSelected'},
        {name: 'Peer of my currently selected team', id: 'peerOfSelected'}
      ],
      teamNames: []
    }
  },

  componentDidMount: function() {
    $("#pc-hier-selChild").prop('disabled', false);  
  //$("#pc-hier-selparent").select2(); 
  //$("#pc-hier-selChild").select2(); 
    //$("#pc-hier-selparent").change(this.props.onchangeParentHierchSel);
    // $("#pc-hier-selChild").change(this.props.onchangeChildHierchSel);
    $('#pc-hier-selparent').select2({'dropdownParent':$('#pc-hier-selparent')});
    $("#pc-hier-selparent").change(this.parentSelectHandler);
    if (!_.isEmpty(self.props.selectedParentTeam))
      $('#pc-hier-selparent').val(self.props.selectedParentTeam._id).change();
    else
      $('#pc-hier-selparent').val('').change();
  //  $("#pc-hier-selChild").change(this.childSelectHandler);

    var buttonOptions = this.props.buttonOptions;
    buttonOptions.prevDisabled = '';
    buttonOptions.prevScreen = 'showTeamTypeModal';
    buttonOptions.nextDisabled = '';
    buttonOptions.nextScreen = 'showTeamMemberModal';
    this.props.setButtonOptions(buttonOptions);

    this.selectListInit();
  },

  componentWillUpdate: function(nextProps, nextState) {
    var self = this;
    // make sure to get the latest team names on focus of this screen
    if (!self.props.activeWindow && nextProps.activeWindow) {
      api.getNonSquadTeams()
        .then(function(teams) {
          var selectableParents = _.sortBy(teams, 'name');
          self.props.setSelectableParents(selectableParents);
        });      
    }
  },

  show: function() {
    var self = this;
    console.log('show',self.props.selectedParentTeam);
    //$('#pc-hier-selparent').select2({'dropdownParent':$('#pc-hier-selparent')});
    //$('#pc-hier-selparent').change(self.parentSelectHandler);
    //if (!_.isEmpty(self.props.selectedParentTeam))
    //  $('#pc-hier-selparent').val(self.props.selectedParentTeam._id).change();
    //else
    //  $('#pc-hier-selparent').val('').change();
//    $("#teamTypeBlock span[data-widget=tooltip]").tooltip();
  },

  parentSelectHandler: function(e){
    var self = this;
    var selectedValue = e.target.value;
    
    var team = _.find(self.props.selectableParents, function(team) {
      if (_.isEqual(selectedValue,team._id)) return team;
    });
    self.props.setSelectedParentTeam(team);

    var filteredTeam = [];
    filteredTeam = _.filter(this.state.teamNames, function(team) {
      return !_.isEqual(team._id, selectedValue);
    });
    self.setState({teamNames: filteredTeam});
  },

  childDeleteHandler: function(id) {
    var self = this;
    console.log('childDeleteHandler',id);    
    var children = self.state.children;
    children = _.filter(children, function(team) {
       return !_.isEqual(id, team._id);
    });
    self.setState({children:children});
//    this.props.onchangeChildTeamList(this.state.children);
  },

  childSelectHandler: function(e) {
    var self = this;         
    console.log('childSelectHandler');
    var selectedValue = e.target.value;
    /*if (!_.isEmpty(selectedValue)) {
      var buttonOptions = self.props.buttonOptions;
      buttonOptions.nextDisabled = '';
      buttonOptions.nextScreen = 'showTeamMemberModal';
      self.props.setButtonOptions(buttonOptions);
    }
    */

    $('#btn-teamaddparentchildhier').prop('disabled', false);

    var selectedChild = $('#pc-hier-selChild option:selected').val();
    if (!_.isEmpty(selectedChild)) {
      var childTeam = _.find(self.state.teamNames, function(team) {
        if (team._id == selectedChild) return team;
      })
      if ($('.team-hier-children p#'+selectedChild).length > 0) {
        //alert(childTeam.name + ' is already listed.');
        return;
      }
      var children = self.state.children;
      children.push(childTeam);
      children = _.sortBy(children, 'name');

      self.setState({children:children});
//      this.props.onchangeChildTeamList(this.state.children);
    }
  },

  selectListInit: function() {
    var self = this;
    //self.setState({teamNames: this.props.teamNames});
    console.log('In selectListIntit: '+   this.state.teamNames.length);
    api.fetchTeamNames()
      .then(function(teams) {
        var selectableChildren = _.sortBy(teams, 'name');
          console.log('In HomeTeamParentChildSelection: before selectableChildren:'+selectableChildren.length);
          self.setState({teamNames: selectableChildren});
          });

  },


  render: function() {        
    var self = this;
    var selparent1Style = {'display': 'block'};

    var childTeams = null;

    childTeams = this.state.children.map(function(item, index) {
      return (
         <p key={index} id={item._id}>
          <h title={item.name}>{item.name}</h>
          <InlineSVG class='list-child-remove-icon' src={require('../../../img/Att-icons/att-icons_remove.svg')} onClick={self.childDeleteHandler.bind(null, item._id)}></InlineSVG> </p>
        )
    });

    var populateChildrenTeamNames = null;
    populateChildrenTeamNames = this.state.teamNames.map(function(item) {
     return (
       <option key={item._id} value={item._id}>{item.name}</option>
      );
    });

   var populateParentTeamNames = this.props.selectableParents.map(function(item) {
     return ( 
      <option key={item._id} value={item._id}>{item.name}</option>
     ) ;
   });

   var populateDefaultParentOption = this.state.defaultParentObjects.map(function(item) {
     return ( 
      <option key={item._id} value={item._id}>{item.name}</option>
     ) ;
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
               <select name="pc-hier-selparent" id="pc-hier-selparent" class="pc-hier-selparent">
                <option key='NA' value='NA'>Select parent team</option>
                <option key='NoParent' value='NoParent'>Top tier / No Parent Above / Not Listed</option>
                 {populateParentTeamNames}
                </select>
            </div>

            <div class="curteam-block">Current Team (being made)</div>

             <div class="optsel-child" style={selparent1Style} >     
               <select name="pc-hier-selChild" id="pc-hier-selChild" class="pc-hier-selChild">
                <option value='NA'>Add children team(s)</option>
                <option value='NoChild'>Not Listed</option>
                 {populateChildrenTeamNames}
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
