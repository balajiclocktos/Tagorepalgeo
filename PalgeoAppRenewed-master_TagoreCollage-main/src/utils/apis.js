import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import url from '../components/common/Constants';
import {asyncStorageDataFetch} from './helperFunctions';
export const tokenApi = async () => {
  const token = await AsyncStorage.getItem('bearer_token');
  return axios.create({
    baseURL: url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
  });
};

export const noTokenAPi = axios.create({
  baseURL: url,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAllReportees = async () => {
  const user_id = await asyncStorageDataFetch('user_id');
  const institute_id = await asyncStorageDataFetch('institute_id');
  const request ={
    staffCode: user_id,
    InstituteId: Number(institute_id),
    Date: new Date().toISOString(),
  }
  console.log("getallreportspayload",request);
  try {
    const res = await tokenApi();
    const response = await res.post('api/Staff/GetAllReporteesOfManager', request);
    return response.data;
  } catch (error) {
    return [];
  }
};
