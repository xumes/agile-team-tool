var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var HomeAddTeamFooterButtons = require('./HomeAddTeamFooterButtons.jsx');
var HomeTeamParentChildSelection = require('./HomeTeamParentChildSelection.jsx');

var HomeAddTeamHierarchyModal = React.createClass({
  getInitialState: function() {
    return {
      buttonOptions: {
        prevScreen: 'showTeamTypeModal',
        prevDisabled: '',
        nextScreen: 'showTeamMemberModal',
        nextDisabled: 'disabled'
      },
      selparentList: 'none'
    }
  },

  componentDidMount: function() {
    this.setState({selparentList: 'none'});
  },

  setButtonOptions: function(buttonOptions) {
    this.setState({ buttonOptions: buttonOptions });
  },

  render: function () {
    var self = this;
    var noteStyle = {
       color: '#4178BE'
    };

  return (
      <div>
        <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={self.props.activeWindow} onShow={self.show}>
        <div class='new-team-creation-add-block'>

          <div class='new-team-creation-add-block-header'>
            <h>Parent/Child Team Hierarchy</h>
            <span class='close-ico'><InlineSVG onClick={self.props.closeWindow} src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG></span>
          </div>

          <div class='new-team-creation-add-block-content'>
            <div class='new-team-creation-add-block-content-mid'>
              <div class='top-note-parent-child-hierarchy'>Please choose the parent team, if any, "above" your team as well as the childrean beneath.</div>
                <HomeTeamParentChildSelection  setSelectableParents={self.props.setSelectableParents} selectableParents={self.props.selectableParents} selectedParentTeam={self.props.selectedParentTeam} setSelectedParentTeam={self.props.setSelectedParentTeam} 
                selectableChildren={self.props.selectableChildren} buttonOptions={self.state.buttonOptions} setButtonOptions={self.setButtonOptions}
                />
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
