var React = require('react');
var api = require('../api.jsx');

var HomeHighlightBox = React.createClass({
  render: function() {
    var boxStyle= {
      'textAlign': 'center',
      'display': 'none'
    }
    return (
      <div id="no-teams-highlightbox" style={boxStyle} class="ibm-col-6-4">
        <div class="_grid">
            <div class="_tight">
                <div class="highlight-box--NOTIFY">
                    <div class="highlight-box--message--NO-IMAGE">
                        <div class="markdown">
                            <p>You are not currently a member of any teams. Click "All teams" to view data for existing teams, or click Team Management to create a new team.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeHighlightBox;
