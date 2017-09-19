require('./wizard.scss');
const PropTypes = require('prop-types');
const React = require('react');

class Wizard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      hideBtnPrevious: true,
      hideBtnNext: false,
    };
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.close = this.close.bind(this);
  }
  nextPage() {
    this.setState({ page: this.state.page + 1 }, () => {
      if (this.state.page !== 1) {
        this.state.hideBtnPrevious = false;
        if (this.state.page === 4) {
          this.state.hideBtnNext = true;
        }
      }
    });
  }
  previousPage() {
    this.setState({ page: this.state.page - 1 }, () => {
      console.log('clicked previous button: ', this.state.page);
      if (this.state.page === 1) {
        this.state.hideBtnPrevious = true;
      }
    });
  }
  close() {
    this.props.onClose();
    console.log('we are closing the page:');
  }
  render() {
    const navButtons = [
      {
        id: 'btnPrevious',
        label: 'Previous',
        class: 'ibm-btn-pri ibm-btn-small ibm-btn-blue-50 u-mr-sm',
        onClick: this.previousPage,
      },
      {
        id: 'btnNext',
        label: 'Next',
        class: 'ibm-btn-pri ibm-btn-small ibm-btn-blue-50 u-mr-sm',
        onClick: this.nextPage,
      },
      {
        id: 'btnCancel',
        label: 'Cancel',
        class: 'ibm-btn-sec ibm-btn-small ibm-btn-blue-50 u-mr-sm',
        onClick: this.close,
      },
    ];
    const listNavButtons = navButtons
      .map(button =>
        (<button
          className={button.class}
          id={button.id}
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
