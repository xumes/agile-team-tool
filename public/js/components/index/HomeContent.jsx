var React = require('react');
var api = require('../api.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var HomeHighlightBox = require('./HomeHighlightBox.jsx');
var HomeTeamHeader = require('./HomeTeamHeader.jsx');
var HomeIterSection = require('./HomeIterSection.jsx');
var HomeAseSection = require('./HomeAseSection.jsx');
var HomeMemberTable = require('./HomeMemberTable.jsx');
var InlineSVG = require('svg-inline-react');
var HomeChartFilter = require('./HomeChartFilter.jsx');
var HomeAseSummary = require('./HomeAseSummary.jsx');
var HomeAseSummaryHide = require('./HomeAseSummaryHide.jsx');
var HomeNoTeamContent = require('./HomeNoTeamContent.jsx');
var chartStatus = require('./chartStatus.jsx').chartStatus;

var HomeContent = React.createClass({
  getInitialState: function() {
    return {
      showAseSummary: true,
    };
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    // if (nextProps.loadDetailTeam == this.props.loadDetailTeam) {
    //   return false;
    // } else {
    //   return true;
    // }
    // console.log('aaa');
    // console.log(this.state.showAseSummary);
    if (_.isEmpty(this.props.loadDetailTeam) && _.isEmpty(nextProps.loadDetailTeam)) {
      return false;
    } else if (_.isEmpty(this.props.loadDetailTeam) && !_.isEmpty(nextProps.loadDetailTeam)) {
      return true
    } else {
      if (nextProps.loadDetailTeam.team && nextProps.loadDetailTeam.team.members && this.props.loadDetailTeam.team.members != nextProps.loadDetailTeam.team.members) {
        return true;
      } else if (nextProps.loadDetailTeam.team && nextProps.loadDetailTeam.team.links && this.props.loadDetailTeam.team.links != nextProps.loadDetailTeam.team.links){
        return true;
      } else {
        return false;
      }
    }
  },
  showHideAseSummary: function() {
    if (chartStatus.assessmentSummaryShow) {
      $('.home-assessment-summary-hide').show();
      $('.home-assessment-summary').hide();
      chartStatus.assessmentSummaryShow = false;
    } else {
      $('.home-assessment-summary-hide').hide();
      $('.home-assessment-summary').show();
      chartStatus.assessmentSummaryShow = true;
    }
  },
  // handleResize: function(e) {
  //   $(Highcharts.charts).each(function(i,chart) {
  //     if (chart == null) return;
  //     if ($('#' + $(chart.container).attr('id')).length > 0) {
  //       var height = chart.renderTo.clientHeight;
  //       var width = chart.renderTo.clientWidth;
  //       chart.setSize(width, height);
  //     }
  //   });
  // },

  componentDidMount: function() {
    window.addEventListener('resize', this.props.handleChartResize);
    $('.home-trends-block-filter-img svg').attr('title','Filter Trends').children('title').remove();
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.props.handleChartResize);
  },

  componentDidUpdate: function() {
    $('.home-trends-overflow').nanoScroller();
    var isSquad = this.props.loadDetailTeam.team.type == 'squad';
    var submittedAssessment = null;
    if (isSquad && this.props.loadDetailTeam.assessments) {
      submittedAssessment = _.find(this.props.loadDetailTeam.assessments, function(assessment) {
        return _.isEqual(assessment.assessmentStatus, 'Submitted');
      })
    }
    $('.home-trends-block-filter-img, .home-chart-filter-block, .home-trends-block-title, .home-assessment-summary, .home-team-header').unbind('mouseenter mouseleave');
    // filter button
    if (!isSquad || ((this.props.loadDetailTeam.iterations && this.props.loadDetailTeam.iterations.length > 0) || submittedAssessment)) {
      $('.home-trends-block-filter-img svg').css('cursor', 'default');
      $('.home-trends-block-title').show();
      if (!$('.home-trends-overflow').hasClass('nano'))
        $('.home-trends-overflow').addClass('nano');
      $('.home-trends-block-filter-img').bind('mouseenter', function() {
        if ($('.home-chart-filter-block').css('display') == 'none') {
          if (isSquad) {
            $('.home-chart-filter-block').css('left', '32.5%');
          } else {
            $('.home-chart-filter-block').css('left', '-2.5%');
          }
          $('.home-chart-filter-block').fadeIn();
        }
      });
      $('.home-chart-filter-block').bind('mouseleave', function() {
        if ($('.home-chart-filter-block').css('display') != 'none' && $('.home-chart-filter-block').attr('data-open') != 'true') {
          $('.home-chart-filter-block').fadeOut();
        }
      });
      $('.home-assessment-summary, .home-team-header').bind('mouseenter', function() {
        $('.home-chart-filter-block').trigger('mouseleave');
      });
    } else {
      $('.home-trends-block-filter-img svg').css('cursor', 'pointer');
      $('.home-trends-block-title').hide();
      $('.home-trends-overflow').removeClass('nano');
    }
  },
  showFilter: function() {
    $('.home-chart-filter-block').attr('data-open', 'true');
    $('.home-chart-filter-block').trigger('mouseenter');
  },
  closeFilter: function() {
    $('.home-chart-filter-block').attr('data-open', 'false');
    $('.home-chart-filter-block').trigger('mouseleave');
  },
  iterationGraphArea: function(sectionId) {
    var charts = $('#'+sectionId+' > .container-body-col-2-1');
    var chartLength = 0;
    _.each(charts, function(chart){
      if ($('#'+chart.id).css('display') != 'none') {
        chartLength++;
      }
    });

    var chartHeight = '';
    var secHeight = '';
    switch (Math.floor((chartLength+1)/2)) {
      case 0:
        chartHeight = '0';
        secHeight = '0';
        break;
      case 1:
        chartHeight = '98%';
        secHeight = '26.45%';
        break;
      case 2:
        chartHeight = '48%';
        secHeight = '52.9%';
        break;
      case 3:
        chartHeight = '31%';
        secHeight = '79.35%';
        break;
      case 4:
        chartHeight = '23%';
        secHeight = '105.8%';
        break;
    }
    $('#iterationSection').css('height',secHeight);
    $('#'+sectionId+' > .container-body-col-2-1').css('height',chartHeight);
    $('.home-trends-overflow').nanoScroller();
  },
  assessmentGraphArea: function(sectionId) {
    var chartBlock = $('#'+sectionId+' .container-body-columns-ase, '+'#'+sectionId+' .container-body-col-2-1');
    var chartLength = 0;
    _.each(chartBlock, function(block){
      if ($('#'+block.id).css('display') != 'none') {
        chartLength++;
      }
    });
    var chartHeight = '';
    var secHeight = '';
    if (sectionId == 'nsquad_assessment_card') {
      switch (chartLength) {
        case 0:
          chartHeight = '0';
          secHeight = '0';
          break;
        default:
          chartHeight = '75%';
          secHeight = '50%';
      }
      $('#assessmentSection').css('height',secHeight);
      $('#'+sectionId+' > .container-body-col-2-1').css('height',chartHeight);
    } else {
      switch (chartLength) {
        case 0:
          chartHeight = '0';
          secHeight = '0';
          break;
        case 1:
          chartHeight = '60%';
          secHeight = '50%';
          break;
        case 2:
          chartHeight = '40%';
          secHeight = '70%';
          break;
        case 3:
          chartHeight = '28%';
          secHeight = '105%';
          break;
      }
      $('#assessmentSection').css('height',secHeight);
      $('#'+sectionId+' .container-body-columns-ase').css('height',chartHeight);
    }
    $('.home-trends-overflow').nanoScroller();
  },
  render: function() {
    var partialName = 'Partial Data';
    if (this.props.loadDetailTeam.team) {
      if (this.props.loadDetailTeam.team.type == 'squad') {
        partialName = 'Team Change';
      } else {
        partialName = 'Partial Data';
      }
    }
    return (
      <div style={{'width': '100%', 'height': '100%'}}>
        <HomeSpinner id={'contentSpinner'}/>
        <div id='bodyContent' style={{'height':'100%','width':'100%'}}>
          <HomeHighlightBox />
          <HomeTeamHeader loadDetailTeam={this.props.loadDetailTeam} selectedTeamChanged={this.props.selectedTeamChanged} tabClickedHandler={this.props.tabClickedHandler} updateTeamLink={this.props.updateTeamLink} updateTeamDetails={this.props.updateTeamDetails} reloadTeamMembers={this.props.reloadTeamMembers} roles={this.props.roles} />
          <HomeAseSummary loadDetailTeam={this.props.loadDetailTeam} showHideAseSummary={this.showHideAseSummary}/>
          <HomeAseSummaryHide loadDetailTeam={this.props.loadDetailTeam} showHideAseSummary={this.showHideAseSummary}/>
          <div class='home-trends-block'>
            <div class='home-trends-block-title'>
              <h1>Trends</h1>
              <span></span>
              <h4>&nbsp;/&nbsp;</h4>
              <h4 style={{'color':'#FFA501'}}>---</h4>
              <h4>&nbsp;/&nbsp;</h4>
              <h4 style={{'color':'#FFA501'}}>*</h4>
              <h4 id='partialName'>&nbsp;{partialName}</h4>
              <div class='home-trends-block-filter-img' onClick={this.showFilter} >
                <InlineSVG src={require('../../../img/Att-icons/att-icons_filter.svg')}></InlineSVG>
              </div>
              <HomeChartFilter loadDetailTeam={this.props.loadDetailTeam} closeFilter={this.closeFilter} iterationGraphArea={this.iterationGraphArea} assessmentGraphArea={this.assessmentGraphArea}/>
            </div>
            <div class='home-trends-overflow nano'>
              <div class='nano-content'>
                <HomeIterSection loadDetailTeam={this.props.loadDetailTeam} iterationGraphArea={this.iterationGraphArea} setSelectedIteration={this.props.setSelectedIteration}/>
                <HomeAseSection loadDetailTeam={this.props.loadDetailTeam} assessmentGraphArea={this.assessmentGraphArea}/>
              </div>
            </div>
          </div>
        </div>
        <HomeNoTeamContent />
      </div>
    )
  }
});

module.exports = HomeContent;
