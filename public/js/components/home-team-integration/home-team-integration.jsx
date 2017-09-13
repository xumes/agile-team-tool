const React = require('react');
const CommonModal = require('../common-modal/common-modal.jsx');
const InlineSVG = require('svg-inline-react');
const confirmIcon = require('../../../img/Att-icons/att-icons_confirm.svg');


class HomeTeamIntegration extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
    };

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  show() {
    this.setState({
      showModal: true,
    });
  }

  hide() {
    this.setState({
      showModal: false,
    });
  }

  render() {
    const styles = {
      height: '100%',
      display: 'inline',
    };

    return (
      <div style={styles}>
        <div
          className="home-team-header-teamname-btn"
          id="homeHeaderIntegrationBtn"
          onClick={this.show}
          role="button"
          tabIndex="0"
        >
          <InlineSVG
            title="Configure Agile Tool Integration"
            class="home-team-header-teamname-btn-img"
            src={confirmIcon}
          />
        </div>

        <CommonModal
          heading="Integration"
          show={this.state.showModal}
          onHide={this.hide}
        >
          WIZARD GOES HERE!!
        </CommonModal>
      </div>
    );
  }
}

module.exports = HomeTeamIntegration;
