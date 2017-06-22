var React = require('react');
var _ = require('underscore');
var AssessmentTemplateCriteria = require('./AssessmentTemplateCriteria.jsx');
var AssessmentLinks = require('./AssessmentLinks.jsx').links;
var AssessmentTemplateLevel = React.createClass({
  componentDidMount: function() {
    $('a[data-widget=\'tooltip\']').tooltip();
    $('.iradio_square-blue').hover(function(){
      if ($('input[type=\'radio\']').prop('disabled')) {
        return;
      }
      $(this).addClass('hover');
    }, function(){
      if ($('input[type=\'radio\']').prop('disabled')) {
        return;
      }
      $(this).removeClass('hover');
    })
  },
  currClickHandler: function(params) {
    var practiceId = params[0];
    var levelCurrId = params[1];
    var clickValue = params[2];
    if ($('#'+levelCurrId+' > div > input').prop('disabled')) {
      return;
    }
    if ($('#' + practiceId + '_ans').html() == 'Not answered') {
      $('#' + practiceId + '_ans').html('Current: ' + clickValue + ' | Target: ---')
    } else {
      var currString = $('#' + practiceId + '_ans').html();
      var index = currString.indexOf(' | Target');
      var replaceString = currString.substring(index, currString.length);
      $('#' + practiceId + '_ans').html('Current: ' + clickValue + replaceString);
    }
    $('#' + practiceId + ' > a').css('background', '');
  },
  targClickHandler: function(params) {
    var practiceId = params[0];
    var levelCurrId = params[1];
    var clickValue = params[2];
    if ($('#'+levelCurrId+' > div > input').prop('disabled')) {
      return;
    }
    if ($('#' + practiceId + '_ans').html() == 'Not answered') {
      $('#' + practiceId + '_ans').html('Current: --- | Target: ' + clickValue);
    } else {
      var currString = $('#' + practiceId + '_ans').html();
      var index = currString.indexOf('Target');
      var replaceString = currString.substring(0, index);
      $('#' + practiceId + '_ans').html(replaceString + 'Target: ' + clickValue);
    }
    $('#' + practiceId + ' > a').css('background', '');
  },
  render: function() {
    var self = this;
    var currStyle = {
      'position': 'absolute',
      'top': '-20%',
      'left': '-20%',
      'display': 'block',
      'width': '140%',
      'height': '140%',
      'margin': '0px',
      'padding': '0px',
      'background': 'rgb(255, 255, 255)',
      'border': '0px',
      'opacity': '0'
    };
    if (_.isEmpty(self.props.levels)) {
      return null;
    } else {
      var count = 0
      var practiceId = self.props.practiceId;
      var levelMainId = practiceId + '_';
      var levels = self.props.levels.map(function(level){
        var levelId = levelMainId + 'tbtr' + '_' + count;
        var levelCurrId = levelMainId + 'td' + '_curr_' + count;
        var levelTargId = levelMainId + 'td' + '_targ_' + count;
        var levelIndId = levelMainId + 'td' + '_ind_' + count;
        var practiceCurrName = levelMainId + 'curr';
        var practiceTargName = levelMainId + 'targ';
        var clickValue = 'Initiating';
        switch (count) {
          case 0:
            clickValue='Initiating';
            break;
          case 1:
            clickValue='Practicing';
            break;
          case 2:
            clickValue='Transforming';
            break;
          case 3:
            clickValue='Scaling';
            break;
        }
        count ++ ;
        return (
          <div key={levelId} id={levelId} class='agile-table-level'>
            <div style={{'width': '15%'}}>
              <h1 style={{'padding': '0.5em 0 0.5em 0'}}>{level.name}</h1>
            </div>
            <div style={{'width': '72%'}}>
              <AssessmentTemplateCriteria criterias={level.criteria} levelId={levelId}/>
            </div>
            <div style={{'width': '6.5%'}} class='agile-question-opt ibm-background-cool-gray-20'>
              <input data-init="false" class="ibm-styled-radio" type="radio" id={levelCurrId} name={practiceCurrName} value={clickValue} aria-label={clickValue} onClick={self.currClickHandler.bind(null, [practiceId, levelCurrId, clickValue])}/>
              <label for={levelCurrId} title={clickValue}><span style={{'display':'none'}}>{clickValue}</span></label>
            </div>
            <div style={{'width': '6.5%'}} class='agile-question-opt ibm-background-cool-gray-20'>
              <input data-init="false" class="ibm-styled-radio" type="radio" id={levelTargId} name={practiceTargName} value={clickValue} aria-label={clickValue} onClick={self.targClickHandler.bind(null, [practiceId, levelTargId, clickValue])}/>
              <label for={levelTargId} title={clickValue}><span style={{'display':'none'}}>{clickValue}</span></label>
            </div>
          </div>
        )
      });
      var currTT = "Your team's current maturity level.";
      var targTT = "Your team's targets for the next 90 days.  Choose the practices that the team agrees will have the most impact.";
      return (
        <div class='agile-table' summary='Maturity assessment level and description for the identified practice.'>
          <div class='agile-table-summary'>{this.props.description}</div>
          <h1 class='assessmet-improve-link'>{AssessmentLinks[this.props.name]['description']}<a target='_blank' href={'http://' + AssessmentLinks[this.props.name]['link']}>{AssessmentLinks[this.props.name]['link']}</a></h1>
            <div class='agile-table-header'>
                <div style={{'width': '15%'}}>
                  <h1>Maturity level</h1>
                </div>
                <div style={{'width': '7%', 'left': '72%'}} id={levelMainId+'th_curr'}>
                  <h1>
                    {'Current'}
                  </h1>
                  <a class='ibm-information-link' data-widget='tooltip' style={{'cursor': 'default', 'position': 'relative', 'left': '5%', 'top': '0%', 'display': 'inline'}} title={currTT}>
                    <span class='ibm-access'>Tooltip</span>
                  </a>
                </div>
                <div style={{'width': '7%', 'left': '72%'}} id={levelMainId+'th_targ'}>
                  <h1>
                    {'Target'}
                  </h1>
                  <a class='ibm-information-link' data-widget='tooltip' style={{'cursor': 'default', 'position': 'relative', 'left': '5%', 'top': '0%', 'display': 'inline'}} title={targTT}>
                    <span class='ibm-access'>Tooltip</span>
                  </a>
                </div>
            </div>
            <div class='agile-table-body'>
              {levels}
             <div id={levelMainId + 'tbtr_action'} class='agile-table-textarea'>
                <div id={levelMainId + 'td_action'}>
                  <h1>{'How do we get better? (Action plan item; 350 char limit)'}</h1>
                  <textarea aria-label='Action plan item' maxLength='350' id={levelMainId + 'action'} placeholder={AssessmentLinks[this.props.name]['description'] + AssessmentLinks[this.props.name]['link']}>
                  </textarea>
                </div>
              </div>
            </div>
        </div>
      )
    }
  }
});
module.exports = AssessmentTemplateLevel;
