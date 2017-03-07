var React = require('react');
var _ = require('underscore');
var AssessmentTemplateCriteria = require('./AssessmentTemplateCriteria.jsx');
var AssessmentTemplateLevel = React.createClass({
  componentDidMount: function() {
    $("a[data-widget='tooltip']").tooltip();
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
    $('#' + practiceId + ' .curr.checked').removeClass('checked');
    $('#' + levelCurrId + ' .iradio_square-blue.curr').addClass('checked');
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
    $('#' + practiceId + ' .targ.checked').removeClass('checked');
    $('#' + levelCurrId + ' .iradio_square-blue.targ').addClass('checked');
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
            <div style={{'width': '6.5%'}} id={levelCurrId} class='agile-question-opt ibm-background-cool-gray-20'>
              <div class='iradio_square-blue curr' role='radio' aria-checked='false' aria-disabled='false' aria-label='Maturity level' style={{'position': 'relative', 'width': '22px','left':'25%'}}>
                <input type='radio' name={levelCurrId} value={clickValue} aria-label={clickValue} style={currStyle}/>
                <ins class='iCheck-helper' style={currStyle} onClick={self.currClickHandler.bind(null, [practiceId, levelCurrId, clickValue])}></ins>
              </div>
            </div>
            <div style={{'width': '6.5%'}} id={levelTargId} class='agile-question-opt ibm-background-cool-gray-20'>
              <div class='iradio_square-blue targ' role='radio' aria-checked='false' aria-disabled='false' aria-label='Maturity level' style={{'position': 'relative', 'width': '22px','left':'25%'}}>
                <input type='radio' name={levelTargId} value={clickValue} aria-label={clickValue} style={currStyle}/>
                <ins class='iCheck-helper' style={currStyle} onClick={self.targClickHandler.bind(null, [practiceId, levelTargId, clickValue])}></ins>
              </div>
            </div>
            {/*<td></td>*/}
          </div>
        )
      });
      var currTT = "Your team's current maturity level.";
      var targTT = "Your team's targets for the next 90 days.  Choose the practices that the team agrees will have the most impact.";
      return (
        <div class='agile-table' summary='Maturity assessment level and description for the identified practice.'>
          <div class='agile-table-summary'>{this.props.description}</div>
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
{/*              <tr id={levelMainId + 'tbtr_action'}>
                <td id={levelMainId + 'td_action'} colSpan='5'>How do we get better? (Action plan item; 350 char limit)
                  <br />
                  <textarea style={{'width': '1120px', 'margin': '0px', 'height': '69px'}} cols='350' rows='3' aria-label='Action plan item' maxLength='350' id={levelMainId + 'action'}>
                  </textarea>
                </td>
              </tr>*/}
            </div>
        </div>
      )
    }
  }
});
module.exports = AssessmentTemplateLevel;
