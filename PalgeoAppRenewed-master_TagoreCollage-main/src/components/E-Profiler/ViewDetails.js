import axios from 'axios';

import React, {Component} from 'react';
import {FlatList, StyleSheet, Image} from 'react-native';
import {TouchableOpacity} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import {Text, View} from 'react-native';
import {Icon, Overlay} from 'react-native-elements';
import {
  heightPercentageToDP,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Colors} from '../../utils/configs/Colors';
import Const from '../common/Constants';
import Layout from '../common/Layout';
import CustomLabel from '../common/CustomLabel';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {TouchableWithoutFeedback} from 'react-native';

import CustomLoader from '../Task Allocation/CustomLoader';

import {ActivityIndicator} from 'react-native';
import {Row} from 'native-base';

import RNFetchBlob from 'rn-fetch-blob';
import {PermissionsAndroid} from 'react-native';
const SubThemeColor = Colors.secondary;

export class StaffDetailsMaster extends Component {
  state = {
    user_id: '',
    institute_id: '',
    loader: false,
    ApiLoader: false,
    loaderText: '',
    files: [],
    values: [],
    keys: [],
    isVerified: this.props?.route?.params?.isVerified || false,
  };
  componentDidMount() {
    this.retrieveUserData().then(() => this.retrieveData());
    this.focus = this.props.navigation.addListener('focus', () =>
      this.retrieveUserData().then(() => this.retrieveData()),
    );
  }

