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
      defaultParentObjects: [
        {name: 'Parent of my currently selected team', id: 'parentOfSelected'},
        {name: 'Peer of my currently selected team', id: 'peerOfSelected'}
      ]
    }
  },

  componentDidMount: function() {
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

   var populateDefaultParentOption = this.state.defaultParentObjects.map(function(item) {
     console.log ('IN Populate default Parent Option');
     return ( 
      <option key={item._id} value={item._id}>{item.name}</option>
     ) ;
    });

    var populateParentTeamNames = this.props.selectableParents.map(function(item) {
     return ( 
      <option key={item._id} value={item._id}>{item.name}</option>
     ) ;
    });

    var populateChildrenTeamNames = this.props.teamNames.map(function(item) {
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
              <HomeTeamParentChildSelection onchangeParentHierchSel={self.props.onchangeParentHierchSel} onchangeChildHierchSel={self.props.onchangeChildHierchSel} populateParentTeamNames={populateParentTeamNames} populateChildrenTeamNames={populateChildrenTeamNames} populateDefaultParentOption={populateDefaultParentOption}/>
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
