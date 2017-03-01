var React = require('react');
var api = require('../api.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var _ = require('underscore');
var Promise = require('bluebird');
var InlineSVG = require('svg-inline-react');
var selectedTeam = '';
var clickedTeamId = '';

var HomeTeamTree = React.createClass({
  componentDidMount: function() {
  },

  componentWillUpdate: function() {
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    if (nextProps.newTeams == this.props.newTeams) {
      if (nextProps.selectedTeam != this.props.selectedTeam && nextProps.selectedTeam != '') {
        this.loadTeamInAllTeams(nextProps.selectedTeam,true);
        $('#newSearchTree').hide();
      }
      return false;
    } else {
      return true;
    }
  },

  componentDidUpdate: function() {
    var self = this;
    $('#navSpinner').hide();
    $('#newSearchTree').hide();
    $('#newTeamTree').show();
    $('.nano').nanoScroller();
    //console.log('componentDidUpdate',self.props);
    self.initHilightTeam();
    // self.loadTeamInAllTeams(selectedTeam);
    if (self.props.newTeams.tab == 'myteams') {
      if (_.isUndefined(self.props.newTeams.data.teams)) {
        return null;
      } else {
        if(self.props.newTeams.data.teams.length == 1 && self.props.newTeams.data.teams[0].type != 'squad') {
          if ($('#newTeamTree a.agile-team-selected').length > 0) {
            self.expandParentTeam(self.props.newTeams.data.teams[0].pathId);
            return null;
          }
          /*
          api.getChildrenTeams(self.props.newTeams.data.teams[0].pathId)
            .then(function(results){
              if (results.length > 0) {
                self.appendChildTeams(results, self.props.newTeams.data.teams[0].pathId);
              }
            })
            .catch(function(err){
              console.log(err);
            });
          */
        }
      }
    }
  },

  triggerTeam: function(teamId) {
    var self = this;
    if ($('#' + teamId).hasClass('ibm-active')) {
      self.highlightParents(teamId);
      self.collapseParentTeam(teamId);
      $('#' + teamId + ' > a > .expand-image > img').attr('src', '../../../img/Att-icons/att-icons_+.svg');
    } else {
      self.removeHighlightParents(teamId);
      self.expandParentTeam(teamId);
      $('#' + teamId + ' > a > .expand-image > img').attr('src', '../../../img/Att-icons/att-icons_-.svg');
    }
  },

  removeHighlightParents: function(teamId) {
    if (teamId != null) {
      $($('#' + teamId).children('a.agile-team-link')[0]).removeClass('agile-team-parent-selected');
    } else {
      $('#newTeamTree a.agile-team-parent-selected').removeClass('agile-team-parent-selected');
    }
  },

  highlightParents: function(teamId) {
    if (teamId != null) {
      $('#' + teamId).removeClass('agile-team-parent-selected');
      if (teamId != '' && $('#' + teamId + ' a.agile-team-selected').length == 1) {
        $($('#' + teamId).children('a.agile-team-link')[0]).addClass('agile-team-parent-selected');
      }
    } else {
      var li = $('#newTeamTree a.agile-team-selected').parents('li');
      for (var i = 1; i <= li.length; i++) {
        var element = li[i];
        $($(element).children('a.agile-team-link')[0]).addClass('agile-team-parent-selected');
      }
    }
  },

  highlightTeam: function(teamId){
    if (selectedTeam != '') {
      //$('#link_' + selectedTeam).removeClass('agile-team-selected');
      $('#newTeamTree a.agile-team-selected').removeClass('agile-team-selected');
    }
    if ($('#link_' + teamId).hasClass('agile-team-selected')) {

    } else {
      $('#link_' + teamId).addClass('agile-team-selected');
    }
  },

  initHilightTeam: function() {
    var self = this;
    selectedTeam = self.props.selectedTeam || selectedTeam;
    //console.log('initHilightTeam', selectedTeam);
    if (selectedTeam == '') {
      if ($('#newTeamTree li')[0]) {
        if (($('#newTeamTree li')[0]).id) {
          if (($('#newTeamTree li')[0]).id != 'agteamstandalone') {
            selectedTeam = ($('#newTeamTree li')[0]).id;
          } else {
            if (selectedTeam != ($('#newTeamTree li')[1]).id) {
              selectedTeam = ($('#newTeamTree li')[1]).id;
            }
          }
        }
        self.highlightTeam(selectedTeam);
        self.loadDetails(selectedTeam);
      } else {
        $('#bodyContent').hide();
        $('#snapshotPull').hide();
        //$('#iterationFallBox').hide();
        $('#squad_team_scard').hide();
        $('#nsquad_team_scard').hide();
        //$('#assessmentFallBox').hide();
        $('#nsquad_assessment_card').hide();
        $('#squad_assessment_card').hide();
        $('#membersList').empty();
        $('#teamMemberTable').hide();
      }
    } else {
      if ($('#myTeams').attr('data-state') == 'open') {
        var path = [];
        var availablePath = [];
        api.loadTeamDetails(selectedTeam)
          .then(function(team){
            if (team != null) {
              if (team.path != null) {
                path = (team.path.substring(1,team.path.length-1)).split(',');
              }
              path.push(team.pathId);
              var promiseArray = [];

              _.each(path, function(pathId){
                if (($.find('#' + pathId)).length > 0 || pathId == 'agteamstandalone') {
                  availablePath.push(pathId);
                  promiseArray.push(api.getChildrenTeams(pathId));
                }
              });

              return Promise.all(promiseArray);
            } else {
              return Promise.reject('no team found');
            }
          })
          .then(function(results){
            if (($.find('#' + selectedTeam)).length > 0) {
              for (var i = 0; i < results.length; i++) {
                self.appendChildTeams(results[i], availablePath[i]);
              }
              self.loadDetails(selectedTeam);
              $('#navSpinner').hide();
              $('#newTeamTree').show();
              $('.nano').nanoScroller();
              $('.nano').nanoScroller({
                scrollTo: $('#link_' + selectedTeam)
              });
            } else {
              if ($('#newTeamTree li')[0]) {
                if (($('#newTeamTree li')[0]).id) {
                  if (($('#newTeamTree li')[0]).id != 'agteamstandalone') {
                    selectedTeam = ($('#newTeamTree li')[0]).id;
                    self.highlightTeam(selectedTeam);
                    self.loadDetails(selectedTeam);
                  } else {
                    if (selectedTeam == ($('#newTeamTree li')[1]).id) {
                      selectedTeam = ($('#newTeamTree li')[1]).id;
                      self.highlightTeam(selectedTeam);
                      self.loadDetails(selectedTeam);
                    } else {
                      selectedTeam = '';
                    }
                  }
                } else {
                  selectedTeam = '';
                }
              }
            }
          });
      } else {
        self.loadTeamInAllTeams(selectedTeam);
      }
    }
    // console.log('sel:',selectedTeam);
  },

  expandParentTeam: function(teamId) {
    var self = this;
    if (teamId != null) {
      if ($('#' + teamId).attr('data-open') == 'false' || $('#body_'+teamId+' li').length == 0) {
        //var objectId = $('#' + teamId).children('span').html();
        //getChildrenTeams(parentId, false);
        if (clickedTeamId != teamId || $('#body_'+teamId+' li').length == 0) {
          clickedTeamId = teamId;
          api.getChildrenTeams(teamId)
          .then(function(teams){
            self.appendChildTeams(teams, teamId);
          })
          .catch(function(err){
            console.log(err);
          });
        }
      } else {
        $('#' + teamId).attr('data-open', 'true');
        $('#' + teamId).addClass('ibm-active');
        $('#body_' + teamId).css('display', 'block');
        $('.nano').nanoScroller();
      }
    }
  },

  appendChildTeams: function(teams, teamId) {
    var self = this;
    if (!_.isEmpty(teams)) {
      $('#main_' + teamId).remove();
      $('#body_' + teamId).append(self.createMainTwistySection('main_' + teamId, ''));
      _.each(teams, function(team){
        if (team.docStatus != 'delete') {
          $('#main_' + teamId).append(self.createSubSection(team));
          var trigger = $('#' + team.pathId).find('a.twisty-trigger');
          trigger.attr('title', 'Expand/Collapse').on('click', function() {
            self.triggerTeam(team.pathId);
          });
          var link = $('#link_' + team.pathId);
          link.on('click', function() {
            self.loadDetails(team.pathId);
          });
        }
      })
      $('#' + teamId).attr('data-open', 'true');
      $('#' + teamId).addClass('ibm-active');
      $('#' + teamId + ' > a > .expand-image > img').attr('src', '../../../img/Att-icons/att-icons_-.svg');
      $('#body_' + teamId).css('display', 'block');
      $('.nano').nanoScroller();
    }
  },

  collapseParentTeam: function(teamId) {
    $('#' + teamId).removeClass('ibm-active');
    $('#body_' + teamId).css('display', 'none');
    $('.nano').nanoScroller();
  },

  loadDetails: function(teamId) {
    var self = this;
    self.removeHighlightParents();
    $('.nano').nanoScroller();
    self.highlightTeam(teamId);
    var objectId = $('#' + teamId).children('span').html();
    //console.log('ooo:',teamId,objectId);
    $('#contentSpinner').show();
    $('#bodyContent').hide();
    $('#snapshotPull').hide();
    //$('#iterationFallBox').hide();
    $('#squad_team_scard').hide();
    $('#nsquad_team_scard').hide();
    //$('#assessmentFallBox').hide();
    $('#nsquad_assessment_card').hide();
    $('#squad_assessment_card').hide();
    $('#membersList').empty();
    $('#teamMemberTable').hide();
    var teamResult = new Object();
    var isSquad = false;
    api.loadTeam(objectId)
    .then(function(team){
      teamResult = team;
      var promiseArray = [];
      if ($('#link_' + teamId).hasClass('agile-team-squad')) {
        isSquad = true;
        promiseArray.push(api.getSquadIterations(objectId));
        promiseArray.push(api.getSquadAssessments(objectId));
        // promiseArray.push(api.isUserAllowed(objectId));
      } else {
        isSquad = false;
        promiseArray.push(api.getTeamSnapshots(objectId));
      }
      promiseArray.push(api.isUserAllowed(objectId));
      promiseArray.push(api.getTeamHierarchy(team.path));
      if (team.members != null && team.members.length > 0) {
        var ids = [];
        _.each(team.members, function(member){
          ids.push(member.userId);
        });
        promiseArray.push(api.getUsersInfo(ids));
      }
      return Promise.all(promiseArray)
    })
    .then(function(results){
      if (isSquad) {
        var rObject = {
          'type': 'squad',
          'team': teamResult,
          'iterations': results[0],
          'assessments': results[1],
          'access': results[2],
          'hierarchy': results[3],
          'members': results[4]
        };
      } else {
        var rObject = {
          'type': '',
          'team': teamResult,
          'snapshot': results[0],
          'access': results[1],
          'hierarchy': results[2],
          'members': results[3]
        };
      }
      self.props.loadDetailTeamChanged(rObject);
    })
    .catch(function(err){
      console.log(err);
      $('#contentSpinner').hide();
    });
  },

  loadTeamInAllTeams: function(teamId, fromSearch) {
    var self = this;
    selectedTeam = teamId;
    $('#navSpinner').show();
    $('#newTeamTree').hide();
    var path = [];
    if ($('#' + teamId).length > 0 && fromSearch) {
      self.openAllParents(teamId);
    } else {
      api.loadTeamDetails(teamId)
      .then(function(team){
        if (team != null) {
          if (team.path != null) {
            path = (team.path.substring(1,team.path.length-1)).split(',');
          } else {
            if (!team.hasChild) {
              path.push('agteamstandalone');
            }
          }
          path.push(team.pathId);
          var promiseArray = [];
          _.each(path, function(pathId){
            promiseArray.push(api.getChildrenTeams(pathId));
          });
          return Promise.all(promiseArray);
        } else {
          return Promise.reject('no team found');
        }
      })
      .then(function(results){
        for (var i = 0; i < results.length; i++) {
          self.appendChildTeams(results[i], path[i]);
        }
        self.loadDetails(path[path.length-1]);
        $('#navSpinner').hide();
        $('#newTeamTree').show();
        $('.nano').nanoScroller();
        $('.nano').nanoScroller({
          scrollTo: $('#link_' + path[path.length-1])
        });
        $('.home-team-nav').css('top','3.1%');
      })
      .catch(function(err){
        $('#navSpinner').hide();
        $('#newTeamTree').show();
        self.highlightTeam(($('#newTeamTree li')[0]).id);
        console.log(err);
      });
    }
  },

  openAllParents: function(teamId) {
    var self = this;
    var paths = [];
    api.loadTeamDetails(teamId)
    .then(function(team){
      if (team != null) {
        if (team.path != null) {
          paths = (team.path.substring(1,team.path.length-1)).split(',');
        } else {
          if (!team.hasChild) {
            paths.push('agteamstandalone');
          }
        }
      }
      _.each(paths, function(path){
        if ($('#' + path).length > 0) {
          if (!$('#' + path).hasClass('ibm-active')) {
            $('#' + path).addClass('ibm-active');
            // console.log(path);
            // $('#' + path + ' > a > .expand-image > img').attr('src', '../../../img/Att-icons/att-icons_-.svg');
          }
          $('#body_' + path).css('display','block');
        }
      });
      self.loadDetails(teamId);
      $('#navSpinner').hide();
      $('#newTeamTree').show();
      $('.nano').nanoScroller();
      $('.nano').nanoScroller({
        scrollTo: $('#link_' + teamId)
      });
    })
    .catch(function(err){
      $('#navSpinner').hide();
      $('#newTeamTree').show();
      console.log(err);
    })
  },

  createMainTwistySection: function(twistyId, extraClass) {
    var ul = document.createElement('ul');
    ul.setAttribute('class', 'ibm-twisty ' + extraClass);
    ul.setAttribute('id', twistyId);
    return ul;
  },

  createSubSection: function(team) {
    var extraClass = '';
    var hiddenExpand = 'block';
    var hiddenSquad = 'none';
    if (team.type == 'squad') {
      extraClass = extraClass + 'agile-team-squad';
      hiddenExpand = 'none';
      hiddenSquad = 'block';
    }
    if (!team.hasChild) {
      extraClass = extraClass + ' agile-team-standalone';
      hiddenExpand = 'none';
    }
    var li = document.createElement('li');
    li.setAttribute('data-open', 'false');
    if (extraClass.indexOf('agile-team-standalone') > -1)
      li.setAttribute('class', 'agile-team-standalone');
    li.setAttribute('id', team.pathId);

    var spanLink = document.createElement('span');
    spanLink.setAttribute('class', 'ibm-access');
    spanLink.appendChild(document.createTextNode(team.name));


    var spanImageLink1 = document.createElement('img');
    spanImageLink1.setAttribute('src', '../../../img/Att-icons/att-icons_+.svg');
    var spanImageLink2 = document.createElement('img');
    spanImageLink2.setAttribute('src', '../../../img/Att-icons/att-icons_tribe.svg');
    var spanImageDiv1 = document.createElement('div');
    spanImageDiv1.setAttribute('class', 'expand-image');
    spanImageDiv1.setAttribute('style', 'display: ' + hiddenExpand);
    var spanImageDiv2 = document.createElement('div');
    spanImageDiv2.setAttribute('class', 'squad-image');
    spanImageDiv2.setAttribute('style', 'display: ' + hiddenSquad);
    spanImageDiv1.appendChild(spanImageLink1);
    spanImageDiv2.appendChild(spanImageLink2);

    var span = document.createElement('a');
    if (team.type == 'squad') {
      span.setAttribute('class', 'trigger-squad');
    } else {
      span.setAttribute('class', 'twisty-trigger');
    }
    span.setAttribute('href', '#toggle');
    span.appendChild(spanImageDiv1);
    span.appendChild(spanImageDiv2);
    span.appendChild(spanLink);
    li.appendChild(span);

    var href = document.createElement('a');
    href.setAttribute('class', 'agile-team-link ' + extraClass);
    var desc = (team.description == null)?'No description specified':team.description;
    href.setAttribute('title',desc);
    href.setAttribute('id', 'link_' + team.pathId);
    var sp = document.createElement('span');
    sp.setAttribute('class', 'agile-team-title');
    // href.appendChild(document.createTextNode(team.name));
    sp.appendChild(document.createTextNode(team.name));
    href.appendChild(sp);
    li.appendChild(href);

    //we're putting this span to hold the relevant team id
    span = document.createElement('span');
    span.setAttribute('class', 'ibm-access');
    span.appendChild(document.createTextNode(team._id));
    li.appendChild(span);

    var div = document.createElement('div');
    div.setAttribute('class', 'ibm-twisty-body');
    div.setAttribute('id', 'body_' + team.pathId);
    div.setAttribute('display', 'none');
    li.appendChild(div);

    return li;
  },

  render: function() {
    var self = this;
    var teamTreeStyle = {
      'display': 'block'
    };
    if (this.props.newTeams.tab == 'myteams') {
      if (_.isUndefined(this.props.newTeams.data.teams)) {
        return null;
      } else {
        var myteams = this.props.newTeams.data.teams.map(function(team) {
          if (team.docStatus == 'delete') {
            return;
          }
          var teamId = team.pathId;
          var linkId = 'link_' + team.pathId;
          var bodyId = 'body_' + team.pathId;
          var label = team.name;
          var objectId = team._id;
          if (team.type == 'squad') {
            var isSquad = 'agile-team-link agile-team-standalone agile-team-squad';
            var triggerClass =  'trigger-squad';
            var hiddenExpand = 'none';
            var hiddenSquad = 'block';
          } else {
            isSquad = 'agile-team-link agile-team-standalone';
            triggerClass =  'twisty-trigger';
            hiddenExpand = 'block';
            hiddenSquad = 'none';
          }
          if (team.hasChild == false) {
            var hasChild = 'agile-team-standalone';
          } else {
            var hasChild = '';
          }
          var teamDesc = (team.description == null)?'No description specified':team.description;
          var title = teamDesc;
          return (
            <li class={hasChild} key={objectId} data-open='false' id={teamId}>
              <a class={triggerClass} href='#toggle' title='Expand/Collapse' onClick={self.triggerTeam.bind(null, teamId)}>
                <div class='expand-image' style={{'display': hiddenExpand}}>
                  <img src={'../../../img/Att-icons/att-icons_+.svg'}></img>
                </div>
                <div class='squad-image' style={{'display': hiddenSquad}}>
                  <img src={'../../../img/Att-icons/att-icons_tribe.svg'}></img>
                </div>
                <span class='ibm-access'>{label}</span>
              </a>
              <a class={isSquad} title={title} id={linkId} onClick={self.loadDetails.bind(null, teamId)}><span class='agile-team-title'>{label}</span></a>
              <span class='ibm-access'>{objectId}</span>
              <div class='ibm-twisty-body' id={bodyId} style={{'display':'none'}}></div>
            </li>
          );
        });
        // standalone teams
        var standaloneTeams = this.props.newTeams.data.standalone.map(function(team) {
          if (team.docStatus == 'delete') {
            return null;
          }
          var teamId = team.pathId;
          var linkId = 'link_' + team.pathId;
          var bodyId = 'body_' + team.pathId;
          var label = team.name;
          var objectId = team._id;
          if (team.type == 'squad') {
            var isSquad = 'agile-team-link agile-team-standalone agile-team-squad';
            var triggerClass =  'trigger-squad';
            var hiddenExpand = 'none';
            var hiddenSquad = 'block';
          } else {
            isSquad = 'agile-team-link agile-team-standalone';
            triggerClass = 'twisty-trigger';
            hiddenExpand = 'block';
            hiddenSquad = 'none';
          }
          var teamDesc = (team.description == null)?'No description specified':team.description;
          var title = teamDesc;
          return (
            <li class='agile-team-standalone' key={objectId} data-open='false' id={teamId}>
              <a class={triggerClass} href='#toggle' title='Expand/Collapse'>
                <div class='squad-image' style={{'display': hiddenSquad}}>
                  <img src={'../../../img/Att-icons/att-icons_tribe.svg'}></img>
                </div>
                <span class='ibm-access'>{label}</span>
              </a>
              <a class={isSquad} title={title} id={linkId} onClick={self.loadDetails.bind(null,teamId)}><span class='agile-team-title'>{label}</span></a>
              <span class='ibm-access'>{objectId}</span>
            </li>
          );
        })
        if (_.isEmpty(this.props.newTeams.data.standalone)) {
          return (
            <div id='newTeamTree' style={teamTreeStyle}>
              <ul class='ibm-twisty  ibm-widget-processed' id='newTeamTreeMain'>
                {myteams}
              </ul>
            </div>
          );
        } else {
          return (
            <div id='newTeamTree' style={teamTreeStyle}>
              <ul class='ibm-twisty  ibm-widget-processed' id='newTeamTreeMain'>
                {myteams}
                <li data-open='true' id='agteamstandalone' class='ibm-active'>
                  <a class='twisty-trigger' href='#toggle' title='Expand/Collapse' onClick={self.triggerTeam.bind(null, 'agteamstandalone')}>
                    <div class='expand-image'>
                      <img src={'../../../img/Att-icons/att-icons_-.svg'}></img>
                    </div>
                    <span class='ibm-access'>Standalone Teams</span>
                  </a>
                  <a class='agile-team-link'><span class='agile-team-title'>Standalone Teams</span></a>
                  <span class='ibm-access'>agteamstandalone</span>
                  <div class='ibm-twisty-boddy' id='body_agteamstandalone' style={{'display':'block'}}>
                    <ul class='ibm-twisty ' id='main_agteamstandalone'>
                      {standaloneTeams}
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          );
        }
      }
    } else if (this.props.newTeams.tab == 'allteams') {
      var allteams = this.props.newTeams.data.map(function(team) {
        if (team.docStatus == 'delete') {
          return null;
        }
        var teamId = team.pathId;
        var linkId = 'link_' + team.pathId;
        var bodyId = 'body_' + team.pathId;
        var mainId = 'main_' + team.pathId;
        var label = team.name;
        var objectId = team._id;
        var teamDesc = (team.description == null)?'No description specified':team.description;
        var title = teamDesc;
        return (
          <li data-open='false' id={teamId} key={objectId}>
            <a class='twisty-trigger' href='#toggle' title='Expand/Collapse' onClick={self.triggerTeam.bind(null, teamId)}>
              <div class='expand-image'>
                <img src={'../../../img/Att-icons/att-icons_+.svg'}></img>
              </div>
              <span class='ibm-access'>{label}</span>
            </a>
            <a class='agile-team-link' title={title} id={linkId} onClick={self.loadDetails.bind(null,teamId)}>
              <span class='agile-team-title'>{label}</span>
            </a>
            <span class='ibm-access'>{objectId}</span>
            <div class='ibm-twisty-body' id={bodyId} style={{'display':'none'}}>
            </div>
          </li>
        );
      });
      return (
        <div id='newTeamTree' style={teamTreeStyle}>
          <ul class='ibm-twisty  ibm-widget-processed' id='newTeamTreeMain'>
            <ul class='ibm-twisty ' id='main_'>
              {allteams}
              <li data-open='false' id='agteamstandalone'>
                <a class='twisty-trigger' href='#toggle' title='Expand/Collapse' onClick={self.triggerTeam.bind(null, 'agteamstandalone')}>
                  <div class='expand-image'>
                    <img src={'../../../img/Att-icons/att-icons_+.svg'}></img>
                  </div>
                  <span class='ibm-access'>Standalone Teams</span>
                </a>
                <a class='agile-team-link' title='View Standalone Teams information'>
                  <span class='agile-team-title'>Standalone Teams</span>
                </a>
                <span class='ibm-access'>agteamstandalone</span>
                <div class='ibm-twisty-body' id='body_agteamstandalone' style={{'display':'none'}}>
                </div>
              </li>
            </ul>
          </ul>
        </div>
      );
    } else {
      return null;
    }
  }
});

module.exports = HomeTeamTree;
