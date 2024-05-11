import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Platform,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Card, Select as Picker} from 'native-base';
import {RNCamera} from 'react-native-camera';
import SubHeader from '../common/DrawerHeader';
import Loader from '../common/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Const from '../common/Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
import {Colors} from '../../utils/configs/Colors';
import {CustomButton} from '../common/CustomButton';
import SuccessError from '../common/SuccessError';
import AnimatedLoader from '../common/AnimatedLoader';

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Text>Loading...</Text>
  </View>
);
export default class FaceRegister extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      CapturedImage: '',
      StaffNo: '',
      showAlert: false,
      bearer_token: '',
      institute_id: '',
      org_id: '',
      showAlert1: false,
      error_message: '',
      manager_staff_id: '',
      isOtherCheckedIn: false,
      inst: '',
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('user_id').then(user_id => {
      AsyncStorage.getItem('institute_id').then(institute_id => {
        AsyncStorage.getItem('bearer_token').then(bearer_token => {
          AsyncStorage.getItem('org_id').then(org_id => {
            this.setState({
              StaffNo: user_id,
              institute_id: institute_id,
              bearer_token: bearer_token,
              org_id: org_id,
            });
          });
        });
      });
    });
  }
  takePicture = async camera => {
    if (this.state.manager_staff_id === '') {
      return this.displayMsg(true, 'Select a staff first', true);
    }
    const options = {quality: 0.1, base64: true};
    const data = await camera.takePictureAsync(options);
    this.registerFace(data.uri);
  };
  registerFace = uri => {
    const bearer = this.state.bearer_token;
    var filename = uri.replace(/^.*[\\\/]/, '');
    this.setState({showAlert: true});
    let uploadData = new FormData();
    uploadData.append('base64Image', {
      uri: uri,
      name: filename,
      type: 'image/png',
    });
    uploadData.append('staffNumber', this.state.manager_staff_id);
    uploadData.append('InstituteId', this.state.inst);
    uploadData.append('OrganizationId', this.state.org_id);
    uploadData.append('ManagerStaffCode', this.state.StaffNo);
    uploadData.append('ManagerInstituteId', this.state.institute_id);
    uploadData.append('IsSelf', false);
    fetch(Const + 'api/Staff/RegisterPhoto', {
      method: 'POST',
      body: uploadData,
    })
      .then(response => response.json())
      .then(json => {
        console.log(json);
        if (json.status) {
          this.setState({
            showAlert1: true,
            error_message: 'Face registration success!',
            showAlert: false,
          });
          setTimeout(() => {
            this.props.navigation.navigate('Home');
          }, 1200);
        } else {
          this.setState({showAlert: false}, () => {
            setTimeout(() => {
              this.setState({
                showAlert1: true,
                error_message: json.message,
                error: true,
              });
            }, 300);
          });
        }
      })
      .catch(error => {
        this.setState({showAlert: false}, () => {
          setTimeout(() => {
            this.setState({
              showAlert1: true,
              error_message: error.message,
              error: true,
            });
          }, 300);
        });
      });

    // console.log('body ===>', {
    //   staffNumber: this.state.StaffNo,
    //   instituteId: this.state.institute_id,
    //   OrganizationId: this.state.org_id,
    //   ManagerStaffCode: this.state.manager_staff_id,
    //   IsSelf: this.state.isOtherCheckedIn ? false : true,
    // });
    // this.setState({showAlert: true});
    // fetch(Const + 'api/Staff/RegisterPhoto', {
    //   method: 'POST',
    //   withCredentials: true,
    //   credentials: 'include',
    //   headers: {
    //     Authorization: bearer,
    //     Accept: 'application/json, text/plain',
    //     'Content-Type': 'application/json;charset=UTF-8',
    //   },
    //   body: JSON.stringify(body),
    // })
    //   .then((response) => response.json())
    //   .then((json) => {
    //     if (json.status) {
    //       this.setState({
    //         showAlert1: true,
    //         error_message: 'Face registration success!',
    //         showAlert: false,
    //       });
    //       setTimeout(() => {
    //         this.props.navigation.navigate('Home');
    //       }, 1200);
    //     } else {
    //       this.setState({
    //         showAlert1: true,
    //         error_message: json.message,
    //         showAlert: false,
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     this.setState({
    //       showAlert1: true,
    //       error_message: 'Unknown error occured',
    //       showAlert: false,
    //     });
    //   });
  };

  displayMsg = (error, error_message, showAlert1) => {
    this.setState({error, error_message, showAlert1});
  };

  goToHome = () => {
    this.props.navigation.navigate('Home');
  };
  onValueChange = value => {
    const inst = this.props.route.params.otherStaff.find(
      other => other.staffCode === value,
    );
    this.setState({manager_staff_id: value, inst: inst.instituteId});
  };
  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <View style={styles.container}>
        <SuccessError
          deleteIconPress={() => {
            this.setState({showAlert1: false});
          }}
          isVisible={this.state.showAlert1}
          error={this.state.error}
          subTitle={this.state.error_message}
        />
        <AnimatedLoader
          doNotShowDeleteIcon
          message={'Loading'}
          isVisible={this.state.showAlert}
        />
        {/* <AwesomeAlert
          show={this.state.showAlert}
          showProgress={true}
          title="Loading"
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
        /> */}
        {/* {Platform.OS === 'android' && (
          <AwesomeAlert
            show={this.state.showAlert1}
            showProgress={false}
            title="Attention"
            message={this.state.error_message}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            cancelText="Okay"
            onCancelPressed={() => {
              this.setState({showAlert1: false});
            }}
            cancelButtonColor={Colors.button[0]}
            cancelButtonTextStyle={{
              fontFamily: 'Poppins-Regular',
              fontSize: 13,
            }}
            messageStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
            titleStyle={{fontFamily: 'Poppins-SemiBold', fontSize: 14}}
          />
        )} */}
        {/* {Platform.OS === 'ios' && this.state.showAlert1
          ? Alert.alert('Attention', this.state.error_message, [
              {text: 'OK', onPress: () => this.setState({showAlert1: false})},
            ])
          : null} */}

        <SubHeader
          title="Face Register for others"
          showBack={true}
          backScreen="Home"
          showBell={false}
          navigation={this.props.navigation}
        />

        <View style={styles.cardContainer}>
          <Card style={styles.card}>
            <View
              style={{
                marginTop: '13%',
                marginLeft: '4%',
                marginRight: '4%',
              }}>
              <View
                style={{
                  width: 200,
                  height: 200,
                  marginTop: '8%',
                  marginLeft: wp('14'),
                  marginBottom: hp('3'),
                  borderRadius: 10,
                }}>
                <RNCamera
                  style={styles.preview}
                  type={RNCamera.Constants.Type.front}
                  flashMode={RNCamera.Constants.FlashMode.on}
                  androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                  }}
                  captureAudio={false}>
                  {({camera, status, recordAudioPermissionStatus}) => {
                    if (status !== 'READY') return <PendingView />;
                    return (
                      <View style={{top: 250}}>
                        {this.props.route.params.showOtherCheckInMenu && (
                          <View style={styles.center}>
                            <View style={{marginTop: '3%'}}>
                              {/* <View style={styles.row}>
                                    <CheckBox
                                      isChecked={this.state.isOtherCheckedIn}
                                      onClick={() => {
                                        this.setState({
                                          isOtherCheckedIn: !this.state
                                            .isOtherCheckedIn,
                                        });
                                      }}
                                      checkedCheckBoxColor="#f05760"
                                    />
                                    <Text
                                      style={{
                                        fontFamily: 'Poppins-SemiBold',
                                        fontSize: 14,
                                        marginLeft: 3,
                                        marginBottom: 8,
                                      }}>
                                      Others Check In
                                    </Text>
                                  </View> */}
                            </View>
                          </View>
                        )}
                        {this.props.route.params.showOtherCheckInMenu && (
                          <View style={{marginTop: '3%'}}>
                            <View style={styles.labelContainer}>
                              <Text style={styles.label}>Select Staff</Text>
                            </View>
                            <View>
                              <Picker
                                note
                                mode="dialog"
                                style={{width: 120}}
                                selectedValue={this.state.manager_staff_id}
                                onValueChange={value =>
                                  this.onValueChange(value)
                                }>
                                <Picker.Item label={'Select staff'} value="" />
                                {this.props.route.params.otherStaff.map(
                                  item => {
                                    return (
                                      <Picker.Item
                                        label={item.name}
                                        value={item.staffCode}
                                        key={item.staffCode}
                                      />
                                    );
                                  },
                                )}
                              </Picker>
                            </View>
                          </View>
                        )}

                        <CustomButton
                          title={'Register Face'}
                          color={Colors.button[0]}
                          radius={20}
                          marginTop={20}
                          onPress={() => this.takePicture(camera)}
                        />
                      </View>
                    );
                  }}
                </RNCamera>
              </View>
            </View>
          </Card>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  header: {
    backgroundColor: '#089bf9',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    color: '#ffffff',
  },
  cardContainer: {
    marginTop: '10%',
    marginLeft: '6%',
    marginRight: '6%',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 10,
    elevation: 4,
    paddingTop: '3%',
    paddingBottom: '3%',
    height: hp('80'),
  },
  preview: {
    flex: 1,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.button[0],
    borderRadius: 20,
    width: wp('38'),
    paddingRight: wp('7'),
    marginTop: '4%',
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#ffffff',
  },
  btImage: {
    width: 54,
    height: 39,
  },
  row: {
    flexDirection: 'row',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#67747d',
  },
  labelContainer: {
    margin: '1.5%',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    paddingLeft: '5%',
    borderRadius: 10,
    height: hp('6'),
    borderColor: '#f1f1f1',
    borderWidth: 1,
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderColor: '#f1f1f1',
    borderWidth: 1,
    height: hp('6'),
    width: wp('55'),
  },
});
