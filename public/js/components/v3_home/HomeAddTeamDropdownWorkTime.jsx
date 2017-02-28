var React = require('react');
var Select = require('react-select');
var InlineSVG = require('svg-inline-react');

var HomeAddTeamDropdownWorkTime = React.createClass({
  getInitialState: function() {
    return {
      showOther: false
    }
  },

  workTimeHandler: function(data) {
    // this.props.workTimeHandler(this.refs, data);
    if (data.value && (data.value.toLowerCase() === 'other...')) {
      var uid = this.refs.selrole.props['data-uid'];
      $('#wrapper-role-'+uid + ' .Select-value').html('Other...');
      $('.Select-placeholder').html('Other...');
      $('.Select-placeholder').addClass('otherTxt');
      this.setState({showOther: true});
    } else {
      this.setState({showOther: false});
      this.props.workTimeHandler(this.refs, data);
    }
  },

  saveWorkTime: function() {

  },

  cancelWorkTime: function() {
    
  },

  render: function() {
    var self = this;
    var memberUserId = self.props.memberUserId;
    var memberWorkTime = self.props.memberWorkTime || 'Full Time';
    var selavgworkweek = [];
    var avgworkweekArray = ['Full Time', 'Half Time', 'Other'];
    avgworkweekArray.map(function(v) {
      selavgworkweek.push({value: v, label: v});
    });

    var isOtherStyle = (self.state.showOther) ? {'display': 'block'} : {'display': 'none'};
    return(
      <div key={memberUserId} id={'wrapper-worktime-'+memberUserId}>
        <Select
          name='select-avgworkweek'
          ref='selavgworkweek'
          data-uid={memberUserId}
          value={memberWorkTime}
          options={selavgworkweek}
          clearable={false}
          onChange={self.workTimeHandler} />
        <div class='custom-field-worktime' style={isOtherStyle}>
          <input id='input-field' type='text' ref='other' name='other' size='10' class='input-field' />
          <div class='save-btn' onClick={self.saveWorkTime.bind(null, memberUserId)}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
          </div>
          <div class='cancel-btn' style={{'left':'0.2em'}} onClick={self.cancelWorkTime.bind(null, memberUserId)}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
          </div>
        </div>      
      </div>

    );
  }
});

module.exports = HomeAddTeamDropdownWorkTime;
