import * as types from './actionTypes';
import axios from 'axios';
import Const from '../components/common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const apiLoading = () => {
  return {
    type: types.FETCH_LOADING,
  };
};
export const apiSuccess = data => {
  return {
    type: types.FETCH_SUCCESS,
    payload: data,
  };
};
export const apiError = error => {
  return {
    type: types.FETCH_ERROR,
    payload: error,
  };
};

export const handleRegister = async (mobileNumber, code) => {
  try {
    const response = await axios.post(Const + 'api/MobileApp/RegisterMPIN', {
      mobileNumber,
      mpin: code.toString(),
    });
    return true;
  } catch (e) {
    return false;
  }
};

export const handleLoginRequest = (code, mobileNumber, navigation) => {
  return async dispatch => {
    dispatch(apiLoading());
    try {
      const response = await axios.post(Const + 'api/Security/Mobilelogin', {
        mobileNumber,
        mpin: code.toString(),
      });
      const {isAuthenticated} = response.data;
      if (!isAuthenticated) {
        return dispatch(apiError('Enter valid mpin'));
      }
      if (isAuthenticated) {
        await AsyncStorage.setItem('mobile', mobileNumber);
        await AsyncStorage.setItem('mpin', code.toString());
        await AsyncStorage.setItem('bearer_token', response.data.bearerToken);
        const result = await handleRegister(mobileNumber, code);
        console.log('result', result);
        if (!result) {
          return dispatch(apiError('Invalid mpin.'));
        }
        navigation.replace('MainNavigator');
        dispatch(apiSuccess(response.data));
      }
    } catch (e) {
      dispatch(apiError(e.message));
    }
  };
};