  componentWillUnmount() {
    this.props.navigation.removeListener(this.focus);
  }
  retrieveUserData = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const institute_id = await AsyncStorage.getItem('institute_id');
      this.setState({
        user_id,
        institute_id,
        isVerified: this.props?.route?.params?.isVerified,
      });
    } catch (e) {
      alert('Error retrieving user data. Please logout and login again');
    }
  };

  retrieveData = async () => {
    this.setState({ApiLoader: true});
    const {formId} = this.props?.route?.params || '1';
    //console.log(formId);
    const {user_id, institute_id} = this.state;
    const url = `${Const}api/Master/GetFormInstituteStaffMapping/${formId}/${institute_id}/${user_id}`;
    try {
      const response = await axios.get(url);
      const {data} = response;
      //console.log(data);
      const {keys, values} = data;
      this.setState({ApiLoader: false});
      let dataa = [];
      if (keys?.length > 0 && values?.length > 0) {
        // if (values.length > 1) {
        values.forEach(e => {
          dataa.push(keys);
        });

        // } else {
        //   dataa.push(keys);
        // }
        this.setState({keys: dataa, values, refreshing: false});
      }
    } catch (e) {
      this.setState({ApiLoader: false, refreshing: false});
      alert('Error retreiving form data: ' + e);
    }
  };

  getParsedFiles = files => {
    if (files === '') {
      return [];
    }
    const parsed = JSON.parse(files);
    return parsed;
    // const fileNames = parsed.map((e, i) => 'File ' + (i + 1));
    // return fileNames.join(',');
  };

  openFiles = () => {
    this.setState({
      loader: true,
      loaderText: 'Please wait... Trying to open the files',
    });
    const {path} = this.state;
    FileViewer.open(path)
      .then(() => {
        this.setState({loader: false});
      })
      .catch(err => alert('Error occured opening the file'));
  };

  downloadFiless = async (recordId, index) => {
    const url = `${Const}api/Master/DownloadFile/${recordId}`;
    this.setState({loader: true, loaderText: 'Downloading file...'});
    try {
      const permission = await PermissionsAndroid.request(
        //PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Palgeo App Storage Permission',
          message: `Palgeo app needs access to your storage so you can take download and save files.`,
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (permission === PermissionsAndroid.RESULTS.GRANTED) {
        try {
          const response = await axios.get(url);
          this.setState({image: response.data[0].fileContents}, () => {
            //this.setState({showOverlay: true})
          });

          const dirs = RNFetchBlob.fs.dirs;
          const files = response.data;
          //console.log(files.length);
          if (files?.length > 0) {
            files.forEach(file => {
              var path = dirs.DCIMDir + '/' + file.fileDownloadName;

              RNFetchBlob.fs
                .writeFile(path, file.fileContents, 'base64')
                .then(res => {
                  console.log('File : ', res);
                  FileViewer.open(path)
                    .then(() => {
                      this.setState({loader: false});
                    })
                    .catch(err => alert('Error occured opening the file'));
                })
                .catch(e => console.log('error saving file', e));
            });
          }
        } catch (e) {
          console.log('error download', e);
        }
      } else {
        alert('Permission to download file is denied.');
      }
    } catch (e) {
      alert('Permission to download file is denied.');
    }
  };

  // downloadFiles = async (file) => {
  //   this.setState({
  //     showOverlay: false,
  //     loader: true,
  //     loaderText: 'Downloading file...',
  //   });
  //   const res = await fileViewer(file);
  //   if (!res) {
  //     this.setState({loader: false, loaderText: ''});
  //     return alert('Unable to download the file. Please try again');
  //   }
  //   if (res) {
  //     this.setState({loader: false, loaderText: ''}, () =>
  //       FileViewer.open(res.path())
  //         .then(() => console.log('success'))
  //         .catch((err) => alert('Error occured opening the file')),
  //     );
  //   }
  // };

  // getFileName = (file) => {
  //   const array = file.split('/');
  //   console.log(array);
  //   const {length} = array;
  //   return array[length - 1];
  // };

  editDetails = recordId => {
    const {formId} = this.props?.route?.params;
    this.props.navigation.navigate('EditDetails', {
      formId,
      recordId,
      edit: true,
      name: this.props.route?.params?.name,
    });
  };

  renderItem2 = ({item, index}) => {
    //console.log(item.length);
    // const {isVerified} = item.verified;

    let isVerified = false;
    let fileName = null;
    return (
      <TouchableWithoutFeedback
        onPress={
          () => {}
          //this.props.navigation.navigate('EditDetails', {formId: 1})
        }>
        <View>
          <View
            style={{
              margin: 5,
              borderRadius: 10,
              backgroundColor: index % 2 ? 'white' : SubThemeColor,
            }}>
            <View
              style={{
                width: '100%',
                alignSelf: 'center',
                //flexDirection: 'row',
                //alignItems: 'center',
                paddingVertical: 10,
              }}>
              {item?.length &&
                item.map((e, i) => {
                  if (e === 'Verified') {
                    if (this.state.values[index][i] === 'False') {
                      isVerified = false;
                    } else {
                      isVerified = true;
                    }
                  }

                  return (
                    <View
                      key={i}
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'space-around',
                      }}>
                      {this.state.values[index][i] !== '' &&
                        e !== 'RecordId' &&
                        e !== 'Verified' &&
                        e !== 'StaffCode' && (
                          <CustomLabel
                            containerStyle={{width: '50%'}}
                            labelStyle={{
                              color: Colors.button[0],
                              fontSize: 15,
                              textTransform: 'capitalize',
                            }}
                            title={e}
                          />
                        )}

                      {/* {e === 'File Aupload' ||
                      (e === 'attachments' &&
                        this.state.values[index][i] !== '' && (
                          <TouchableOpacity
                            style={{
                              width: '40%',
                              alignSelf: 'center',
                              flex: 1,
                              paddingLeft: 5,
                            }}
                            onPress={() =>
                              this.setState(
                                {
                                  files: this.getParsedFiles(
                                    this.state.values[index][i],
                                  ),
                                },
                                () => {
                                  if (
                                    this.getParsedFiles(
                                      this.state.values[index][i],
                                    ).length > 1
                                  ) {
                                    this.setState({showOverlay: true});
                                  } else {
                                    this.downloadFile(
                                      this.getParsedFiles(
                                        this.state.values[index][i],
                                      )[0],
                                    );
                                  }
                                },
                              )
                            }>
                            <CustomLabel
                              containerStyle={{
                                width: '100%',
                                //flex: 1,

                                alignSelf: 'center',
                                // overflow: 'hidden',
                                // height: 20,
                              }}
                              labelStyle={{
                                color: 'blue',
                                textDecorationLine: 'underline',
                              }}
                              title={
                                this.getParsedFiles(this.state.values[index][i])
                                  .length === 1
                                  ? this.getFileName(
                                      this.getParsedFiles(
                                        this.state.values[index][i],
                                      )[0],
                                    )
                                  : 'Files'
                              }
                            />
                          </TouchableOpacity>
                        ))} */}

                      {/* {e !== 'File Aupload' && e !== 'attachments' && ( */}
                      {i !== 0 && i !== 1 && i !== 2 && (
                        <TouchableOpacity
                          style={{
                            width: '40%',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          disabled={
                            this.state.values[index][i].startsWith('DocQ') ===
                            false
                          }
                          onPress={() =>
                            this.downloadFiless(
                              this.state.values[index][0],
                              index,
                            )
                          }>
                          <CustomLabel
                            containerStyle={{
                              width: '100%',
                              //flex: 1,
                              // overflow: 'hidden',
                              // height: 20,
                            }}
                            labelStyle={{
                              color: this.state.values[index][i].startsWith(
                                'DocQ',
                              )
                                ? 'blue'
                                : 'black',
                              textDecorationLine: this.state.values[index][
                                i
                              ].startsWith('DocQ')
                                ? 'underline'
                                : 'none',
                            }}
                            title={
                              this.state.values[index][i].startsWith('DocQ')
                                ? 'Download'
                                : this.state.values[index][i]
                            }
                          />
                        </TouchableOpacity>
                      )}
                      {/* )} */}
                    </View>
                  );
                })}

              <Row
                style={{
                  alignSelf: 'flex-end',
                  justifyContent: 'space-around',

                  width: '20%',
                }}>
                {!isVerified && (
                  <Icon
                    name={'edit'}
                    type={'feather'}
                    size={30}
                    color={Colors.maroon}
                    style={{marginRight: 10}}
                    onPress={() =>
                      this.editDetails(this.state.values[index][0])
                    }
                  />
                )}
                {/* <Icon
                  name={'download'}
                  type={'feather'}
                  size={30}
                  color={Colors.maroon}
                  style={
                    {
                      //marginRight: 10,
                    }
                  }
                  onPress={() =>
                    this.downloadFiless(this.state.values[index][0], index)
                  }
                /> */}
              </Row>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  // downloadFile = async (file) => {
  //   this.setState({
  //     showOverlay: false,
  //     loader: true,
  //     loaderText: 'Downloading file...',
  //   });
  //   const res = await fileViewer(file);
  //   if (!res) {
  //     this.setState({loader: false, loaderText: ''});
  //     return alert('Unable to download the file. Please try again');
  //   }
  //   if (res) {
  //     this.setState({loader: false, loaderText: ''}, () =>
  //       FileViewer.open(res.path())
  //         .then(() => console.log('success'))
  //         .catch((err) => alert('Error occured opening the file')),
  //     );
  //   }
  // };

  render() {
    const {keys} = this.state;
    const {name} = this.props.route.params;

    return (
      <Layout
        headerTitle={name}
        normal
        backScreen={'MyPersonalInfo'}
        navigation={this.props.navigation}
        noContentTag>
        {this.state.ApiLoader && (
          <View>
            <ActivityIndicator size={30} />
            <CustomLabel
              containerStyle={{alignSelf: 'center'}}
              title={'Fetching data'}
            />
          </View>
        )}
        {this.state.showOverlay && (
          <Overlay
            onBackdropPress={() => this.setState({showOverlay: false})}
            overlayStyle={{
              width: '70%',
              height: '70%',
              justifyContent: 'center',
              backgroundColor: Colors.white,
            }}
            isVisible={this.state.showOverlay}>
            <View
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                alignSelf: 'center',
              }}>
              <Image
                style={{width: '100%', height: '100%', resizeMode: 'stretch'}}
                source={{uri: `data:image/jpg;base64,${this.state.image}`}}
              />
              {/* <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: Colors.maroon,
                  marginBottom: 10,
                }}>
                Download files:
              </Text>
              {this.state.files.map((each, i) => {
                const num = i + 1 + '';
                return (
                  <TouchableOpacity onPress={() => this.downloadFile(each)}>
                    <Text
                      style={{
                        borderBottomColor: 'blue',
                        borderBottomWidth: 1,
                        color: 'blue',
                        marginBottom: 5,
                        maxWidth: '70%',
                      }}>
                      {'File ' + num}
                    </Text>
                  </TouchableOpacity>
                );
              })} */}
            </View>
          </Overlay>
        )}

        {this.state.loader && (
          <CustomLoader loaderText={this.state.loaderText} />
        )}
        <View>
          {this.state.keys?.length > 0 && (
            <FlatList
              data={this.state.keys}
              renderItem={this.renderItem2}
              keyExtractor={(item, i) => i + ''}
              style={{marginBottom: 50}}
            />
          )}
        </View>
        {(!keys && !this.state.ApiLoader) ||
          (keys?.length === 0 && !this.state.ApiLoader && (
            <CustomLabel labelStyle={{textAlign: 'center'}} title={'No data'} />
          ))}
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    backgroundColor: '#ffffff',
    paddingLeft: '5%',
    borderRadius: 10,
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    height: heightPercentageToDP('7'),
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
  },
});

export default StaffDetailsMaster;
