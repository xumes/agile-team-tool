var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var ReactDOM = require('react-dom');
var HomeAddMember = require('./HomeAddMember.jsx');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;


var HomeMemberTable = React.createClass({
  getInitialState: function() {
    return { showModal: false };
  },
  componentDidMount: function() {
    this.initialAll();
    $('.team-member-table-content-role > div > div > select').change(this.changeRoleHandler);
    // $('.team-member-table-content-allocation > div > select').change(this.changeMemberHandler);
    $('.team-member-table-content-awk > div > div > select').change(this.changeAwkHandler);
  },
  componentDidUpdate: function() {
    $('.team-member-table-content-role > div > div > select').off('change');
    $('.team-member-table-content-awk > div > div > select').off('change');
    this.initialAll();
    $('.team-member-table-content-role > div > div > select').change(this.changeRoleHandler);
    $('.team-member-table-content-awk > div > div > select').change(this.changeAwkHandler);
  },

  componentWillMount: function() {
    document.addEventListener('click', this.handleClick, false);
  },

  componentWillUnmount: function() {
    document.removeEventListener('click', this.handleClick, false);
  },

  handleClick: function(e){
    var self = this;
    if(!ReactDOM.findDOMNode(this).contains(e.target) || e.target.id == 'teamMemberTableTitle' || e.target.id == 'teamMemberTableFooter') {
      _.each(self.props.loadDetailTeam.team.members, function(member, index){
        if ($('#role_' + index + ' .save-btn').css('display') == 'block') {
          if ($('#role_' + index + ' input').attr('placeholder') != $('#role_' + index + ' input').val()) {
            self.saveRole('role_' + index);
          } else {
            self.cancelChange('role_' + index);
          }
        } else if ($('#location_' + index + ' .save-btn').css('display') == 'block') {
          if ($('#location_' + index + ' input').attr('placeholder') != $('#location_' + index + ' input').val()) {
            self.saveRole('location_' + index);
          } else {
            self.cancelChange('location_' + index);
          }
        } else if ($('#allocation' + index + ' .save-btn').css('display') == 'block') {
          if ($('#allocation' + index + ' input').attr('placeholder') != $('#allocation' + index + ' input').val()) {
            self.saveRole('allocation' + index);
          } else {
            self.cancelChange('allocation' + index);
          }
        } else {
          if ($('#awk' + index + ' input').attr('placeholder') != $('#awk' + index + ' input').val()) {
            self.saveRole('awk' + index);
          } else {
            self.cancelChange('awk' + index);
          }
        }
      });
      $('.save-btn').hide();
      $('.cancel-btn').hide();
      $('.team-member-table-content-role > h').css('display','block');
      $('.team-member-table-content-role > h').removeClass('team-member-table-content-block-hide');
      $('.team-member-table-content-role > .modify-field').css('display','none');
      $('.team-member-table-content-role > .modify-field').removeClass('team-member-table-content-block-show');

      $('.team-member-table-content-location > h').css('display','block');
      $('.team-member-table-content-location > h').removeClass('team-member-table-content-block-hide');
      // $('.team-member-table-content-location input').val('');
      $('.team-member-table-content-location > .modify-field').css('display','none');
      $('.team-member-table-content-location > .modify-field').removeClass('team-member-table-content-block-show');

      $('.team-member-table-content-allocation > h').css('display','block');
      $('.team-member-table-content-allocation > h').removeClass('team-member-table-content-block-hide');
      // $('.team-member-table-content-allocation input').val('');
      $('.team-member-table-content-allocation > .modify-field').css('display','none');
      $('.team-member-table-content-allocation > .modify-field').removeClass('team-member-table-content-block-show');

      $('.team-member-table-content-awk > h').css('display','block');
      $('.team-member-table-content-awk > h').removeClass('team-member-table-content-block-hide');
      $('.team-member-table-content-awk > .modify-field').css('display','none');
      $('.team-member-table-content-awk > .modify-field').removeClass('team-member-table-content-block-show');
    }
  },

  initialAll: function() {
    var self = this;
    $('.team-member-table-content-role > div > div > select').select2({'width':'100%'});
    // $('.team-member-table-content-allocation > div > select').select2({'width':'100%'});
    $('.team-member-table-content-awk > div > div > select').select2({'width':'99%'});
    self.hoverBlock('team-member-table-content-role');
    self.hoverBlock('team-member-table-content-location');
    self.hoverBlock('team-member-table-content-allocation');
    self.hoverBlock('team-member-table-content-awk');
    self.hoverMainBlock('team-member-table-content-block1');
    self.hoverMainBlock('team-member-table-content-block2');
    self.onClickBlock('team-member-table-content-role');
    self.onClickBlock('team-member-table-content-location');
    self.onClickBlock('team-member-table-content-allocation');
    self.onClickBlock('team-member-table-content-awk');
    _.each(self.props.loadDetailTeam.team.members, function(member, index){
      if(self.props.roles.indexOf(member.role) >= 0) {
        $('#role_select_' + index).val(member.role).change();
        $('#role_' + index + ' .input-field > input').val('');
        $('#role_' + index + ' .input-field').hide();
      } else {
        $('#role_select_' + index).val('Other...').change();
        $('#role_' + index + ' .input-field > input').val(member.role);
        $('#role_' + index + ' .input-field').show();
      }
      if (member.workTime == 100 || member.workTime == 50) {
        $('#awk_select_' + index).val(member.workTime).change();
        $('#awk_' + index + ' .input-field > input').val('');
        $('#awk_' + index + ' .input-field').hide();
      } else {
        $('#awk_select_' + index).val('other').change();
        $('#awk_' + index + ' .input-field > input').val(member.workTime);
        $('#awk_' + index + ' .input-field').show();
      }
    });
  },

  onClickBlock: function(block) {
    $('.' + block + ' > h').css('display','');
    $('.' + block + ' > div').css('display','none');
    $('.' + block).off('click');
    if (this.props.loadDetailTeam.access) {
      $('.' + block).click(function(){
        $('.save-btn').hide();
        $('.cancel-btn').hide();
        $('.team-member-table-content-role > h').css('display','block');
        $('.team-member-table-content-role > h').removeClass('team-member-table-content-block-hide');
        $('.team-member-table-content-role > .modify-field').css('display','none');
        $('.team-member-table-content-role > .modify-field').removeClass('team-member-table-content-block-show');
        $('.team-member-table-content-location > h').css('display','block');
        $('.team-member-table-content-location > h').removeClass('team-member-table-content-block-hide');
        // $('.team-member-table-content-location input').val('');
        $('.team-member-table-content-location > .modify-field').css('display','none');
        $('.team-member-table-content-location > .modify-field').removeClass('team-member-table-content-block-show');
        $('.team-member-table-content-allocation > h').css('display','block');
        $('.team-member-table-content-allocation > h').removeClass('team-member-table-content-block-hide');
        // $('.team-member-table-content-allocation input').val('');
        $('.team-member-table-content-allocation > .modify-field').css('display','none');
        $('.team-member-table-content-allocation > .modify-field').removeClass('team-member-table-content-block-show');
        $('.team-member-table-content-awk > h').css('display','block');
        $('.team-member-table-content-awk > h').removeClass('team-member-table-content-block-hide');
        $('.team-member-table-content-awk > .modify-field').css('display','none');
        $('.team-member-table-content-awk > .modify-field').removeClass('team-member-table-content-block-show');
        // $(this).find('h').css('display', 'none');
        // $(this).find('.modify-field').css('display', 'block');
        $(this).find('h').addClass('team-member-table-content-block-hide');
        $(this).find('.modify-field').addClass('team-member-table-content-block-show');
        $(this).find('.save-btn').show();
        $(this).find('.cancel-btn').show();
        var uid = $(this).find('input')[0].id;
        setTimeout(function(){
          $('#'+uid).focus();
        },0);
        var blockId = $('#'+$(this)[0].id).parents()[0].id;
        $('#' + blockId + ' > .team-member-table-content-awk > span').css('display', 'none');
      });
    }
  },

  hoverBlock: function(block) {
    $('.' + block).unbind('mouseenter mouseleave');
    if (this.props.loadDetailTeam.access) {
      $('.' + block).hover(function(){
        // $(this).css('border','0.1em solid');
        // $(this).css('background-color','#FFFFFF');
        // $(this).css('padding-top','0.2em');
        // $(this).css('cursor','pointer');
        var blockId = $(this)[0].id;
        $('#' + blockId + ' > h').css('display', 'none');
        $('#' + blockId + ' > .modify-field').css('display','block');
      }, function(){
        // $(this).css('border','');
        // $(this).css('background-color','');
        // $(this).css('padding-top','0');
        // $(this).css('cursor','default');
        var blockId = $(this)[0].id;
        $('#' + blockId + ' > h').css('display', 'block');
        $('#' + blockId + ' > .modify-field').css('display','none');
      });
    }
  },

  hoverMainBlock: function(block) {
    $('.' + block).unbind('mouseenter mouseleave');
    if (this.props.loadDetailTeam.access) {
      $('.' + block).hover(function(){
        var blockId = $(this)[0].id;
        var roleB = $('#' + blockId + ' > .team-member-table-content-role > h').hasClass('team-member-table-content-block-hide');
        var locationB = $('#' + blockId + ' > .team-member-table-content-location > h').hasClass('team-member-table-content-block-hide');
        var allocationB = $('#' + blockId + ' > .team-member-table-content-allocation > h').hasClass('team-member-table-content-block-hide');
        var awkB = $('#' + blockId + ' > .team-member-table-content-awk > h').hasClass('team-member-table-content-block-hide');
        if (roleB || locationB || allocationB || awkB) {
          $('#' + blockId + ' > .team-member-table-content-awk > span').css('display', 'none');
        } else {
          $('#' + blockId + ' > .team-member-table-content-awk > span').css('display', 'block');
        }
      }, function(){
        var blockId = $(this)[0].id;
        $('#' + blockId + ' > .team-member-table-content-awk > span').css('display', 'none');
      });
    }
  },

  delTeamMemberHandler: function(idx) {
    var self = this;
    var blockId = 'name_' + idx;
    var memberEmail = $('#' + blockId + ' > div > h1').html();
    var newMembers = [];
    var newMembersContent = [];
    var r = confirm('Do you want to delete this member: ' + memberEmail + '?');
    if (r) {
      _.each(self.props.loadDetailTeam.team.members, function(member){
        if (member.email != memberEmail) {
          newMembers.push(member);
        }
      });
      _.each(self.props.loadDetailTeam.members, function(member){
        if (member.email != memberEmail) {
          newMembersContent.push(member);
        }
      });
      // self.props.loadDetailTeam.team.members = newMembers;
      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(results){
          self.props.realodTeamMembers(newMembers, newMembersContent);
          // console.log(results);
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },
  // changeMemberHandler: function(e) {
  //   var self = this;
  //   var newMembers = [];
  //   if (e.target.id.indexOf('role') >= 0) {
  //     var blockId = 'name_' + e.target.id.substring(12, e.target.id.length);
  //     $('#role_' + e.target.id.substring(12, e.target.id.length) + ' > h').html(e.target.value);
  //     $('#role_' + e.target.id.substring(12, e.target.id.length) + ' > h').css('display','');
  //     $('#role_' + e.target.id.substring(12, e.target.id.length) + ' > div').css('display','none');
  //   } else if (e.target.id.indexOf('allocation') >= 0) {
  //     blockId = 'name_' + e.target.id.substring(18, e.target.id.length);
  //     $('#allocation_' + e.target.id.substring(18, e.target.id.length) + ' > h').html(e.target.value + '%');
  //     $('#allocation_' + e.target.id.substring(18, e.target.id.length) + ' > h').css('display','');
  //     $('#allocation_' + e.target.id.substring(18, e.target.id.length) + ' > div').css('display','none');
  //
  //   } else {
  //     blockId = 'name_' + e.target.id.substring(11, e.target.id.length);
  //     $('#awk_' + e.target.id.substring(12, e.target.id.length) + ' > h').html(e.target.value);
  //     $('#awk_' + e.target.id.substring(12, e.target.id.length) + ' > h').css('display','');
  //     $('#awk_' + e.target.id.substring(12, e.target.id.length) + ' > div').css('display','none');
  //   }
  //   var memberEmail = $('#' + blockId + ' > div > h1').html();
  //   _.each(self.props.loadDetailTeam.team.members, function(member){
  //     if (member.email != memberEmail) {
  //       newMembers.push(member);
  //     } else {
  //       var pm = JSON.parse(JSON.stringify(member));
  //       if (e.target.id.indexOf('role') >= 0) {
  //         pm['role'] = e.target.value;
  //       } else if (e.target.id.indexOf('allocation') >= 0) {
  //         pm['allocation'] = e.target.value;
  //       } else {
  //       }
  //       newMembers.push(pm);
  //     }
  //   });
  //   api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
  //     .then(function(results){
  //       // console.log(results);
  //     })
  //     .catch(function(err){
  //       console.log(err);
  //     });
  // },

  showAddTeamTable: function() {
    this.setState({ showModal: true });
  },
  hideAddTeamTable: function() {
    this.setState({ showModal: false });
  },
  toTitleCase: function(str) {
    if (_.isEmpty(str)) return '';
    var strArray = str.toUpperCase().split(',');
    if (strArray.length < 3) {
      return str.toUpperCase();
    } else {
      strArray[0] = strArray[0].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      return strArray.join(', ');
    }
  },

  changeRoleHandler: function(e) {
    var self = this;
    var newMembers = [];
    var roleId = 'role_' + e.target.id.substring(12, e.target.id.length);
    if (e.target.value == 'Other...') {
      $('#' + roleId + ' .input-field').show();
      setTimeout( function() {
        $('#r_' + roleId).focus();
      }, 0);
      $('#' + roleId + ' .input-field > input').focus();
      $('#' + roleId + ' .save-btn').show();
      $('#' + roleId + ' .cancel-btn').show();
    } else if (e.target.value == 'psr') {
      $('#' + roleId + ' .input-field > input').val('');
      $('#' + roleId + ' .input-field').hide();
      $('#' + roleId + ' .save-btn').hide();
      $('#' + roleId + ' .cancel-btn').hide();
    } else {
      $('#' + roleId + ' .input-field > input').val('');
      $('#' + roleId + ' .input-field').hide();
      $('#' + roleId + ' .save-btn').hide();
      $('#' + roleId + ' .cancel-btn').hide();
      $('#' + roleId + ' > h').html(e.target.value);
      $('#' + roleId + ' input').attr('placeholder', e.target.value);
      $('#' + roleId + ' .modify-field').removeClass('team-member-table-content-block-show');
      $('#' + roleId + ' > h').removeClass('team-member-table-content-block-hide');
      var blockId = 'name_' + e.target.id.substring(12, e.target.id.length);
      var memberEmail = $('#' + blockId + ' > div > h1').html();
      _.each(self.props.loadDetailTeam.team.members, function(member){
        if (member.email != memberEmail) {
          newMembers.push(member);
        } else {
          var pm = JSON.parse(JSON.stringify(member));
          pm['role'] = e.target.value;
          newMembers.push(pm);
        }
      });
      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(results){
          _.each(self.props.loadDetailTeam.team.members, function(member){
            if (member.email == memberEmail) {
              member['role'] = e.target.value;
            }
          });
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  saveRole: function(roleId) {
    var self = this;
    var newMembers = [];
    var roleValue = $('#' + roleId + ' input').val();
    if (roleValue == '') {
      alert('Role cannot be empty.');
    } else {
      $('#' + roleId + ' > h').html(roleValue);
      $('#' + roleId + ' input').attr('placeholder', roleValue);
      $('#' + roleId + ' .save-btn').hide();
      $('#' + roleId + ' .cancel-btn').hide();
      $('#' + roleId + ' .modify-field').removeClass('team-member-table-content-block-show');
      $('#' + roleId + ' > h').removeClass('team-member-table-content-block-hide');
      var blockId = 'name_' + roleId.substring(5, roleId.length);
      var memberEmail = $('#' + blockId + ' > div > h1').html();
      _.each(self.props.loadDetailTeam.team.members, function(member){
        if (member.email != memberEmail) {
          newMembers.push(member);
        } else {
          var pm = JSON.parse(JSON.stringify(member));
          pm['role'] = roleValue;
          newMembers.push(pm);
        }
      });
      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(results){
          _.each(self.props.loadDetailTeam.team.members, function(member){
            if (member.email == memberEmail) {
              member['role'] = roleValue;
            }
          });
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  cancelChange: function(blockId) {
    var self = this;
    if (blockId.indexOf('role') >= 0) {
      if (self.props.roles.indexOf($('#' + blockId + ' input').attr('placeholder'))>=0) {
        $('#' + blockId + ' select').val($('#' + blockId + ' input').attr('placeholder')).change();
        $('#' + blockId + ' input').val('');
      } else {
        $('#' + blockId + ' input').val($('#' + blockId + ' input').attr('placeholder'));
      }
    } else if (blockId.indexOf('awk') >= 0) {
      if ($('#' + blockId + ' input').attr('placeholder') == 100 || $('#' + blockId + ' input').attr('placeholder') == 50) {
        $('#' + blockId + ' select').val($('#' + blockId + ' input').attr('placeholder')).change();
        $('#' + blockId + ' input').val('');
      } else {
        $('#' + blockId + ' input').val($('#' + blockId + ' input').attr('placeholder'));
      }
    } else {
      $('#' + blockId + ' input').val($('#' + blockId + ' input').attr('placeholder'));
    }
    $('#' + blockId + ' > .modify-field').removeClass('team-member-table-content-block-show');
    $('#' + blockId + ' > h').removeClass('team-member-table-content-block-hide');
    $('#' + blockId + ' .save-btn').hide();
    $('#' + blockId + ' .cancel-btn').hide();
  },

  saveAllocation: function(allocationId) {
    var self = this;
    var newMembers = [];
    var allocationValue = $('#' + allocationId + ' input').val();
    if (allocationValue < 0 || allocationValue > 100 || allocationValue == '') {
      alert('Allocation value should be between 0 and 100.');
    } else {
      $('#' + allocationId + ' > h').html(allocationValue + '%');
      var blockId = 'name_' + allocationId.substring(11, allocationId.length);
      var memberEmail = $('#' + blockId + ' > div > h1').html();
      $('#' + allocationId + ' > .modify-field').removeClass('team-member-table-content-block-show');
      $('#' + allocationId + ' > h').removeClass('team-member-table-content-block-hide');
      $('#' + allocationId + ' input').val(allocationValue);
      $('#' + allocationId + ' input').attr('placeholder', allocationValue);
      $('#' + allocationId + ' .save-btn').hide();
      $('#' + allocationId + ' .cancel-btn').hide();
      _.each(self.props.loadDetailTeam.team.members, function(member){
        if (member.email != memberEmail) {
          newMembers.push(member);
        } else {
          var pm = JSON.parse(JSON.stringify(member));
          pm['allocation'] = allocationValue;
          newMembers.push(pm);
        }
      });
      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(results){
          _.each(self.props.loadDetailTeam.team.members, function(member){
            if (member.email == memberEmail) {
              member['allocation'] = allocationValue;
            }
          });
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  saveLocation: function(locationId) {
    var self = this;
    var locationValue = $('#' + locationId + ' input').val();
    if (locationValue == '') {
      alert('Location info cannot be empty.');
    } else {
      $('#' + locationId + ' > h').html(locationValue);
      var blockId = 'name_' + locationId.substring(9, locationId.length);
      var memberEmail = $('#' + blockId + ' > div > h1').html();
      $('#' + locationId + ' > .modify-field').removeClass('team-member-table-content-block-show');
      $('#' + locationId + ' > h').removeClass('team-member-table-content-block-hide');
      $('#' + locationId + ' input').val(locationValue);
      $('#' + locationId + ' input').attr('placeholder', locationValue);
      $('#' + locationId + ' .save-btn').hide();
      $('#' + locationId + ' .cancel-btn').hide();
      var newMember = _.find(self.props.loadDetailTeam.members, function(member){
        if (member.email == memberEmail) {
          return member;
        }
      });
      if (!_.isEmpty(newMember)) {
        newMember['location']['site'] = locationValue.toLowerCase();
        api.updateUser(newMember);
      }
    }
  },

  changeAwkHandler: function(e) {
    // console.log(e.target.id.substring(11, e.target.id.length));
    var self = this;
    var newMembers = [];
    var awkId = 'awk_' + e.target.id.substring(11, e.target.id.length);
    if (e.target.value == 'other') {
      $('#' + awkId + ' .input-field').show();
      setTimeout( function() {
        $('#w_' + awkId).focus();
      }, 0);
      $('#' + awkId + ' .save-btn').show();
      $('#' + awkId + ' .cancel-btn').show();
    } else {
      $('#' + awkId + ' input').attr('placeholder', e.target.value);
      $('#' + awkId + ' .input-field').hide();
      $('#' + awkId + ' .save-btn').hide();
      $('#' + awkId + ' .cancel-btn').hide();
      if (e.target.value == 100) {
        $('#' + awkId + ' > h').html('Full Time');
      } else {
        $('#' + awkId + ' > h').html('Half Time');
      }
      $('#' + awkId + ' .modify-field').removeClass('team-member-table-content-block-show');
      $('#' + awkId + ' > h').removeClass('team-member-table-content-block-hide');
      var blockId = 'name_' + e.target.id.substring(11, e.target.id.length);
      var memberEmail = $('#' + blockId + ' > div > h1').html();
      _.each(self.props.loadDetailTeam.team.members, function(member){
        if (member.email != memberEmail) {
          newMembers.push(member);
        } else {
          var pm = JSON.parse(JSON.stringify(member));
          pm['workTime'] = e.target.value;
          newMembers.push(pm);
        }
      });
      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(results){
          _.each(self.props.loadDetailTeam.team.members, function(member){
            if (member.email == memberEmail) {
              member['workTime'] = e.target.value;
            }
          });
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  saveAwk: function(awkId) {
    var self = this;
    var newMembers = [];
    var awkValue = $('#' + awkId + ' input').val();
    if (awkValue > 100 || awkValue < 0 || awkValue == '') {
      alert('Averge work per week should be between 0 to 100.');
    } else {
      if (awkValue == 100) {
        $('#' + awkId + ' > h').html('Full Time');
      } else if (awkValue == 50) {
        $('#' + awkId + ' > h').html('Half Time');
      } else {
        $('#' + awkId + ' > h').html(awkValue + '%');
      }
      $('#' + awkId + ' input').attr('placeholder', awkValue);
      $('#' + awkId + ' .save-btn').hide();
      $('#' + awkId + ' .cancel-btn').hide();
      $('#' + awkId + ' .modify-field').removeClass('team-member-table-content-block-show');
      $('#' + awkId + ' > h').removeClass('team-member-table-content-block-hide');
      var blockId = 'name_' + awkId.substring(4, awkId.length);
      var memberEmail = $('#' + blockId + ' > div > h1').html();
      _.each(self.props.loadDetailTeam.team.members, function(member){
        if (member.email != memberEmail) {
          newMembers.push(member);
        } else {
          var pm = JSON.parse(JSON.stringify(member));
          pm['workTime'] = awkValue;
          newMembers.push(pm);
        }
      });
      api.modifyTeamMembers(self.props.loadDetailTeam.team._id, newMembers)
        .then(function(results){
          _.each(self.props.loadDetailTeam.team.members, function(member){
            if (member.email == memberEmail) {
              member['workTime'] = awkValue;
            }
          });
        })
        .catch(function(err){
          console.log(err);
        });
    }
  },

  wholeNumCheck: function(e) {
    var self = this;
    var pattern = /^\d*$/;
    if (e.charCode == 13) {
      self.keyPressCheck(e);
    } else if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(String.fromCharCode(e.charCode)))
    {
      e.preventDefault();
    }
  },

  keyPressCheck: function(e) {
    var self = this;
    if (e.charCode == 13) {
      switch (e.target.id.substring(0,1)) {
        case 'l': self.saveLocation(e.target.id.substring(2,e.target.id.length));
          break;
        case 'a': self.saveAllocation(e.target.id.substring(2,e.target.id.length));
          break;
        case 'w': self.saveAwk(e.target.id.substring(2,e.target.id.length));
          break;
        case 'r': self.saveRole(e.target.id.substring(2,e.target.id.length));
          break;
      }
    }
  },

  escPressCheck: function(e) {
    var self = this;
    if (e.keyCode == 27) {
      self.cancelChange(e.target.id.substring(2,e.target.id.length));
      // switch (e.target.id.substring(0,1)) {
      //   case 'l': self.cancelLocationChange(e.target.id.substring(2,e.target.id.length));
      //     break;
      //   case 'a': self.cancelAllocationChange(e.target.id.substring(2,e.target.id.length));
      //     break;
      //   case 'w': self.cancelAwkChange(e.target.id.substring(2,e.target.id.length));
      //     break;
      //   case 'r': self.cancelChange(e.target.id.substring(2,e.target.id.length));
      //     break;
      // }
    }
  },

  // handleClick: function(e) {
  //   console.log('aaa')
  // },

  render: function() {
    var self = this;
    var backdropStyle = {
      top: 0, bottom: 0, left: 0, right: 0,
      zIndex: 'auto',
      backgroundColor: '#000',
      opacity: 0.5,
      width: '100%',
      height: '100%'
    };
    var modalStyle = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      zIndex: 1040,
      top: 0, bottom: 0, left: 0, right: 0,
    };
    if (self.props.loadDetailTeam.team == undefined) {
      return null;
    } else {
      team = self.props.loadDetailTeam.team;
      var allocationArray = Array.from(Array(101).keys())
      var allocationSelection = allocationArray.map(function(a){
        return (
          <option key={a} value={a}>{a+'%'}</option>
        )
      });
      var roleSelection = self.props.roles.map(function(r){
        return (
          <option key={r} value={r}>{r}</option>
        )
      });
      if (team.members == null || team.members.length == 0) {
        var teamMembers = null;
      } else {
        var members = _.sortBy(self.props.loadDetailTeam.members, function(member){
          return member.name.toLowerCase();
        });
        if (self.props.loadDetailTeam.access) {
          var addTeamBtnStyle = false;
        } else {
          addTeamBtnStyle = true;
        }
        teamMembers = members.map(function(member, idx){
          if (idx <= 14) {
            var memberDetail = _.find(team.members, function(m){
              if (m.userId == member.userId) {
                return {
                  'role': m.role,
                  'allocation': m.allocation,
                  'workTime': m.workTime
                }
              }
            });
            var mLocation = self.toTitleCase(member.location.site);
            //var src = 'http://dpev027.innovate.ibm.com:10000/image/' + member.userId.toUpperCase();
            // var src = '//images.w3ibm.mybluemix.net/image/' + member.userId.toUpperCase();
            var src = '//faces-cache.mybluemix.net/image/' + member.userId.toUpperCase();
            var blockColor = {
              'backgroundColor': '#FFFFFF'
            }
            var blockClass = 'team-member-table-content-block1';
            if (idx % 2 != 0) {
              blockColor['backgroundColor'] = '#EFEFEF';
              blockClass = 'team-member-table-content-block2';
            }
            var blockId = 'member_'+idx;
            var nameId = 'name_'+idx;
            var locationId = 'location_'+idx;
            var roleId = 'role_'+idx;
            var allocationId = 'allocation_'+idx;
            var awkId = 'awk_'+idx;
            if (self.props.loadDetailTeam.access) {
              var deletBtn = (
                <span onClick={self.delTeamMemberHandler.bind(null, idx)}>
                  <InlineSVG src={require('../../../img/Att-icons/att-icons_delete.svg')}></InlineSVG>
                </span>
              );
              var addTeamBtnStyle = false;
            } else {
              deletBtn = null;
              addTeamBtnStyle = true;
            }
            var awkValue = 'Full Time';
            var awkPlaceHolder = 100;
            // if (_.isNumber(memberDetail.workTime)) {
            if (memberDetail.workTime == 50) {
              awkValue = 'Half Time';
              awkPlaceHolder = 50;
            } else if (memberDetail.workTime == 100) {
              awkValue = 'Full Time';
            } else {
              awkValue = memberDetail.workTime + '%';
              awkPlaceHolder = memberDetail.workTime;
            }
            // }
            return (
              <div key={blockId} id={blockId} class={blockClass}>
                <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
                </div>
                <div id={nameId} style={{'width':'28.8%'}}>
                  <div style={{'width':'25.6%','height':'100%','display':'inline-block','float':'left'}}>
                    <img style={{'position':'relative', 'top':'17%'}} src={src}></img>
                  </div>
                  <div style={{'width':'74.4%','height':'50%','display':'inline-block','float':'left','position':'relative','top':'25%'}}>
                    <h>{member.name}</h>
                    <br/>
                    <h1>{member.email}</h1>
                  </div>
                </div>
                <div class='team-member-table-content-role' id={roleId} style={{'width':'19.3%'}}>
                  <h>{memberDetail.role}</h>
                  <div class='modify-field'>
                    <div class='dropdown-list'>
                      <select id={'role_select_' + idx} defaultValue='Select a role'>
                        <option key='psr' value='psr'>Please select a role</option>
                        {roleSelection}
                      </select>
                    </div>
                    <div class='input-field'>
                      <input type='text' id={'r_'+roleId} placeholder={memberDetail.role} onKeyPress={self.keyPressCheck} onKeyUp={self.escPressCheck}></input>
                      <div class='save-btn' onClick={self.saveRole.bind(null, roleId)}>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                      </div>
                      <div class='cancel-btn' style={{'left':'5%'}} onClick={self.cancelChange.bind(null, roleId)}>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                      </div>
                    </div>
                  </div>
                </div>
                <div class='team-member-table-content-location' id={locationId} style={{'width':'21.9%'}}>
                  <h>{mLocation}</h>
                  <div class='modify-field'>
                    <input type='text' id={'l_'+locationId} placeholder={mLocation} onKeyPress={self.keyPressCheck} onKeyUp={self.escPressCheck} defaultValue={mLocation}></input>
                    <div class='save-btn' onClick={self.saveLocation.bind(null, locationId)}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='cancel-btn' style={{'left':'2%'}} onClick={self.cancelChange.bind(null, locationId)}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>
                </div>
                <div class='team-member-table-content-allocation' id={allocationId} style={{'width':'11.3%'}}>
                  <h>{memberDetail.allocation+'%'}</h>
                  <div class='modify-field'>
                    {/*<select id={'allocation_select_' + idx} defaultValue={memberDetail.allocation}>
                      {allocationSelection}
                    </select>*/}
                    <input type='text' id={'a_'+allocationId} placeholder={memberDetail.allocation} min='0' max='100' maxLength='3' onKeyPress={self.wholeNumCheck} onKeyUp={self.escPressCheck} defaultValue={memberDetail.allocation}></input>
                    <h1>%</h1>
                    <div class='save-btn' onClick={self.saveAllocation.bind(null, allocationId)}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                    </div>
                    <div class='cancel-btn' style={{'left':'5%'}} onClick={self.cancelChange.bind(null, allocationId)}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                    </div>
                  </div>
                </div>
                <div class='team-member-table-content-awk' id={awkId} style={{'width':'16.7%'}}>
                  <h>{awkValue}</h>
                  <div class='modify-field'>
                    <div class='dropdown-list'>
                      <select id={'awk_select_' + idx} defaultValue='Full Time'>
                        <option key='100' value='100'>Full Time</option>
                        <option key='50' value='50'>Half Time</option>
                        <option key='other' value='other'>Other</option>
                      </select>
                    </div>
                    <div class='input-field'>
                      <input type='text' id={'w_'+awkId} placeholder={awkPlaceHolder} min='0' max='100' maxLength='3' onKeyPress={self.wholeNumCheck} onKeyUp={self.escPressCheck}></input>
                      <h1>%</h1>
                      <div class='save-btn' onClick={self.saveAwk.bind(null, awkId)}>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_confirm.svg')}></InlineSVG>
                      </div>
                      <div class='cancel-btn' style={{'left':'2%'}} onClick={self.cancelChange.bind(null, awkId)}>
                        <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
                      </div>
                    </div>
                  </div>
                  {deletBtn}
                </div>
                <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
                </div>
              </div>
            )
          }
        });
      }
      return (
        <div id='teamMemberTable' style={{'display':'none'}}>
          <div id='teamMemberTableTitle' class='team-member-table-title-div'>
            <h class='team-member-table-title'>Team Details</h>
            <div class='team-member-table-close-btn' onClick={self.props.closeTeamTable}>
              <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
            </div>
          </div>
          <div class='team-member-table' id='memberTable'>
            <div class='team-member-table-header-block'>
              <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'28.6%'}}>
                <h>Name</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'19.1%'}}>
                <h>Role</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'21.7%'}}>
                <h>Location</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'11.1%'}}>
                <h>Allocation</h>
              </div>
              <div style={{'width':'0.2%','backgroundColor':'#FFFFFF'}}>
              </div>
              <div style={{'width':'16.7%'}}>
                <h>Avg. work week</h>
              </div>
              <div style={{'width':'1%','backgroundColor':'#FFFFFF'}}>
              </div>
            </div>
            {teamMembers}
            <div class='team-member-table-footer-block'>
              <div id='teamMemberTableFooter' class='team-member-table-footer'>
                <button type='button' class='ibm-btn-sec ibm-btn-blue-50' disabled={addTeamBtnStyle} onClick={self.showAddTeamTable}>Add Team Member</button>
              </div>
            </div>
          </div>
          <Modal aria-labelledby='modal-label' style={modalStyle} backdropStyle={backdropStyle} show={self.state.showModal} onHide={self.hideAddTeamTable}>
            <HomeAddMember realodTeamMembers={self.props.realodTeamMembers} loadDetailTeam={self.props.loadDetailTeam} roleSelection={roleSelection} hideAddTeamTable={self.hideAddTeamTable}/>
          </Modal>
        </div>
      )
    }
  }
});

module.exports = HomeMemberTable;
