import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {CustomButton} from '../common/CustomButton';
import CustomLabel from '../common/CustomLabel';
import CustomMap from '../common/CustomMap';
import CustomModalTextArea from '../common/CustomModalTextArea';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import SubHeader from '../common/SubHeader';
import moment from 'moment';
import {Colors} from '../../utils/configs/Colors';
import CameraComp from '../common/CameraComp';
import ImageCropPicker from 'react-native-image-crop-picker';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import axios from 'axios';
import Const from '../../components/common/Constants';
import Loader from '../common/Loader';
import CustomModal from '../common/CustomModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Avatar, Icon, ListItem} from 'react-native-elements';
import {
  getUserInfo,
  validatePointWithinCircle,
} from '../../utils/helperFunctions';
import Geolocation from 'react-native-geolocation-service';
import AnimatedLoader from '../common/AnimatedLoader';

const geolib = require('geolib');

const Appointment = ({navigation, route}) => {
  const appointment = route?.params?.item;
  const [OTPAlert, setOTPAlert] = useState(false);
  const [otp, setOtp] = useState('');
  const [pinAlert, setPinAlert] = useState(false);
  const [pin, setPin] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [camera, setCamera] = useState(false);
  const [loader, setLoader] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    fetchCurrentUser();
    fetchCurrentLocation();
    console.log('appointment', appointment);
  }, []);

  const fetchCurrentLocation = () => {
    const options = {
      enableHighAccuracy: true,
      distanceFilter: 0,
      maximumAge: 0,
    };
    Geolocation.getCurrentPosition(success, error, options);
  };

  const success = pos => {
    setLatitude(pos.coords.latitude);
    setLongitude(pos.coords.longitude);
  };

  const error = error =>
    alert(
      'Error retreiving your current location. Please check your GPS connection.',
    );

  const fetchCurrentUser = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const institute_id = await AsyncStorage.getItem('institute_id');
      const profile_pic = await AsyncStorage.getItem('profile_pic');
      const user_name = await getUserInfo(user_id, institute_id);
      setCurrentUser(user_id);
      setCurrentUserName(user_name);
      setProfilePhoto(profile_pic);
    } catch (e) {
      alert('No user login. Please login again');
    }
  };

  const uploadAttachments = async () => {
    try {
      const images = await ImageCropPicker.openPicker({
        width: 300,
        height: 400,
        multiple: true,
      });
      setAttachments([...attachments, ...images]);
      setLoader(true);
      console.log('images==>', images);
      await uploadAllAttachments(images);
      setLoader(false);
    } catch (e) {
      console.log(e);
    }
  };

  const uploadAllAttachments = async images => {
    console.log('images+PARAM', images);
    try {
      const institute_id = await AsyncStorage.getItem('institute_id');
      const url = `${Const}api/GeoFencing/TravelCheckin/Attachment`;
      let uploadData = new FormData();
      uploadData.append('InstituteId', Number(institute_id));
      uploadData.append('AppointmentId', appointment.appointmentId);
      images.forEach((e, i) => {
        console.log(e);
        uploadData.append('Files', {
          uri: e.path,
          type: e.mime,
          name: 'photo.png',
        });
      });

      const body = uploadData;
      console.log('body', JSON.stringify(body, null, 4));

      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const {data} = response;
      console.log('data', data);
      alert(data.message);
    } catch (e) {
      alert('Error saving attachments: ' + e);
    }
  };

  const openCamera = async () => {
    try {
      const image = await ImageCropPicker.openCamera({
        width: 300,
        height: 400,
        compressImageQuality: 0.1,
      });
      setLoader(true);
      console.log(image);
      setAttachments([...attachments, image]);
      let images = [];
      images.push(image);
      await uploadAllAttachments(images);
      setLoader(false);
    } catch (e) {
      console.log(e);
    }
  };

  const getOTP = async () => {
    setLoader(true);
    const url = `${Const}api/GeoFencing/TravelCheckin/SendOtp`;
    const body = {
      MobileNo: appointment.phoneNumber,
      haskKey: 'string',
      CountryCode: appointment.countryCode || '+91',
    };
    try {
      const response = await axios.post(url, body);
      const data = response.data;
      console.log(data);
      if (data.status) {
        setLoader(false);
        //alert(data.message);
        setOTPAlert(true);
      }
    } catch (e) {
      setLoader(false);
      alert('Error sending otp: ' + e);
    }
  };
  const faceRegister = () => {
    setCamera(true);
  };

  const takePicture = async camera => {
    const options = {quality: 0, base64: true};
    const point = validatePointWithinCircle(getCenter(), getCoordinates());
    if (!point) {
      setCamera(false);
      return alert(
        'You are not at your appointed location. Please register face from the appointed location.',
      );
    }

    try {
      // const user_id = await AsyncStorage.getItem('user_id');
      const institute_id = await AsyncStorage.getItem('institute_id');
      const image = await camera.takePictureAsync(options);
      setLoader(true);
      //check for location

      //call face register api
      console.log('image', image.uri);
      const url = `${Const}api/GeoFencing/TravelCheckin/FaceRecognition`;
      let uploadData = new FormData();
      uploadData.append('StaffCode', currentUser);
      uploadData.append('InstituteId', institute_id);
      uploadData.append('File', {
        name: 'photo.png',
        uri: image.uri,
        type: 'image/png',
      });
      uploadData.append('AppointmentId', appointment.appointmentId);

      //console.log('body_camera ==>', body);
      const response = await axios.post(url, uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const {data} = response;
      alert(data.message);
    } catch (e) {
      alert('Error capturing photo: ' + e + '.Please try again');
    }
    setLoader(false);
    setCamera(false);
  };

  const verifyHandler = async () => {
    if (!otp) {
      return alert('Enter the 4 digit OTP');
    }

    const point = validatePointWithinCircle(getCenter(), getCoordinates());
    if (!point) {
      setOTPAlert(false);
      return alert('You are not at your appointed location.');
    }
    setLoader(true);
    const url = `${Const}api/GeoFencing/TravelCheckin/VerifyOtp`;
    const body = {
      MobileNumber: appointment.phoneNumber,
      OTP: otp,
    };
    try {
      const response = await axios.post(url, body);
      const data = response.data;

      console.log('data==', data);
      setLoader(false);
      if (!data) {
        return alert('Wrong otp! Please enter correct otp.');
      }

      setOtp('');
      setOTPAlert(false);
      alert('Otp verified successfully!');
    } catch (e) {
      alert('Error verifying otp: ' + e);
    }
  };

  const getCenter = () => {
    const center = {
      coordinates: [
        {latitude: appointment.latitude, longitude: appointment.longitude},
      ],
      radius: 100,
    };
    return center;
  };

  const getCoordinates = () => {
    const coordinates = {latitude, longitude};
    return coordinates;
  };

  const appointmentCompletionStatusHandler = async status => {
    const point = validatePointWithinCircle(getCenter(), getCoordinates());
    if (!point) {
      return alert(
        'You are not at your appointed location. Please submit the status from the appointed location.',
      );
    }
    const appointmentId = '006EF670-1B7A-4368-8540-4BEE046A7009';
    const url = `${Const}api/GeoFencing/TravelCheckin/Status`;
    try {
      const response = await axios.post(
        url,
        {},
        {
          params: {
            appointmentId: appointment.appointmentId || appointmentId,
            status,
          },
        },
      );
      const {data} = response;
      if (!data.status) return alert('Something went wrong. Please try again.');
      alert('Status saved successfully!');
      navigation.goBack();
    } catch (e) {
      alert('Error saving appointment status: ' + e);
    }
  };

  const pinHandler = async () => {
    if (!pin) {
      return alert('Enter the 4 digit MPIN');
    }
    const point = validatePointWithinCircle(getCenter(), getCoordinates());
    if (!point) {
      setPinAlert(false);
      setPin('');
      return alert(
        'You are not at your appointed location. Please register MPIN from the appointed location.',
      );
    }
    const appointmentId = '006EF670-1B7A-4368-8540-4BEE046A7009';
    const url = `${Const}api/GeoFencing/TravelCheckin/PinValidation`;
    console.log('url', url);
    try {
      const response = await axios.post(
        url,
        {},
        {
          params: {
            appointmentId: appointment.appointmentId || appointmentId,
            mpin: pin,
          },
        },
      );
      const {data} = response;
      if (!data.status)
        return alert('Something went wrong while verifying. Please try again.');
      alert('MPIN validated successfully!');
      setPin('');
      setPinAlert(false);
    } catch (e) {
      alert('Error verifying pin: ' + e);
    }
  };

  return (
    <>
      <SubHeader
        backScreen="Home"
        navigation={navigation}
        title={'Appointment Details'}
        showBack
      />
      {camera && (
        <CameraComp
          visible={camera}
          onClose={() => setCamera(false)}
          onPress={camera => takePicture(camera)}
          btnText={'face register'}
        />
      )}

      <AnimatedLoader doNotShowDeleteIcon isVisible={loader} />

      {OTPAlert && (
        <CustomModal
          isVisible={OTPAlert}
          deleteIconPress={() => setOTPAlert(false)}>
          <Text>Enter OTP to verify</Text>
          <OTPInputView
            style={{width: wp('80'), height: 80}}
            pinCount={4}
            autoFocusOnLoad={true}
            secureTextEntry={true}
            codeInputFieldStyle={styles.inputFeilds}
            codeInputHighlightStyle={styles.inputFeildsFocus}
            onCodeFilled={text => setOtp(text)}
          />

          <CustomButton
            title={'Verify'}
            color={Colors.mainHeader[0]}
            onPress={verifyHandler}
          />
        </CustomModal>
      )}
      {pinAlert && (
        <CustomModal
          isVisible={pinAlert}
          deleteIconPress={() => setPinAlert(false)}>
          <Text>Enter MPIN to verify</Text>
          <OTPInputView
            style={{width: wp('80'), height: 80}}
            pinCount={4}
            autoFocusOnLoad={true}
            secureTextEntry={true}
            codeInputFieldStyle={styles.inputFeilds}
            codeInputHighlightStyle={styles.inputFeildsFocus}
            onCodeFilled={text => setPin(text)}
          />

          <CustomButton
            title={'Verify'}
            color={Colors.mainHeader[0]}
            onPress={pinHandler}
          />
        </CustomModal>
      )}
      <ScrollView>
        <View style={[styles.container, {marginTop: '3%'}]}>
          <CustomLabel labelStyle={styles.label} title={'Meeting Time'} />
          <CustomModalTextArea
            rowSpan={2}
            value={
              `${moment(appointment?.startDateTime).format(
                'h: mm a',
              )} to ${moment(appointment?.endDateTime).format('h: mm a')}` ||
              'N/A'
            }
            disabled
          />
          <CustomLabel labelStyle={styles.label} title={'Event'} />
          <CustomModalTextArea
            rowSpan={2}
            value={appointment?.title || 'N/A'}
            disabled
          />
          <CustomLabel labelStyle={styles.label} title={'Customer Name'} />
          <CustomModalTextArea
            rowSpan={2}
            value={appointment?.companyName || 'N/A'}
            disabled
          />
          <CustomLabel
            labelStyle={styles.label}
            title={'Contact Person Name'}
          />
          <CustomModalTextArea
            rowSpan={2}
            value={appointment?.personName || 'N/A'}
            disabled
          />
          <CustomLabel labelStyle={styles.label} title={'Designation'} />
          <CustomModalTextArea
            rowSpan={2}
            value={appointment?.designation || 'N/A'}
            disabled
          />
          <CustomLabel labelStyle={styles.label} title={'Mobile No.'} />
          <CustomModalTextArea
            rowSpan={2}
            value={appointment?.phoneNumber.toString() || 'N/A'}
            disabled
          />
          <CustomLabel title={'Address'} />
          <CustomModalTextArea
            rowSpan={3}
            value={appointment?.address || 'N/A'}
            disabled
          />
        </View>
        <CustomMap
          latitude={appointment?.latitude || 22.222}
          longitude={appointment?.longitude || 78.2222}
          appointment
        />
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 10,
          }}>
          {/* {appointment?.faceRecognition && (
            <CustomButton
              // width={'20%'}
              marginBottom={10}
              onPress={faceRegister}
              title={'Face Register'}
              color={Colors.mainHeader[0]}
            />
          )} */}
          {appointment?.isPinValidation && (
            <CustomButton
              // width={'20%'}
              marginBottom={10}
              onPress={() => setPinAlert(true)}
              title={'Enter MPIN'}
              color={Colors.mainHeader[0]}
            />
          )}
          {appointment?.getOtp && (
            <CustomButton
              // width={'20%'}
              color={Colors.mainHeader[0]}
              onPress={getOTP}
              title={'Get OTP'}
            />
          )}

          <CustomButton
            //   width={'20%'}
            title={'Attachments'}
            onPress={() =>
              Alert.alert(
                'Choose one option',
                '',
                [
                  {text: 'CAMERA', onPress: () => openCamera()},
                  {text: 'GALLERY', onPress: () => uploadAttachments()},
                ],
                {
                  cancelable: true,
                },
              )
            }
            color={Colors.mainHeader[0]}
          />

          {/* {appointment?.isManualComplete && ( */}
          <CustomButton
            title={'Status'}
            onPress={() =>
              Alert.alert(
                'Confirmation',
                'Did you complete the task?',
                [
                  {
                    text: 'Yes',
                    onPress: () =>
                      appointmentCompletionStatusHandler('Completed'),
                  },
                  {
                    text: 'No',
                    onPress: () =>
                      appointmentCompletionStatusHandler('Not Completed'),
                    style: 'cancel',
                  },
                  {
                    text: 'Postponed',
                    onPress: () =>
                      appointmentCompletionStatusHandler('Postponed'),
                  },
                ],
                {cancelable: true},
              )
            }
            color={Colors.mainHeader[0]}
          />
          {/* )} */}
        </View>

        <View>
          {appointment?.faceRecognition && (
            <View>
              <CustomLabel
                title={'Face Register staffs:'}
                color={Colors.mainHeader[0]}
              />
              <ListItem bottomDivider>
                <Avatar
                  rounded
                  source={{
                    uri: profilePhoto,
                  }}
                />
                <ListItem.Content>
                  <ListItem.Title>{currentUserName.name}</ListItem.Title>
                </ListItem.Content>
                <Icon
                  onPress={() => {
                    // setCurrentUser(l);
                    faceRegister();
                  }}
                  name={'camera'}
                  type={'entypo'}
                  size={30}
                  color={Colors.mainHeader[0]}
                />
              </ListItem>
            </View>
          )}
          {appointment?.otherStaffCodesForFace &&
            appointment.otherStaffCodesForFace.split(',').length > 0 &&
            appointment.otherStaffCodesForFace.split(',').map((l, i) => {
              return (
                <ListItem key={i} bottomDivider>
                  {/* <Avatar source={{uri: l.avatar_url}} /> */}
                  <ListItem.Content>
                    <ListItem.Title>{l}</ListItem.Title>
                    <ListItem.Subtitle>{l}</ListItem.Subtitle>
                  </ListItem.Content>
                  <Icon
                    onPress={() => setCurrentUser(l)}
                    name={'camera'}
                    size={30}
                    color={Colors.mainHeader[0]}
                  />
                </ListItem>
              );
            })}
        </View>

        {attachments.length > 0 && (
          <View>
            <Text>Attachments:</Text>
            {attachments.map((att, i) => {
              return <Text>Attachment_{i + 1 + ''}.png</Text>;
            })}
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default Appointment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  heading: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  walletContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 5,
    width: wp('93'),
    paddingTop: '3%',
    paddingLeft: '4%',
    paddingRight: '4%',
    paddingBottom: '3%',
    marginTop: '5%',
  },
  row: {
    flexDirection: 'row',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 10,
    width: wp('20'),
  },
  buttonContainer1: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 10,
    width: wp('20'),
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingContainer: {
    marginTop: 8,
  },
  buttonContainer3: {
    width: wp('40'),
    backgroundColor: '#f05760',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 30,
    marginTop: hp('3'),
    alignSelf: 'center',
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#ffffff',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    backgroundColor: '#ffffff',
    paddingLeft: '5%',
    borderRadius: 10,
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
    height: hp('7'),
    justifyContent: 'center',
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    height: hp('7'),
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
  },
  item1: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
  },
  textarea: {
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderRadius: 8,
  },
  labelContainer: {
    margin: '1.5%',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 17,
    color: Colors.mainHeader[0],
    fontWeight: 'bold',
  },
  inputFeilds: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    color: '#000000',
    borderRadius: 10,
  },
  inputFeildsFocus: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: Colors.mainHeader[0],
    color: '#000000',
    borderRadius: 10,
  },
});
