import React, {Component} from 'react';
import {ActivityIndicator, FlatList, RefreshControl} from 'react-native';
import {View, StyleSheet, Dimensions} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {CustomTabs} from '../common/CustomTabs';
import DrawerHeader from '../common/DrawerHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Const from '../common/Constants';

import CustomLabel from '../common/CustomLabel';
import {TouchableWithoutFeedback} from 'react-native';
import {Colors} from '../../utils/configs/Colors';
import {ListItem} from 'react-native-elements';
import {fileViewer} from '../../utils/helperFunctions';
import FileViewer from 'react-native-file-viewer';
import CustomLoader from '../Task Allocation/CustomLoader';
import {SafeAreaView} from 'react-native';
import SuccessError from '../common/SuccessError';
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];

export default class Leaves extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: [],
      loaderText: '',
      files: [],
      values: [],
      keys: [],
      activeTab: 'Add',
      show: false,
      currentIndex: 0,

      modalVisible: false,
    };
  }

  componentDidMount() {
    this.retrieveNeedToUpdateData();
    this.focus = this.props.navigation.addListener('focus', () => {
      this.retrieveNeedToUpdateData();
    });
  }
  componentWillUnmount() {
    this.props.navigation.removeListener(this.focus);
    clearInterval(this.clearInterval);
  }

  retrieveNeedToUpdateData = async () => {
    this.setState({ApiLoader: true});

    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const institute_id = await AsyncStorage.getItem('institute_id');
      const url = `${Const}api/Master/GetMasterFormByStaffCodeInstitituteId/${user_id}/${institute_id}`;
      const response = await axios.get(url);
      const {data} = response;
      // const addNewDocs = this.getNewDocs();
      // const viewDocs = this.getViewDocs();

      console.log('url', url);
      console.log('data', data);
      //console.log('active', this.state.activeTab);
      this.setState({
        ApiLoader: false,
        formData: data,
        refreshing: false,
        show: false,
        error: false,
      });
    } catch (e) {
      this.setState({
        ApiLoader: false,
        refreshing: false,
        show: true,
        error: true,
        error_message: e.message,
      });
      //alert('Error retreiving form data: ' + e);
    }
  };

  renderItem = ({item, index}) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          if (this.state.activeTab === 'Edit/View') {
            return this.props.navigation.navigate('ViewDetails', {
              formId: item.id,
              name: item.name,
              isVerified: item.isVerified,
            });
          }
          this.props.navigation.navigate('EditDetails', {
            formId: item.id,
            name: item.name,
            isMultiple: item.isMultiple,
            recordId: '',
          });
        }}>
        <View
          key={index}
          style={{
            margin: 5,
            borderRadius: 10,

            backgroundColor: index % 2 ? Colors.white : SubThemeColor,
            opacity: index % 2 ? 0.5 : 1,
          }}>
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              justifyContent: 'space-between',
            }}>
            <CustomLabel
              labelStyle={{textTransform: 'capitalize'}}
              title={item.name}
            />
            <ListItem.Chevron
              color={Colors.maroon}
              containerStyle={{marginRight: 10}}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
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

  // renderItem2 = ({item, index}) => {
  //   //console.log(item);
  //   return (
  //     <TouchableWithoutFeedback
  //       onPress={
  //         () => {}
  //         //this.props.navigation.navigate('EditDetails', {formId: 1})
  //       }>
  //       <View>
  //         <View
  //           key={index}
  //           style={{
  //             margin: 5,
  //             borderRadius: 10,
  //             backgroundColor: index % 2 ? 'white' : SubThemeColor,
  //           }}>
  //           <View
  //             style={{
  //               width: '100%',
  //               alignSelf: 'center',
  //               //flexDirection: 'row',
  //               //alignItems: 'center',
  //               paddingVertical: 10,
  //             }}>
  //             {item.map((e, i) => (
  //               <View
  //                 style={{
  //                   flexDirection: 'row',
  //                   width: '100%',
  //                   justifyContent: 'space-around',
  //                 }}>
  //                 {this.state.values[index][i] !== '' && (
  //                   <CustomLabel
  //                     containerStyle={{width: '50%'}}
  //                     labelStyle={{color: Colors.header, fontSize: 15}}
  //                     title={e}
  //                   />
  //                 )}

  //                 {e === 'File Aupload' && this.state.values[index][i] !== '' && (
  //                   <TouchableOpacity
  //                     style={{
  //                       width: '40%',
  //                       alignSelf: 'center',
  //                       flex: 1,
  //                       paddingLeft: 5,
  //                     }}
  //                     onPress={() =>
  //                       this.setState(
  //                         {
  //                           files: this.getParsedFiles(
  //                             this.state.values[index][i],
  //                           ),
  //                         },
  //                         () => this.setState({showOverlay: true}),
  //                       )
  //                     }>
  //                     <CustomLabel
  //                       containerStyle={{
  //                         width: '100%',
  //                         //flex: 1,

  //                         alignSelf: 'center',
  //                         // overflow: 'hidden',
  //                         // height: 20,
  //                       }}
  //                       labelStyle={{
  //                         color: 'blue',
  //                         textDecorationLine: 'underline',
  //                       }}
  //                       title={'Files'}
  //                     />
  //                   </TouchableOpacity>
  //                 )}

  //                 {e !== 'File Aupload' && (
  //                   <CustomLabel
  //                     containerStyle={{
  //                       width: '40%',
  //                       flex: 1,
  //                       // overflow: 'hidden',
  //                       // height: 20,
  //                     }}
  //                     title={this.state.values[index][i]}
  //                   />
  //                 )}
  //               </View>
  //             ))}
  //           </View>
  //         </View>
  //       </View>
  //     </TouchableWithoutFeedback>
  //   );
  // };
  _onRefresh() {
    this.setState({refreshing: true});
    if (this.state.activeTab == 'Add') {
      this.retrieveNeedToUpdateData();
      return;
    }
    if (this.state.activeTab == 'Edit/View') {
      this.retrieveNeedToUpdateData();
      // this.retrieveEdit/ViewData();

      return;
    }
  }

  getNewDocs = formData => {
    //const {formData} = this.state;
    const filteredData = formData.filter(
      (e, i) => e.isMultiple || (!e.isMultiple && e.isNew),
    );
    //console.log('filteredData', filteredData);

    return filteredData;
  };
  getViewDocs = formData => {
    //const {formData} = this.state;
    const filteredData = formData.filter((e, i) => !e.isNew || e.isVerified);
    //console.log('filteredData', filteredData);

    return filteredData;
  };
  render() {
    const {activeTab} = this.state;
    //console.log('formData', formData);
    return (
      <View style={styles.container}>
        <SuccessError
          isVisible={this.state.show}
          error={this.state.error}
          deleteIconPress={() => this.setState({show: false})}
          subTitle={this.state.error_message}
        />
        {/*   */}
        <DrawerHeader
          title="Dynamic DocsQ"
          showBack={true}
          backScreen="Home"
          showBell={false}
          navigation={this.props.navigation}
        />

        <View style={{flex: 1}}>
          <CustomTabs
            borderRadius={20}
            height={50}
            width={'95%'}
            textSize={15}
            color={ThemeColor}
            backgroundColor={SubThemeColor}
            ActiveTab={activeTab}
            tab1Width={'50%'}
            tab2Width={'50%'}
            tab1="Add"
            tab2="Edit/View"
            onPress={value => {
              this.setState({activeTab: value}, function () {
                if (this.state.activeTab == 'Add') {
                  this.retrieveNeedToUpdateData();
                  return;
                }
                if (this.state.activeTab == 'Edit/View') {
                  this.retrieveNeedToUpdateData();
                  //this.retrieveEdit/ViewData();
                  //console.log('Selected tab = ', value);
                  return;
                }
              });
            }}
          />
          {!this.state.ApiLoader ? (
            ((this.state.formData.length === 0 ||
              this.getNewDocs(this.state.formData).length === 0) &&
              this.state.activeTab === 'Add') ||
            ((this.state.formData.length === 0 ||
              this.getViewDocs(this.state.formData).length === 0) &&
              this.state.activeTab === 'Edit/View') ? (
              //<Text style={{alignSelf:"center",marginTop:10}}>No Data Available</Text>
              <CustomLabel
                containerStyle={{alignSelf: 'center'}}
                title={'No Data found'}
              />
            ) : null
          ) : null}
          <View
            style={{
              width: '95%',
              alignSelf: 'center',
              backgroundColor: 'transparent',
              borderRadius: 10,
              marginBottom: 20,
            }}>
            {this.state.activeTab == 'Add' && this.state.formData?.length > 0 && (
              <View
                style={{
                  //paddingBottom: 20,
                  marginBottom: Dimensions.get('window').height * 0.2,
                }}>
                <FlatList
                  keyExtractor={(item, index) => index + ''}
                  //data={this.state.formData}
                  data={this.getNewDocs(this.state.formData)}
                  renderItem={this.renderItem}
                  refreshControl={
                    <RefreshControl
                      style={{backgroundColor: 'transparent'}}
                      refreshing={this.state.refreshing}
                      onRefresh={this._onRefresh.bind(this)}
                      tintColor="#ff0000"
                      title="Loading..."
                      titleColor="#00ff00"
                      //colors={['#ff0000', '#00ff00', '#0000ff']}
                      //progressBackgroundColor="#ffff00"
                    />
                  }
                  refreshing={this.state.refreshing}
                />
              </View>
            )}
            {this.state.ApiLoader && (
              <View>
                <ActivityIndicator size={30} />
                <CustomLabel
                  containerStyle={{alignSelf: 'center'}}
                  title={'Fetching data'}
                />
              </View>
            )}
            {this.state.activeTab == 'Edit/View' &&
              this.state.formData?.length > 0 && (
                <View
                  style={{
                    //paddingBottom: 20,
                    marginBottom: Dimensions.get('window').height * 0.2,
                  }}>
                  <FlatList
                    data={this.getViewDocs(this.state.formData)}
                    //data={this.state.formData}
                    renderItem={this.renderItem}
                    keyExtractor={(item, i) => i + ''}
                    refreshControl={
                      <RefreshControl
                        style={{backgroundColor: 'transparent'}}
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh.bind(this)}
                        tintColor="#ff0000"
                        title="Loading..."
                        titleColor="#00ff00"
                        //colors={['#ff0000', '#00ff00', '#0000ff']}
                        //progressBackgroundColor="#ffff00"
                      />
                    }
                    refreshing={this.state.refreshing}
                  />
                </View>
              )}
          </View>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.header,
  },
  item: {
    borderRadius: 15,
    margin: 10,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#f1f1f1',
    borderWidth: 0.5,
    shadowColor: 'silver',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    height: hp('5'),
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#000000',
  },
  labelContainer: {
    margin: '1.5%',
  },
  dateContainer: {
    backgroundColor: ThemeColor,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'white',
  },
  text3: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  text2: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold',
  },
  buttonStyle: {
    backgroundColor: SubThemeColor,
    //backgroundColor: "rgba(0, 0, 0, 0.1)",
    width: 200,
    //marginLeft: -100,
    justifyContent: 'flex-start',
  },
  imageStyle: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginHorizontal: 10,
  },
  headerContainer: {
    width: '100%',
    //height: 40,
    flexDirection: 'row',
    borderRadius: 15,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    //paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderStyle: {
    //backgroundColor: 'white',
    fontSize: 20,
    padding: 5,
    //marginTop: 20,
    color: ThemeColor,
  },
  sectionListItemStyle: {
    fontSize: 15,
    padding: 5,
    paddingVertical: 10,
    color: 'black',
    backgroundColor: 'white',
  },
  listItemSeparatorStyle: {
    height: 0.5,
    width: '100%',
    //backgroundColor: '#C8C8C8',
  },
});
