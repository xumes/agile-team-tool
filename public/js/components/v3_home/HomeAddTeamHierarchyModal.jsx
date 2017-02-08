var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var HomeTeamHierarchyFooter = require('./HomeTeamHierarchyFooter.jsx');
var HomeTeamParentChildSelection = require('./HomeTeamParentChildSelection.jsx');

var HomeAddTeamHierarchyModal = React.createClass({
  getInitialState: function() {
    return {
      selparentList: 'none',
      teamNames: []
    }
  },

  getTeamNames: function() {
    var self = this;
    return api.fetchTeamNames()
      .then(function(teams) {
        self.setState({
          teamNames: teams
        })
      });
  },

  componentDidMount: function() {
    this.getTeamNames();
    this.setState({selparentList: 'none'});
  },

  addTeamHandler: function() {
    var self = this;
  },


  render: function () {
    var self = this;

    var noteStyle = {
       color: '#4178BE'
    };

    var populateTeamNames = this.state.teamNames.map(function(item) {
     console.log('In here populateTeamName: ');
     return (
      <option key={item._id} value={item._id}>{item.name}</option>
     ) ;
    });

    return (
      <div>
        <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={self.props.showModal} onHide={self.props.closeWindow}>
        <div class='new-team-creation-add-block'>

          <div class='new-team-creation-add-block-header'>
            <h>Parent/Child Team Hierarchy</h>
            <span class='close-ico'><InlineSVG onClick={self.props.closeWindow} src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG></span>
          </div>

          <div class='new-team-creation-add-block-content'>
            <div class='new-team-creation-add-block-content-mid'>

              <div class='top-note-parent-child-hierarchy'>Please choose the parent team, if any, "above" your team as well as the childrean beneath.</div>

              <HomeTeamParentChildSelection onchangeParentHierchSel={self.props.onchangeParentHierchSel} populateTeamNames={populateTeamNames}/>


            </div>
          </div>

          <HomeTeamHierarchyFooter updateStep={self.addTeamHandler} />  

        </div>   
        </Modal>
      </div>
    )
  }
});
module.exports = HomeAddTeamHierarchyModal;
