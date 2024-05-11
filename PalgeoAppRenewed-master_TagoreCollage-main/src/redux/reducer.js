import * as types from './actionTypes';

const initialState = {
  loading: false,
  error: null,
  data: null,
};
const fetchReducer = (state = initialState, action) => {
  const {FETCH_SUCCESS, FETCH_ERROR, FETCH_LOADING} = types;
  switch (action.type) {
    case FETCH_LOADING:
      return {
        ...state,
        loading: true,
      };
    case FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    case FETCH_ERROR:
      return {
        ...state,
        loading: false,
        data: null,
        error: action.payload,
      };
    default:
      return state;
  }
};
export default fetchReducer;
