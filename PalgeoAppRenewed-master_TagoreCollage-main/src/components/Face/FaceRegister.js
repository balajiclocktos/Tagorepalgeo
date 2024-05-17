import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Button,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {Container, Card, VStack, Picker, Item} from 'native-base';
import SubHeader from '../common/DrawerHeader';
import Loader from '../common/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Const from '../common/Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
import ImagePicker from 'react-native-image-crop-picker';
import CameraComp from '../common/CameraComp';
import {RNCamera} from 'react-native-camera';
import {Icon, Overlay} from 'react-native-elements';
import {Col, Row, Grid} from 'react-native-easy-grid';
import ImageResizer from 'react-native-image-resizer';
import axios from 'axios';
import {Colors} from '../../utils/configs/Colors';
import AnimatedLoader from '../common/AnimatedLoader';
import SuccessError from '../common/SuccessError';

export const Toolbar = ({
  capturing = false,
  flashMode = CameraFlashModes.off,
  setFlashMode,
  uploadHandler,
  onShortCapture,
  noFlash,
  noUploadButton,
}) => (
  <Grid style={styles.bottomToolbar}>
    <Row>
      {!noFlash && (
        <Col style={styles.alignCenter}>
          <TouchableOpacity
            onPress={() =>
              setFlashMode(
                flashMode === CameraFlashModes.on
                  ? CameraFlashModes.off
                  : CameraFlashModes.on,
              )
            }>
            <Icon
              name={
                flashMode == CameraFlashModes.on ? 'md-flash' : 'md-flash-off'
              }
              color="white"
              size={30}
              type="ionicon"
            />
          </TouchableOpacity>
        </Col>
      )}
      <Col size={2} style={styles.alignCenter}>
        <TouchableOpacity onPress={onShortCapture}>
          <View
            style={[styles.captureBtn, capturing && styles.captureBtnActive]}>
            {capturing && <View style={styles.captureBtnInternal} />}
          </View>
        </TouchableOpacity>
      </Col>
      {!noUploadButton && (
        <Col style={styles.alignCenter}>
          <TouchableOpacity onPress={uploadHandler}>
            <Icon
              name="md-cloud-upload"
              color="white"
              size={30}
              type="ionicon"
            />
          </TouchableOpacity>
        </Col>
      )}
    </Row>
  </Grid>
);

