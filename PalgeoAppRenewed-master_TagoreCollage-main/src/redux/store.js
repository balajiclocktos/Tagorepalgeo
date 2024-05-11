import {createStore, combineReducers, applyMiddleware} from 'redux';
import fetchReducer from './reducer';
const thunkMiddleWare = require('redux-thunk').default;
//import {composeWithDevTools} from '@reduxjs/toolkit/dist/devtoolsExtension';
const rootReducer = combineReducers({fetchReducer});
const configureStore = () => {
  return createStore(rootReducer, applyMiddleware(thunkMiddleWare));
};
export default configureStore;
