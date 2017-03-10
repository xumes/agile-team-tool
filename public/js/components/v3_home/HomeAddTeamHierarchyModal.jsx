var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var HomeAddTeamFooterButtons = require('./HomeAddTeamFooterButtons.jsx');

var HomeAddTeamHierarchyModal = React.createClass({
  getInitialState: function() {
    return {
      buttonOptions: {
        prevScreen: 'showTeamTypeModal',
        prevDisabled: '',
        nextScreen: 'showTeamMemberModal',
        nextDisabled: 'disabled'
      },

      selparentList: 'none',
      childCount: 0,
      defaultParentObjects: [
        {name: 'Parent of my currently selected team', id: 'parentOfSelected'},
        {name: 'Peer of my currently selected team', id: 'peerOfSelected'}
      ]
    }
  },

  componentWillUpdate: function(nextProps, nextState) {
    var self = this;
    // make sure to get the latest team names on focus of this screen
    console.log('componentWillUpdate');
    if (!self.props.activeWindow && nextProps.activeWindow) {
      this.selectListInit();
    }
  },

  selectListInit: function(){
    var self=this;
    api.getAllRootTeamsSquadNonSquad()
      .then(function(teams) {
        var selectableChildren = _.sortBy(teams, 'name');
        self.props.setSelectableChildren(selectableChildren);
      });
  },

  setButtonOptions: function(buttonOptions) {
    this.setState({ buttonOptions: buttonOptions });
  },

  show: function() {
    var self = this;
 
    $('#optsel-parent select').select2({'dropdownParent':$('#optsel-parent')});
    $('#pc-hier-selparent').change(self.parentSelectHandler);

    if (!_.isEmpty(self.props.selectedParentTeam))
      $('#pc-hier-selparent').val(self.props.selectedParentTeam._id).change();

    $('#optsel-child select').select2({'dropdownParent':$('#optsel-child')});
    $('#pc-hier-selChild').change(self.childSelectHandler);
  },

  parentSelectHandler: function(e){
    var self = this;
    var selectedValue = e.target.value;
    console.log('parentSelectHandler');    
    var teamSelected = _.find(self.props.selectableParents, function(teamSelected) {
      if (_.isEqual(selectedValue,teamSelected._id)) return teamSelected;
    });

    _.each(self.props.selectedChildTeams, function(childTeam) {
        if (_.isEqual(childTeam._id, team._id)) {
          alert(teamSelected.name + ' cannot be both a parent and a child.');
          $('#pc-hier-selparent').val('').change();
          return;
        }
        if (!_.isEmpty(teamSelected.path)) {
          var rootPathId = teamSelected.path.split(',')[1];
          if (_.isEqual(rootPathId, childTeam.pathId)) {
            alert(teamSelected.name + ' cannot be your parent team since it is reporting to '+childTeam.name+', that is already listed as your child team.');
            $('#parentSelectList').val('').change();
            return;
          }
        }
      })

    self.props.setSelectedParentTeam(teamSelected);

    var filteredTeam = [];
    this.selectListInit();
    filteredTeam = _.filter(self.props.selectableChildren, function(team) {  //use master teamName list to refresh teamNames
      return !_.isEqual(team._id, selectedValue);
    });
    self.props.setSelectableChildren(filteredTeam);
    disableField = '';
  },

  childDeleteHandler: function(id) {
    var self = this;
    var children = [];
    children = _.filter(self.props.selectedChildTeams, function(team) {
       return !_.isEqual(id, team._id);
    });
    if (children != undefined)
      this.props.setSelectedChildTeams(children);

  },

  childSelectHandler: function(e) {
    var self = this;         
    console.log('childSelectHandler');
    var selectedValue = e.target.value;
    if (!_.isEmpty(selectedValue)) {
      var buttonOptions = self.state.buttonOptions;
      buttonOptions.nextDisabled = '';
      buttonOptions.nextScreen = 'showTeamMemberModal';
      self.setState({ buttonOptions: buttonOptions });
    }
    
    var selectedParent = $('#pc-hier-selparent option:selected').val();
    var selectedChild = $('#pc-hier-selChild option:selected').val();
    if (selectedChild != 'NA' && selectedChild != 'NoChild' && !_.isEmpty(selectedChild)) {
      var childTeam = _.find(self.props.selectableChildren, function(team) {
        if (team._id == selectedChild) return team;
      })   

      if (_.isEqual(selectedParent, selectedChild)) {
        alert(childTeam.name + ' cannot be both a parent and a child.');
        $('#pc-hier-selChild').val('').change();
        return;
      }

      if (selectedParent != 'NoParent' && selectedParent != 'NA' && !_.isEmpty(selectedParent)) {
        var parentTeam = _.find(self.props.selectableParents, function(team) {
          if (team._id == selectedParent) return team;
        });

      if (parentTeam!=undefined && !_.isEmpty(parentTeam.path)) {
        var rootPathId = parentTeam.path.split(',')[1];
          if (_.isEqual(rootPathId, childTeam.pathId)) {
            alert(childTeam.name + ' cannot be added as a child since your current parent team, '+parentTeam.name+', is reporting to it.');
            $('#pc-hier-selChild').val('').change();
            return;
          }
        }        
      }      
 
      if ($('.team-hier-children p#'+selectedChild).length > 0) {
        alert(childTeam.name + ' is already listed.');
        $('#pc-hier-selChild').val('').change();
        return;
      }

      var children = self.props.selectedChildTeams;
      children.push(childTeam);
      children = _.sortBy(children, 'name');
      self.props.setSelectedChildTeams(children);
    }
  },
  
  render: function () {
    var self = this;
    var noteStyle = {
       color: '#4178BE'
    };

    var selparent1Style = {'display': 'block'};
    var disableField = 'disabled';
    var childTeams = null;
    childTeams = self.props.selectedChildTeams.map(function(item, index) {
      return (
         <p key={index} id={item._id}>
          <h title={item.name}>{item.name}</h>
          <InlineSVG class='list-child-remove-icon' src={require('../../../img/Att-icons/att-icons_delete.svg')} onClick={self.childDeleteHandler.bind(null, item._id)}></InlineSVG> </p>
        )
    });

    var populateChildrenTeamNames = this.props.selectableChildren.map(function(item) {
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
    <div>
      <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={self.props.activeWindow} onShow={self.show}>
        <div class='new-team-creation-add-block' id='pc-hier-SetupBlock'>

          <div class='new-team-creation-add-block-header'>
            <h>Parent/Child Team Hierarchy</h>
            <span class='close-ico'><InlineSVG onClick={self.props.closeWindow} src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG></span>
          </div>

          <div class='new-team-creation-add-block-content'>
            <div class='new-team-creation-add-block-content-mid'>
              <div class='top-note-parent-child-hierarchy'>Please choose the parent team, if any, "above" your team as well as the childrean beneath.</div>

              <div class='home-modal-block-content'>
                <div class='team-hier-block'>
                  <div class='team-setup-icon-hier'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_parent+squad.svg')}></InlineSVG>
                  </div>

                  <div class='team-parent-child-hierarchy-p'>
                    <div class='line1'>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_arrow-thin-grey.svg')} name="imgSvg"></InlineSVG>
                    </div>
                    <div class='line2'>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_arrow-thin-grey.svg')}></InlineSVG>
                    </div>
                    <div class='line3'>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_arrow-thin-grey.svg')}></InlineSVG>
                    </div>

                    <div class="optsel-parent" style={selparent1Style} id="optsel-parent">     
                      <select name="pc-hier-selparent" id="pc-hier-selparent" class="pc-hier-selparent" defaultValue='NA'>
                        <option key='NA' value='NA'>Select parent team </option>
                        <option key='NoParent' value='NoParent'>Top tier / Not Listed</option>
                        {populateParentTeamNames}
                      </select>
                    </div>

                    <div class="curteam-block">Current Team (being made)</div>

                    <div class="optsel-child" style={selparent1Style} id="optsel-child">
                      <select name="pc-hier-selChild" id="pc-hier-selChild" class="pc-hier-selChild" disabled={self.disableField} defaultValue='NA'>
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



          </div>
        </div>   
        <HomeAddTeamFooterButtons buttonOptions={self.state.buttonOptions} openWindow={self.props.openWindow} />
       </div>
      </Modal>
    </div>
    )
  }
});
module.exports = HomeAddTeamHierarchyModal;
