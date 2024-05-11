import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {VStack} from 'native-base';
import {Input} from 'react-native-elements';
import SubHeader from '../common/DrawerHeader';
import Loader from '../common/Loader';
import AwesomeAlert from 'react-native-awesome-alerts';
import Const from '../common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from 'react-native-check-box';
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'rn-fetch-blob';
import DocumentPicker from 'react-native-document-picker';
import CustomModalTextArea from '../common/CustomModalTextArea';
import {Colors} from '../../utils/configs/Colors';
import GradientButton from '../common/GradientButton';
import Stepper from '../common/Stepper';
import CustomAttachment from '../common/CustomAttachment';
import CustomLabel from '../common/CustomLabel';
import SuccessError from '../common/SuccessError';
import AnimatedLoader from '../common/AnimatedLoader';
import {CustomButton} from '../common/CustomButton';
export default class CircularStep3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      showAlert: false,
      isSMS: false,
      isEmail: true,
      isNotification: true,
      circular: '',
      subject: '',
      bearer_token: '',
      institute_id: '',
      showAlert1: false,
      error_message: '',
      org_id: '',
      files: [],
      files1: [],
      NotificationAttachment: {
        FileName: '',
        FileType: '',
        Attachment: '',
      },
      EmailAttachment: {
        FileName: '',
        FileType: '',
        Attachment: '',
      },
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('bearer_token').then(bearer_token => {
      AsyncStorage.getItem('institute_id').then(institute_id => {
        AsyncStorage.getItem('org_id').then(org_id => {
          this.setState({
            bearer_token: bearer_token,
            institute_id: institute_id,
            org_id: org_id,
          });
        });
      });
    });
  }
  send = () => {
    if (this.state.subject) {
      if (this.state.circular) {
        this.setState({showAlert: true});
        fetch(Const + 'api/Staff/SendCircular', {
          method: 'POST',
          withCredentials: true,
          credentials: 'include',
          headers: {
            Authorization: 'Bearer ' + this.state.bearer_token,
            Accept: 'text/plain',
            'Content-Type': 'application/json-patch+json',
          },
          body: JSON.stringify({
            list_staff_code: this.props.route.params.data,
            subject: this.state.subject,
            circular: this.state.circular,
            isSMS: this.state.isSMS,
            isEmail: this.state.isEmail,
            isNotification: this.state.isNotification,
            instituteId: Number(this.state.institute_id),
            OrganizationId: this.state.org_id,
            emailAttachment: this.state.EmailAttachment,
            notificationAttachment: this.state.NotificationAttachment,
          }),
        })
          .then(response => response.json())
          .then(json => {
            console.log(
              'jsonCicrular',
              JSON.stringify({
                list_staff_code: this.props.route.params.data,
                subject: this.state.subject,
                circular: this.state.circular,
                isSMS: this.state.isSMS,
                isEmail: this.state.isEmail,
                isNotification: this.state.isNotification,
                instituteId: Number(this.state.institute_id),
                OrganizationId: this.state.org_id,
                emailAttachment: this.state.EmailAttachment,
                notificationAttachment: this.state.NotificationAttachment,
              }),
            );

            if (json.status) {
              if (Platform.OS == 'ios') {
                alert('Circular sent to all selected staff');
                setTimeout(() => {
                  this.setState({showAlert: false});
                }, 1300);
                setTimeout(() => {
                  this.props.navigation.navigate('Circular');
                }, 1200);
              } else {
                this.setState({
                  showAlert: false,
                  showAlert1: true,
                  error_message: 'Circular sent to all selected staff',
                  error: false,
                });
                setTimeout(() => {
                  this.props.navigation.navigate('Circular');
                }, 1200);
              }
            } else {
              if (Platform.OS == 'ios') {
                alert('Unknown error occured');
                setTimeout(() => {
                  this.setState({showAlert: false});
                }, 1200);
              } else {
                this.setState({
                  showAlert: false,
                  showAlert1: true,
                  error: true,
                  error_message: 'Unknown error occured.Try later',
                });
              }
            }
          })
          .catch(error => {
            if (Platform.OS == 'ios') {
              alert(error.message);
              setTimeout(() => {
                this.setState({showAlert: false});
              }, 1200);
            } else {
              this.setState({
                showAlert: false,
                showAlert1: true,
                error: true,
                error_message: error.message,
              });
            }
          });
      } else {
        if (Platform.OS == 'ios') {
          alert('Circlar cannot be empty');
          setTimeout(() => {
            this.setState({showAlert: false});
          }, 1200);
        } else {
          this.setState({
            showAlert: false,
            showAlert1: true,
            error: true,
            error_message: 'Circular cannot be empty',
          });
        }
      }
    } else {
      if (Platform.OS == 'ios') {
        alert('Subject cannot be empty');
        setTimeout(() => {
          this.setState({showAlert: false});
        }, 1200);
      } else {
        this.setState({
          showAlert: false,
          showAlert1: true,
          error: true,
          error_message: 'Subject cannot be empty',
        });
      }
    }
  };
  showPassword = () => {
    this.setState({showPassword: !this.state.showPassword});
  };
  handleCheckbox1 = () => {
    var current = this.state.isSMS;
    this.setState({isSMS: !current});
  };
  handleCheckbox2 = () => {
    var current = this.state.isEmail;
    this.setState({isEmail: !current});
  };
  handleCheckbox3 = () => {
    var current = this.state.isNotification;
    this.setState({isNotification: !current});
  };
  SelectCircularImage = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        includeBase64: true,
        type: [DocumentPicker.types.allFiles],
      });

      let typeIdentifier = res.type.split('/');
      console.log(typeIdentifier[1]);
      let files = [];
      //alert(typeIdentifier[1]);
      RNFetchBlob.fs
        .readFile(res.uri, 'base64')
        .then(data => {
          var Attachment = {
            FileName:
              'CircularAttachment_' +
              new Date().getTime() +
              '.' +
              typeIdentifier[1],
            FileType: res.type,
            Attachment: data,
          };
          files.push(Attachment.FileName);
          console.log('attach', Attachment.FileName);
          this.setState({EmailAttachment: Attachment, files: [...files]});
        })
        .catch(err => {});
    } catch (err) {
      console.log('Unknown Error: ' + err);
    }
    // ImagePicker.openPicker({
    //   cropping: true,
    //   includeBase64: true,
    //   compressImageQuality: 0.6,
    // }).then((images) => {
    //   var Attachment = {
    //     FileName: 'CircularAttachment' + new Date().getTime(),
    //     FileType: images.mime,
    //     Attachment: images.data,
    //   };
    //   this.setState({EmailAttachment: Attachment});
    // });
  };
  selectNotificationImage = async () => {
    let files1 = [];
    try {
      const res = await DocumentPicker.pickSingle({
        includeBase64: true,
        type: [DocumentPicker.types.images],
      });
      let typeIdentifier = res.type.split('/');
      console.log(typeIdentifier[1]);
      //alert(typeIdentifier[1]);
      RNFetchBlob.fs
        .readFile(res.uri, 'base64')
        .then(data => {
          var Attachment = {
            FileName: res.name,
            FileType: res.type,
            Attachment: data,
          };
          files1.push(Attachment.FileName);
          this.setState({NotificationAttachment: Attachment, files1});
        })
        .catch(err => {});
    } catch (err) {
      console.log('Unknown Error: ' + JSON.stringify(err));
    }
    // ImagePicker.openPicker({
    //   cropping: true,
    //   includeBase64: true,
    //   compressImageQuality: 0.6,
    // }).then((images) => {
    //   var Attachment = {
    //     FileName: 'NotificationAttachment' + new Date().getTime(),
    //     FileType: images.mime,
    //     Attachment: images.data,
    //   };
    //   this.setState({NotificationAttachment: Attachment});
    // });
  };

  openCamera = async camera => {
    //console.log('I ran', this.attachmentRef);
    const options1 = {quality: 0, base64: true};
    try {
      const image1 = await camera.takePictureAsync(options1);

      let fileExtension = image1.uri.slice(-3);
      //console.log(fileExtension, image1.uri);
      const capturedImage = {
        Attachment: image1.base64,
        FileName: 'Attachment_' + new Date().getTime() + '.' + fileExtension,
        FileType: 'image/' + fileExtension,
      };
      // const name = 'Attachment_' + new Date().getTime() + '.' + fileExtension;
      this.setState({
        files: [...this.state.files, capturedImage.FileName],
        EmailAttachment: capturedImage,
      });

      //console.log('Attachment = ', Attachment),
    } catch (e) {
      console.log('Error in capturing: ', e);
    }
  };
  openCamera1 = async camera => {
    //console.log('I ran', this.attachmentRef);
    const options1 = {quality: 0, base64: true};
    try {
      const image1 = await camera.takePictureAsync(options1);

      let fileExtension = image1.uri.slice(-3);
      //console.log(fileExtension, image1.uri);
      const capturedImage = {
        Attachment: image1.base64,
        FileName: 'Attachment_' + new Date().getTime() + '.' + fileExtension,
        FileType: 'image/' + fileExtension,
      };
      // const name = 'Attachment_' + new Date().getTime() + '.' + fileExtension;
      this.setState({
        files1: [...this.state.files1, capturedImage.FileName],
        NotificationAttachment: capturedImage,
      });

      //console.log('Attachment = ', Attachment),
    } catch (e) {
      console.log('Error in capturing: ', e);
    }
  };

  Handler = (elem, ind) => {
    //console.log('index', index);

    //const newFiles = this.state.files.filter((e, i) => i !== ind);
    this.setState({
      files: [],

      EmailAttachment: {
        FileName: '',
        FileType: '',
        Attachment: '',
      },
    });
  };
  Handler1 = (elem, ind) => {
    //console.log('index', index);

    //const newFiles = this.state.files.filter((e, i) => i !== ind);
    this.setState({
      files1: [],

      NotificationAttachment: {
        FileName: '',
        FileType: '',
        Attachment: '',
      },
    });
  };

  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <View style={styles.container}>
        <AnimatedLoader doNotShowDeleteIcon isVisible={this.state.showAlert} />
        <SuccessError
          isVisible={this.state.showAlert1}
          error={this.state.error}
          deleteIconPress={() => this.setState({showAlert1: false})}
          subTitle={this.state.error_message}
        />

        <SubHeader
          title="E-Circular"
          showBack={true}
          backScreen="CircularStep2"
          navigation={this.props.navigation}
        />
        <ScrollView nestedScrollEnabled>
          <VStack>
            <Stepper />
            <View style={styles.cardContainer}>
              <View
                style={{marginTop: '4%', marginLeft: '4%', marginRight: '4%'}}>
                <View style={{flexDirection: 'row'}}>
                  {/* <View style={{flexDirection: 'row'}}>
                    <CheckBox
                      checkedCheckBoxColor="#f05760"
                      isChecked={this.state.isSMS}
                      onClick={this.handleCheckbox1}
                    />
                    <Text style={{fontFamily: 'Poppins-Regular', fontSize: 13}}>
                      SMS
                    </Text>
                  </View> */}

                  <View
                    style={{
                      flexDirection: 'row',
                      //marginLeft: wp('3'),
                      borderWidth: 1,
                      borderColor: Colors.button[0],
                      borderRadius: 4,
                      padding: 8,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: 16,
                        color: Colors.button[0],
                      }}>
                      E-mail
                    </Text>
                    <CheckBox
                      checkedCheckBoxColor={Colors.button[0]}
                      isChecked={this.state.isEmail}
                      onClick={this.handleCheckbox2}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: wp('3'),
                      borderWidth: 1,
                      borderColor: Colors.button[0],
                      borderRadius: 4,
                      alignItems: 'center',
                      padding: 8,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: 16,
                        color: Colors.button[0],
                      }}>
                      Send Notification
                    </Text>
                    <CheckBox
                      checkedCheckBoxColor={Colors.button[0]}
                      isChecked={this.state.isNotification}
                      onClick={this.handleCheckbox3}
                    />
                  </View>
                </View>
              </View>
              <View style={{marginTop: '4%'}}>
                <CustomLabel
                  margin={0}
                  labelStyle={{marginLeft: 10}}
                  title="Subject"
                  family={'Poppins-Regular'}
                />
                <View style={{width: '100%'}}>
                  <Input
                    placeholder=""
                    inputContainerStyle={styles.input}
                    value={this.state.subject}
                    onChangeText={subject => {
                      this.setState({subject: subject});
                    }}
                  />
                </View>
              </View>

              <View
                style={{
                  marginTop: '4%',

                  width: '100%',
                }}>
                <CustomLabel
                  margin={0}
                  containerStyle={{marginLeft: 15}}
                  title="Description"
                  family={'Poppins-Regular'}
                />
                <CustomModalTextArea
                  backgroundColor="#E6E9EF"
                  value={this.state.circular}
                  onChangeText={circular => {
                    this.setState({circular: circular});
                  }}
                  rowSpan={7}
                />
              </View>
              <View
                style={{
                  marginTop: '4%',
                }}>
                <CustomAttachment
                  openCamera={camera => this.openCamera(camera)}
                  onPress={() => this.SelectCircularImage()}
                  onDelete={(elem, ind) => this.Handler(elem, ind)}
                  backgroundColor={Colors.secondary}
                  placeholderTextColor={Colors.mainHeader[0]}
                  files={this.state.files}
                  placeholder={'Upload Circular Attachment'}
                />
              </View>
              {this.state.isNotification && (
                <View
                  style={{
                    marginTop: '4%',
                  }}>
                  <CustomAttachment
                    openCamera={camera => this.openCamera1(camera)}
                    onPress={() => this.selectNotificationImage()}
                    onDelete={(elem, ind) => this.Handler1(elem, ind)}
                    backgroundColor={Colors.secondary}
                    placeholderTextColor={Colors.mainHeader[0]}
                    files={this.state.files1}
                    placeholder={'Upload Notification Image'}
                  />
                </View>
              )}

              <CustomButton
                onPress={this.send}
                color={Colors.button[0]}
                title={'Send'}
                marginTop={20}
                width={'40%'}
                radius={120}
                textStyle={{fontSize: 20}}
              />
            </View>
          </VStack>
        </ScrollView>
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
    marginTop: '5%',
    marginLeft: '6%',
    marginRight: '6%',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000000',
  },
  label1: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#c9c3c5',
    paddingLeft: wp('3'),
  },
  labelContainer: {
    margin: '1.5%',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    backgroundColor: '#E6E9EF',
    paddingLeft: '5%',
    borderRadius: 10,
    borderColor: '#f1f1f1',
    borderBottomWidth: 0,
    width: '100%',
    //borderWidth: 1.5,
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
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#ffffff',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f05760',
    borderRadius: 20,
    width: wp('30'),
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
  optional: {
    fontFamily: 'Poppins-Regular',
    color: 'red',
    fontSize: 12,
    margin: 2,
  },
});