const {width: winWidth, height: winHeight} = Dimensions.get('window');
const {FlashMode: CameraFlashModes, Type: CameraTypes} = RNCamera.Constants;
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
      // show:false,
      // show1: true,
      show: this.props.route?.params?.show || false,
      show1: this.props.route?.params?.show1 || false,
      captures: [],
      currentIndex: 0,
      cameraType: RNCamera.Constants.Type.front,
      flashMode: RNCamera.Constants.FlashMode.off,
      images: [],
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
    this.focus = this.props.navigation.addListener('focus', () =>
      AsyncStorage.getItem('user_id').then(user_id => {
        AsyncStorage.getItem('institute_id').then(institute_id => {
          AsyncStorage.getItem('bearer_token').then(bearer_token => {
            AsyncStorage.getItem('org_id').then(org_id => {
              console.log('I ran');
              this.setState({
                StaffNo: user_id,
                institute_id: institute_id,
                bearer_token: bearer_token,
                org_id: org_id,
                show: this.props.route?.params?.show || false,
                show1: this.props.route?.params?.show1 || false,
              });
            });
          });
        });
      }),
    );
  }

  componentWillUnmount() {
    this.props.navigation.removeListener('focus', this.focus);
  }

  openPicker = async camera => {
    const options = {quality: 1, base64: false};
    const images = await camera.takePictureAsync(options);
    this.setState({show: false});

    // const images = await ImagePicker.openCamera({
    //   compressImageQuality: 0.1,
    //   useFrontCamera: true,
    // });
    this.setState({showAlert: true}, () => {
      ImageResizer.createResizedImage(
        images.uri,
        300,
        300,
        'PNG',
        0,
        0,
        undefined,
      )
        .then(response => {
          console.log('size of image ===>', response.size);
          this.registerFace(response.uri, 'image/png');
          // response.uri is the URI of the new image that can now be displayed, uploaded...
          // response.path is the path of the new image
          // response.name is the name of the new image with the extension
          // response.size is the size of the new image
        })
        .catch(err => {
          console.log('error in resizing', err);
          return alert('Unable to capture image. Please try again');
          // Oops, something went wrong. Check that the filename is correct and
          // inspect err to get more details.
        });
      //this.registerFace(images.uri, 'image/png');
    });
  };
  registerFace = (uri, mime) => {
    var filename = uri.replace(/^.*[\\\/]/, '');
    this.setState({showAlert: true});
    let uploadData = new FormData();
    uploadData.append('base64Image', {uri: uri, name: filename, type: mime});
    uploadData.append('staffNumber', this.state.StaffNo);
    uploadData.append('InstituteId', this.state.institute_id);
    uploadData.append('OrganizationId', this.state.org_id);
    uploadData.append('ManagerStaffCode', this.state.manager_staff_id);
    uploadData.append('IsSelf', true);
    console.log('faceRegister payload', uploadData);
    fetch(Const + 'api/Staff/RegisterPhoto', {
      method: 'POST',
      body: uploadData,
    })
      .then(response => {
        console.log('Face Register Response:', response);
        return response.json();
      })
      .then(async json => {
        console.log(json);
        if (json.status) {
          if (Platform.OS === 'ios') {
            alert('Face registration success!');
          }
          this.setState({
            showAlert1: true,
            error_message: 'Face registration success!',
            showAlert: false,
            error: false,
          });
          console.log('uriiiiiii', uri);
          await AsyncStorage.setItem('profile_pic', uri);
          await AsyncStorage.setItem('profileImageFile', uri);
          setTimeout(() => {
            this.goToHome();
          }, 1200);
        } else {
          if (Platform.OS === 'ios') {
            alert(json.message);
          }
          this.setState({
            showAlert1: true,
            error_message: json.message,
            showAlert: false,
            error: true,
          });
          setTimeout(() => {
            this.goToHome();
          }, 2200);
        }
      })
      .catch(error => {
        if (Platform.OS === 'ios') {
          alert('Some internal error occurred.Try after some time.');
        }
        this.setState({
          showAlert1: true,
          error_message: 'Some internal error occurred.Try after some time.',
          showAlert: false,
          error: true,
        });
      });
  };

  registerFace1 = async () => {
    if (this.state.captures.length < 3) {
      return alert('Capture 3 photos first.');
    }
    this.setState({
      show1: false,
      showAlert: true,
    });
    try {
      const response = await axios.post(Const + 'api/Staff/CCTVFaceRegister', {
        InstituteId: this.state.institute_id,
        StaffCode: this.state.StaffNo,
        Images: this.state.images,
        OrganisationId: this.state.org_id,
      });
      const json = response.data;
      if (!json?.status) {
        if (Platform.OS === 'ios') {
          alert(json.message);
        }
        this.setState({
          showAlert1: true,
          error_message: json.message,
          showAlert: false,
          error: true,
        });
        return setTimeout(() => {
          this.goToHome();
        }, 1200);
      }
      if (json?.status) {
        if (Platform.OS === 'ios') {
          alert(json.message);
        }
        this.setState({
          showAlert1: true,
          error_message: json.message,
          showAlert: false,
          error: false,
        });
        await AsyncStorage.setItem('profile_pic', this.state.captures[0].uri);
        await AsyncStorage.setItem(
          'profileImageFile',
          this.state.captures[0].uri,
        );
        return setTimeout(() => {
          this.goToHome();
        }, 1200);
      }
    } catch (e) {
      if (Platform.OS === 'ios') {
        alert(e.message.toString());
      }
      this.setState({
        showAlert1: true,
        error_message: e.message.toString(),
        showAlert: false,
        error: true,
      });
      return setTimeout(() => {
        this.goToHome();
      }, 1200);
    }
  };

  goToHome = () => {
    this.props.navigation.goBack();
  };

  setFlashMode = flashMode => this.setState({flashMode});
  setCameraType = cameraType => this.setState({cameraType});

  handleShortCapture = async () => {
    if (this.state.captures.length === 3) {
      return alert('Maximum 3 captures are allowed');
    }
    const options = {base64: true, quality: 1};
    const photoData = await this.camera.takePictureAsync(options);
    //console.log('op', photoData)
    this.setState({
      capturing: false,
      //show:false,
      captures: [photoData, ...this.state.captures],
      images: [photoData.base64, ...this.state.images],
    });
  };

  render() {
    const {flashMode, cameraType, capturing, captures, currentIndex, pressed} =
      this.state;
    const {show} = this.props.route?.params;
    console.log('show==', show);
    var cardStyle1 = {
      borderRadius: 10,
      elevation: 4,
      padding: 20,
    };
    if (this.state.loader) {
      return <Loader />;
    }
    if (show) {
      return (
        <View style={styles.container}>
          <AnimatedLoader
            isVisible={this.state.showAlert}
            doNotShowDeleteIcon
            source={require('../../assets/lottie/loader.json')}
          />
          <SuccessError
            isVisible={this.state.showAlert1}
            error={this.state.error}
            deleteIconPress={() => this.setState({showAlert1: false})}
            subTitle={this.state.error_message}
          />

          <SubHeader
            title="Face Register"
            showBack={true}
            backScreen="Tab"
            showBell={false}
            navigation={this.props.navigation}
          />
          <View
            style={{
              flex: 1,
              backgroundColor: '#fbfbfb',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <CameraComp
              visible={this.state.show}
              onClose={() => this.goToHome()}
              onPress={camera => this.openPicker(camera)}
              btnText={'register'}
            />
          </View>
        </View>
      );
    }
    if (this.state.show1) {
      return (
        <>
          <SubHeader
            title="Face Register"
            showBack={true}
            backScreen="Home"
            showBell={false}
            navigation={this.props.navigation}
          />
          <View>
            <RNCamera
              type={cameraType}
              flashMode={flashMode}
              style={styles.preview}
              ref={camera => (this.camera = camera)}
              androidCameraPermissionOptions={{
                title: 'Permission to use camera',
                message: 'We need your permission to use your camera',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
              }}
            />
          </View>

          {pressed && (
            <Overlay
              overlayStyle={{
                width: winWidth * 0.6,
                height: winHeight * 0.5,
                alignSelf: 'center',
                backgroundColor: 'transparent',
              }}
              isVisible={pressed}
              onBackdropPress={() => this.setState({pressed: false})}>
              <Image
                source={{uri: captures[currentIndex].uri}}
                style={{width: '100%', height: '80%', resizeMode: 'cover'}}
              />
              <Button
                title={'Delete'}
                color={'#f05760'}
                onPress={() => {
                  const newImages = captures.filter(
                    (image, i) => i !== currentIndex,
                  );
                  const newImages1 = this.state.images.filter(
                    (im, i) => i !== currentIndex,
                  );
                  this.setState({
                    captures: newImages,
                    images: newImages1,
                    pressed: false,
                  });
                }}
              />
            </Overlay>
          )}

          {/* {captures.length > 0 && <Gallery openImage = {(index) => this.openImage(index)} captures={captures} />} */}
          {captures.length > 0 && (
            <ScrollView
              horizontal={true}
              style={[styles.bottomToolbar, styles.galleryContainer]}>
              {captures.map(({uri}, index) => (
                <TouchableOpacity
                  onPress={() =>
                    this.setState({currentIndex: index, pressed: true})
                  }
                  style={styles.galleryImageContainer}
                  key={uri}>
                  <Text
                    style={{
                      textAlign: 'center',
                      backgroundColor: '#f05760',
                      color: 'white',
                      fontSize: 17,
                    }}>
                    {(index + 1).toString() + '/3'}
                  </Text>
                  <Image source={{uri}} style={styles.galleryImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <Toolbar
            capturing={capturing}
            flashMode={flashMode}
            uploadHandler={this.registerFace1}
            setFlashMode={this.setFlashMode}
            setCameraType={this.setCameraType}
            onShortCapture={this.handleShortCapture}
          />
        </>
      );
    }
    if (!this.state.show && !this.state.show1) {
      return (
        <View style={styles.container}>
          <AnimatedLoader
            isVisible={this.state.showAlert}
            doNotShowDeleteIcon
            source={require('../../assets/lottie/loader.json')}
          />
          <SuccessError
            isVisible={this.state.showAlert1}
            error={this.state.error}
            deleteIconPress={() => this.setState({showAlert1: false})}
            subTitle={this.state.error_message}
          />

          <SubHeader
            title="Face Register"
            showBack={true}
            backScreen="Home"
            showBell={false}
            navigation={this.props.navigation}
          />
        </View>
      );
    }
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
    backgroundColor: '#f05760',
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
  userImage: {
    width: 120,
    height: 120,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  note: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    marginBottom: 10,
  },
  alignCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    height: winHeight,
    width: winWidth,
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  bottomToolbar: {
    width: winWidth,
    position: 'absolute',
    height: 100,
    bottom: 0,
  },
  captureBtn: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 60,
    borderColor: '#FFFFFF',
  },
  captureBtnActive: {
    width: 80,
    height: 80,
  },
  captureBtnInternal: {
    width: 76,
    height: 76,
    borderWidth: 2,
    borderRadius: 76,
    backgroundColor: 'red',
    borderColor: 'transparent',
  },
  galleryContainer: {
    bottom: 100,
  },
  galleryImageContainer: {
    width: 75,
    height: 75,
    marginRight: 15,
  },
  galleryImage: {
    width: 75,
    height: 75,
  },
});
