require('./wizard.scss');
const PropTypes = require('prop-types');
const React = require('react');

class Wizard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      previousLabel: 'Previous',
      nextLabel: 'Next',
    };
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.close = this.close.bind(this);
  }
  nextPage() {
    this.setState({ page: this.state.page + 1 }, () => {
    });
  }
  previousPage() {
    this.setState({ page: this.state.page - 1 }, () => {
    });
  }
  close() {
    this.props.onClose();
  }
  render() {
    const navButtons = [
      {
        label: this.state.previousLabel,
        class: 'ibm-btn-pri ibm-btn-small ibm-btn-blue-50 u-mr-sm',
        onClick: this.previousPage,
      },
      {
        label: this.state.nextLabel,
        class: 'ibm-btn-pri ibm-btn-small ibm-btn-blue-50 u-mr-sm',
        onClick: this.nextPage,
      },
      {
        label: 'Cancel',
        class: 'ibm-btn-sec ibm-btn-small ibm-btn-blue-50 u-mr-sm',
        onClick: this.close,
      },
    ];
    const listNavButtons = navButtons
      .map(button =>
        (<button
          className={button.class}
          onClick={button.onClick}
        >{button.label}</button>),
      );

    const displayedChild = this.props.children
      .filter(child => child.props.page === this.state.page);

    return (
      <div className="content-container">
        <div className="content">
          {displayedChild}
        </div>
        <footer className="footer-wizard">
          {listNavButtons}
        </footer>
      </div>
    );
  }
}

Wizard.defaultProps = {
  children: undefined,
  navButtons: [],
  onClose: null,
};

Wizard.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func,
};

module.exports = Wizard;
