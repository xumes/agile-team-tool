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
    console.log('workTimeHandler data,', data);
    if (data.value && (data.value === -1)) {
      var uid = this.refs.selavgworkweek.props['data-uid'];
      $('#wrapper-worktime-'+uid + ' .Select-value').html('Other...');
      $('.Select-placeholder').html('Other...');
      $('.Select-placeholder').addClass('otherTxt');
      this.setState({showOther: true});
    } else {
      this.setState({showOther: false});
      this.props.workTimeHandler(this.refs, data);
    }
  },

  saveWorkTime: function(uid) {
    console.log('saveWorkTime..', uid);
    var other = parseInt($('#wrapper-worktime-'+uid + ' > .role-worktime > #input-field').val().trim());
    if (!other) {
      alert('Work time cannot be empty.');
    } else {
      var obj = {'value': other, 'label': other};
      this.props.workTimeHandler(this.refs, obj);
    }
  },

  cancelWorkTime: function(uid, prevdata) {
    var self = this;
    console.log('cancelWorkTime ', prevdata)
    _.map(self.props.defaultWorkTime, function(k, v){
      if(prevdata === k){
        prevdata = v;
      }
    });

    if (_.isUndefined(prevdata)){
      $('#wrapper-worktime-'+uid + ' .Select-control .Select-value').html('Select...');
      $('#wrapper-worktime-'+uid + ' .Select-control .Select-placeholder').html('Select...');
    } else {
      $('#wrapper-worktime-'+uid + ' .Select-control .Select-value').html(prevdata);
      $('#wrapper-worktime-'+uid + ' .Select-control .Select-placeholder').html(prevdata);
    }
    this.setState({showOther: false});
  },

  render: function() {
    var self = this;
    var memberUserId = self.props.memberUserId;
    var memberWorkTime = self.props.memberWorkTime || 100;
    var selavgworkweek = [];
    _.map(self.props.defaultWorkTime, function(k, v){
      selavgworkweek.push({value: k, label: v});
    });

    var isOtherStyle = (self.state.showOther) ? {'display': 'block'} : {'display': 'none'};
    console.log('HomeAddTeamDropdownWorkTime defaultWorkTime..', self.props.defaultWorkTime);
    console.log('HomeAddTeamDropdownWorkTime memberWorkTime..', memberWorkTime);
    console.log('HomeAddTeamDropdownWorkTime selavgworkweek..', selavgworkweek);
    console.log('HomeAddTeamDropdownWorkTime isOtherStyle..', isOtherStyle);
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
        <div class='custom-field-other role-worktime' style={isOtherStyle}>
          <input id='input-field' type='text' ref='other' name='other' size='5' class='input-field wt' maxLength='3' /><h1>%</h1>
          <div class='r_save-btn' onClick={self.saveWorkTime.bind(null, memberUserId)}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
          </div>
          <div class='r_cancel-btn' onClick={self.cancelWorkTime.bind(null, memberUserId, memberWorkTime)}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
          </div>
        </div>      
      </div>

    );
  }
});

module.exports = HomeAddTeamDropdownWorkTime;
