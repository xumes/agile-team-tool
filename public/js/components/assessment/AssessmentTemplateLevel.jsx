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
  currClickHandler: function(practiceId, levelCurrId, clickValue) {
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
  targClickHandler: function(practiceId, levelCurrId, clickValue) {
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
          <tr key={levelId} id={levelId}>
            <td>{level.name}</td>
            <td>
              <AssessmentTemplateCriteria criterias={level.criteria} levelId={levelId}/>
            </td>
            <td id={levelCurrId} class='agile-question-opt ibm-background-cool-gray-20'>
              <div class='iradio_square-blue curr' role='radio' aria-checked='false' aria-disabled='false' aria-label='Maturity level' style={{'position': 'relative'}}>
                <input type='radio' name={levelCurrId} value={clickValue} aria-label={clickValue} style={currStyle}/>
                <ins class='iCheck-helper' style={currStyle} onClick={()=>self.currClickHandler(practiceId, levelCurrId, clickValue)}></ins>
              </div>
            </td>
            <td id={levelTargId} class='agile-question-opt ibm-background-cool-gray-20'>
              <div class='iradio_square-blue targ' role='radio' aria-checked='false' aria-disabled='false' aria-label='Maturity level' style={{'position': 'relative'}}>
                <input type='radio' name={levelTargId} value={clickValue} aria-label={clickValue} style={currStyle}/>
                <ins class='iCheck-helper' style={currStyle} onClick={()=>self.targClickHandler(practiceId, levelTargId, clickValue)}></ins>
              </div>
            </td>
            {/*<td></td>*/}
          </tr>
        )
      });
      return (
        <table class='ibm-data-table ibm-altrows agile-practice' width='100%' summary='Maturity assessment level and description for the identified practice.'>
          <caption>{this.props.description}</caption>
            <thead>
              <tr>
                <th scope='col' width='15%'>Maturity level</th>
                <th scope='col' width='75%'></th>
                <th scope='col' width='5%' id={levelMainId+'th_curr'} style={{'left': '-1%', 'textAlign': 'center', 'position': 'relative'}}>
                  Current
                  <a class='ibm-information-link' data-widget='tooltip' style={{'cursor': 'default', 'position': 'relative', 'left': '5%', 'top': '0%', 'display': 'inline'}} data-contentid='currTooltip'>
                    <span class='ibm-access'>Tooltip</span>
                  </a>
                </th>
                <th scope='col' width='5%' id={levelMainId+'th_targ'} style={{'textAlign': 'center'}}>
                  Target
                  <a class='ibm-information-link' data-widget='tooltip' style={{'cursor': 'default', 'position': 'relative', 'left': '5%', 'top': '0%', 'display': 'inline'}} data-contentid='targTooltip'>
                    <span class='ibm-access'>Tooltip</span>
                  </a>
                </th>
                {/*<th scope='col' width='10%' id={levelMainId+'th_ind'} style={{'textAlign': 'center', 'display':'none'}}></th>*/}
              </tr>
            </thead>
            <tbody>
              {levels}
              <tr id={levelMainId + 'tbtr_action'}>
                <td id={levelMainId + 'td_action'} colSpan='5'>How do we get better? (Action plan item; 350 char limit)
                  <br />
                  <textarea style={{'width': '1120px', 'margin': '0px', 'height': '69px'}} cols='350' rows='3' aria-label='Action plan item' maxLength='350' id={levelMainId + 'action'}>
                  </textarea>
                </td>
              </tr>
            </tbody>
        </table>
      )
    }
  }
});
module.exports = AssessmentTemplateLevel;
