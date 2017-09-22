// action types
const GOTO_PAGE = 'GOTO_PAGE';
const CLOSE_WIZARD = 'CLOSE_WIZARD';

const initialState = {};

// actions
const goToPage = pageNumber => ({ type: GOTO_PAGE, pageNumber });
const closeWizard = () => ({ type: CLOSE_WIZARD });

// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GOTO_PAGE:
      return { ...state, page: action.pageNumber };
    default:
      return state;
  }
};

module.exports = {
  reducer,
  goToPage,
  closeWizard,
};
