import { TextArea, VStack } from 'native-base';
import React, { Component } from 'react';
import {
  TextInput,
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import SubHeader from '../common/DrawerHeader';
import { CustomCalendar } from '../common/CustomCalendar';
//import CustomPicker from '../common/CustomPicker';
//import {CustomList} from '../common/CustomList';
//import {CustomButton} from '../common/CustomButton';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
//import {CustomList2} from '../common/CustomList2';
import config from '../../utils/config';
import { CustomTextArea } from '../common/CustomTextArea';
import { ApprovalStages } from '../common/ApprovalStages';
import { CalenderView } from '../common/CalenderView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Const from '../common/Constants';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomPicker from '../common/CustomPicker';
import CustomLoader from '../Task Allocation/CustomLoader';
import CustomModal from '../common/CustomModal';
import CustomLabel from '../common/CustomLabel';
import { CheckBox, Icon } from 'react-native-elements';
import { Colors } from '../../utils/configs/Colors';
import Error from '../popups/error';
import { CalenderView2 } from '../common/CalenderView2';
import AlternateStaffComp from './AlternateStaffComp';
import { isIOS } from '../../utils/configs/Constants';
import SuccessError from '../common/SuccessError';
import { CustomSelect } from '../common';
import { getAllReportees, noTokenAPi } from '../../utils/apis';
import { flex, flexDirection } from 'styled-system';
// import { CustomSelect } from '../common';
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];
const calendarType = "spinner";
const staffTypeDesignation = {
  STAFF_TYPE: 'Staff Type',
  DESIGNATION: 'Designation',
};

const screenWidth = Dimensions.get('window').width;
export default class HolidayWork extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedstaffTypeDesignation: staffTypeDesignation.STAFF_TYPE,
      // selectedbatchYearDepartment : batchYearDepartment.BATCH_YEAR,
      
      fromDate: moment(),
      toDate: moment(),
      
      // approvers : ApprovalStatus,
    };
  }
  RenderStaffTypeDEsignation = ({title, selected, onPress}) => {
    const backgroundColor = selected ? '#1B30A5' : '#f5f5f8';
    const color = selected ? '#f5f5f8' : '#1B30A5';
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.StaffTypeDesignationBtn, {backgroundColor}]}>
        <Text style={[styles.StaffTypeDesignationTxt, {color}]}>{title}</Text>
      </TouchableOpacity>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        {/* <SuccessError
          subTitle={this.state.error_message}
          error={this.state.error}
          isVisible={this.state.showAlert}
          deleteIconPress={() => this.setState({ showAlert: false })}
        /> */}
        <SubHeader
          title="HolidayWorkkkkkkkk"
          showBack={true}
          backScreen="Leaves"
          showBell={false}
          navigation={this.props.navigation}
        />
     
        <ScrollView contentContainerStyle={{ paddingBottom: 100, backgroundColor:'white'}}>
         <View style={{paddingLeft:10, paddingRight:10 }}>
          
          {/* New holiday/already worked */}
         <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'center', backgroundColor: '#ffffff', }}>
            <View style={{flexDirection: 'row', justifyContent: 'center', backgroundColor: '#f5f5f8',borderRadius: 50 }}>
              <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginTop: 8,
                                    marginBottom:8,
                                    padding:0
                                }}>
                    
                                {/* <this.RenderStaffTypeDEsignation  */}
                    
                                <this.RenderStaffTypeDEsignation
                                    title={'Staff Type'}
                                    selected={this.state.selectedstaffTypeDesignation === staffTypeDesignation.STAFF_TYPE}
                                    onPress={() => {
                                      this.setState({selectedstaffTypeDesignation: staffTypeDesignation.STAFF_TYPE})
                                    }}
                                />
                                  <this.RenderStaffTypeDEsignation
                                    title={'Designation'}
                                    selected={this.state.selectedstaffTypeDesignation === staffTypeDesignation.DESIGNATION}
                                    onPress={() => {
                                      console.log("sssssssssss")
                                      this.setState({selectedstaffTypeDesignation: staffTypeDesignation.DESIGNATION})
                                     } }
                                />
                        
                            </View>
                        </View>
          </View>
                                     
        {/* Date view */}
          <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  width: '100%',
                  alignSelf: 'center',
                  justifyContent: 'space-around',
                  backgroundColor: 'white',
                  paddingVertical: 10,
                }}>
              
                <View style={{ width: '100%', }}>
                  <CustomCalendar
                    title={'Date'}
                    date={this.state.ToDate}
                    FromDate={this.state.FromDate}
                    onPress={() => this.setState({ dateVisible1: true })}
                    isVisible={this.state.dateVisible1}
                    onConfirm={date => {
                      this.setState(
                        {
                          ToDate: date,
                          dateVisible1: false,
                          SelectedDate: true,
                          GetDetailedLeaves: [],
                        },
                        () => {
                          this.DateCheckerFunction();
                          this.GetDetailedLeaves();
                        },
                      );
                    }}
                    //style={{backgroundColor: SubThemeColor}}
                    textStyle={{ color: ThemeColor }}
                    onCancel={() => this.setState({ dateVisible1: false })}
                  />
                </View>
          </View>
        
          {/* from to view */}
          <View style={{flexDirection:'row', backgroundColor:'white', width:'100%', alignContent:'center', alignItems:'center'}}>
          <TouchableOpacity
                    onPress={() => this.setState({ showSeconedDatePicker: true })}>
                    <View style={{ width: '100%' }}>
                      <View style={styles.labelContainer}>
                        <Text style={styles.label}>From Time</Text>
                        <View
                          style={{
                            width: screenWidth / 2.3,
                            //backgroundColor: SubThemeColor,
                            height: 40,
                            borderRadius: 5,
                            borderWidth: 0.5,
                            marginTop: 10,
                            justifyContent: 'center',
                            //alignItems: 'center',
                            paddingLeft: 10,
                          }}>
                          <View
                            style={{
                              width: '100%',
                              alignItems: 'center',
                              flexDirection: 'row',
                            }}>
                           

                            <Text
                              style={[
                                styles.label,
                                
                                { color: ThemeColor, marginLeft: 10,flex:0.9 },
                              ]}>
                              {moment(this.state.SecondHalfFromTime).format('h:mm a')}
                            </Text>

                            <Icon
                            // style={{flex:0.2}}
                              size={16}
                              name="clock"
                              color={'black'}
                              type={'entypo'}
                            />
                          </View>
                        </View>
                      </View>
                      <DateTimePickerModal
                        isVisible={this.state.showSeconedDatePicker}
                        mode="time"
                        // minimumDate={new Date(Date.now() - 86400000)}
                        // date={new Date(Date.now() - 86400000)}
                        onConfirm={this.HaldleSecondFromTime}
                        onCancel={() => { this.setState({ showSeconedDatePicker: false }) }}
                      />
                    </View>
          </TouchableOpacity>
          <TouchableOpacity
                    onPress={() => this.setState({ showSeconedDatePicker: true })}>
                    <View style={{ width: '100%' }}>
                      <View style={styles.labelContainer}>
                        <Text style={styles.label}>From Time</Text>
                        <View
                          style={{
                            width: screenWidth / 2.3,
                            //backgroundColor: SubThemeColor,
                            height: 40,
                            borderRadius: 5,
                            borderWidth: 0.5,
                            marginTop: 10,
                            justifyContent: 'center',
                            //alignItems: 'center',
                            paddingLeft: 10,
                          }}>
                          <View
                            style={{
                              width: '100%',
                              alignItems: 'center',
                              flexDirection: 'row',
                            }}>
                           

                            <Text
                              style={[
                                styles.label,
                                
                                { color: ThemeColor, marginLeft: 10,flex:0.9 },
                              ]}>
                              {moment(this.state.SecondHalfFromTime).format('h:mm a')}
                            </Text>

                            <Icon
                            // style={{flex:0.2}}
                              size={16}
                              name="clock"
                              color={'black'}
                              type={'entypo'}
                            />
                          </View>
                        </View>
                      </View>
                      <DateTimePickerModal
                        isVisible={this.state.showSeconedDatePicker}
                        mode="time"
                        // minimumDate={new Date(Date.now() - 86400000)}
                        // date={new Date(Date.now() - 86400000)}
                        onConfirm={this.HaldleSecondFromTime}
                        onCancel={() => { this.setState({ showSeconedDatePicker: false }) }}
                      />
                    </View>
          </TouchableOpacity>
          </View>

          <View>
          
          <CustomSelect
                    items={this.state.departments}
                    // onSelectedItemsChange={value => {
                    //   console.log('vvv', value);
                    //   this.setState(
                    //     {
                    //       staffList: [],
                    //       selectedStaff: [],
                    //       selectedDepartment: value,
                    //     },
                    //     () => {
                    //       console.log(
                    //         'this.state.allStaffs = ',
                    //         this.state.allStaffs,
                    //       );
                    //       let Staff = this.state.allStaffs;
                    //       let newStaff = [];
                    //       newStaff = Staff.filter((item, index) => {
                    //         return item.department == value;
                    //       });
                    //       console.log('newStaff = ', newStaff);
                    //       this.setState({ staffList: newStaff });
                    //     },
                    //   );
                    // }}
                    borderColor={'#ccc'}
                    width={'95%'}
                    selectedItems={this.state.selectedDepartment}
                    selectText="Required Leave Type"
                    searchInputPlaceholderText="Required Leave Type"
                    single
                  />
                
          </View>

          <View style={{marginTop: 10}}>
            <Text style={[styles.label, {margin: 10}]}>Topic Name</Text>

            <TextInput
              multiline
              // backgroundColor={SubThemeColor}
              placeholderTextColor={ThemeColor}
              style={{
                alignSelf: 'center',
                width: '90%',
                minHeight: 40,
                maxHeight: 120,
                padding: 10,
                borderRadius: 10,
                 borderWidth:1,
                 borderColor:'gray'
              }}
              placeholder="Purpose"
              value={this.state.Complaint}
              blurOnSubmit={true}
              onChangeText={text => {
                this.setState({Complaint: text});
              }}
            />
          </View>

          <View
                style={styles_form.reasonFieldBox}>
                <TextInput
                    multiline={true}
                    numberOfLines={4}
                    onChangeText={text => setcircular(text)}
                    // value={"aaaaaa"}
                    style={styles_form.reasonTextInput}
                    placeholder='Remark:'
                    placeholderTextColor={config.MainColor}
                />
                <Image style={[styles_form.categoryIcon, {tintColor: config.MainColor}]} source={require('../../assets/material-symbols_sticky-note-2-outline-rounded_3x.png')} />
          </View>
          
          <View style={{paddingBottom: 40}}>
              { approvers?.length != 0 && <ApprovalStatus color={config.MainColor} data={approvers} />}
          </View>


         </View>
        </ScrollView>
      </View>
    );
  }
}
const styles_form = StyleSheet.create({
  topImage: {
      // flex: 1,
      width: '100%',
      height: 147,
      resizeMode: 'contain',
      position: 'relative',
  },
  imageTextContainer: {
      position: 'absolute',
      top: 22,
      right: '20%',
  },
  imageBtn: {
      backgroundColor: 'white',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 7
  },
  leaveCount: {
      color: 'white',
      fontSize: 26,
      fontWeight: '600'
  },
  dateBtn: {
      height: 57,
      width: 47,
      alignItems: 'center',
      borderRadius: 5,
      borderWidth: 0.2,
      flexDirection: 'column',
      marginRight: 11,
  },
  dateViewDay: {
      color: '#120E66',
      fontSize: 10,
      fontWeight: '500',
      lineHeight: 12,
      fontFamily: 'Roboto',
      marginTop: 6,
  },
  dateViewDate: {
      color: '#120E66',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Roboto',
      marginTop: 7,
  },
  dateViewMonth: {
      color: '#120E66',
      fontSize: 8,
      fontWeight: '500',
      lineHeight: 9,
      fontFamily: 'Roboto',
  },
  dateText: {
      color: '#696F8C',
      fontFamily: 'Lato',
      fontSize: 13,
      fontWeight: '600',
      // backgroundColor: 'black'
  },
  arrow: {
      height: 16,
      width: 16,
      resizeMode: 'contain',
      marginHorizontal: 8,
  },
  dateMainView: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      width: '45%',
      borderColor: '#D9DaE5',
      borderRadius: 8,
      paddingHorizontal: 12,
  },
  fromToTxt: {
      color: '#120E66',
      fontFamily: 'Roboto',
      fontSize: 14,
      fontWeight: '600',
  },
  topView: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      // borderTopWidth: 15,
      // borderColor: '#F5F5F5',
      backgroundColor: 'white',
  },
  dateHeaderMainView: {
      paddingHorizontal: 19,
      paddingVertical: 10,
      backgroundColor: 'white',
      borderBottomWidth: 20,
      borderColor: '#F5F5F5',
  },
  categoryIcon: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 23,
      height: 23,
      resizeMode: 'contain'
  },
  reasonFieldBox: {
      backgroundColor: "white",
      borderColor: '#D9DaE5',
      borderWidth: 1,
      borderRadius: 5,
      marginTop:10
  },
  attachmentContainer: {
      borderColor: '#D9DaE5',
      borderWidth: 1,
      justifyContent: 'space-between',
      
      marginTop: 10,
      padding: 10,
      // paddingVertical: 4,
      marginBottom: 10,
      borderRadius: 5
  },
  plusIconContainer: {
      backgroundColor: config.MainColor,
      height: 40,
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
  },
  addDocumentIcon: {
      tintColor: config.MainColor,
      width: 22,
      height: 22,
      resizeMode: 'contain',
      marginRight: 10,
  },

  // Table Css
  itemTableContainer: {
      marginTop: 15,
      backgroundColor: 'white',
      elevation: 2,
      margin: 5,
      borderRadius: 10,
      flexDirection: 'row', 
      flexWrap: 'wrap',
      marginBottom: 30
  },
  itemTableWrapper: {
      flexDirection: 'column', 
      flex: 1
  },
  itemTableHead: {
      alignItems: 'center', 
      paddingVertical: 10,
      paddingHorizontal: 10, 
      borderTopLeftRadius: 10, 
      borderTopRightRadius: 10, 
      flexDirection: 'row', 
      flex: 1, 
      backgroundColor: config.MainColor,
  },
  itemTableHeadText: {
      color: 'white'
  },
  itemTableRow: {
      alignItems: 'center', 
      paddingVertical: 6, 
      marginHorizontal: 10, 
      borderTopLeftRadius: 10, 
      borderTopRightRadius: 10, 
      flexDirection: 'row', 
      flex: 1
  },
  itemTableRowText: {
      color: 'black', 
      fontSize: 13,
  },
  tabHeadTexts: {
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center'
  },
  itemRemoveIcon: { 
      backgroundColor: config.MainColor, 
      borderRadius: 5, 
      width: 20, 
      height: 20, 
      justifyContent: 'center', 
      alignItems: 'center' 
  },
  addItemBtnContainer: {
      flex: 1, 
      flexDirection: 'row', 
      paddingHorizontal: 10, 
      justifyContent: 'center', 
      marginBottom: 7
  },
  checkboxIcon: {
      borderRadius: 5,
      borderWidth: 1,
      borderColor: config.MainColor,
      marginRight: -6
  },
  columnOne: {
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center'
  },
  columnCheckbox: {
      flex: 1, 
      flexDirection: 'row', 
      justifyContent: 'center'
  },
  checkboxText: {
      color: "black",
      textDecorationLine: "none",
      fontSize: 14
  },
  reasonTextInput: {
      padding: 15, 
      textAlignVertical: "top",
      paddingRight: 35,
      fontWeight: '600'
  },
  uploadedFileText: {
      color: config.PrimaryColor,
      fontWeight: '600',
      fontSize: 15
  },
  mainBtn: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#12B6C9',
      borderRadius: 5,
      height: 39,
      marginBottom: 3
  },
  mainBtnText: {
      color: 'white', 
      fontWeight: '600', 
      fontSize: 16,
  },
  subjectField: {
      borderWidth: 1, 
      borderColor: '#D9DaE5', 
      borderRadius: 10, 
      marginTop: 10, 
      marginBottom: 10, 
      paddingHorizontal: 20, 
      fontWeight: '600'
  }
});

const styles = StyleSheet.create({
  reasonFieldBox: {
    backgroundColor: "white",
    borderColor: '#D9DaE5',
    borderWidth: 1,
    borderRadius: 5,
},
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
  StaffTypeDesignationBtn: {
    width: '45%',
    paddingVertical: 8,
    // borderWidth: 0.5,
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: '#1B30A5',
  },
  dateBtn: {
    height: 57,
    width: 47,
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 0.2,
    flexDirection: 'column',
    marginRight: 11,
},
dateViewDay: {
    color: '#120E66',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
    fontFamily: 'Roboto',
    marginTop: 6,
},
dateViewDate: {
    color: '#120E66',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
    marginTop: 7,
},
dateViewMonth: {
    color: '#120E66',
    fontSize: 8,
    fontWeight: '500',
    lineHeight: 9,
    fontFamily: 'Roboto',
},
dateText: {
    color: '#696F8C',
    fontFamily: 'Lato',
    fontSize: 13,
    fontWeight: '600',
    // backgroundColor: 'black'
},
arrow: {
    height: 16,
    width: 16,
    resizeMode: 'contain',
    marginHorizontal: 8,
},
dateMainView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    width: '45%',
    borderColor: '#D9DaE5',
    borderRadius: 8,
    paddingHorizontal: 12,
},
fromToTxt: {
    color: '#120E66',
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '600',
},
  StaffTypeDesignationTxt: {
    color: '#120E66',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Roboto',
  },
  dateMainView: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    width: '45%',
    borderColor: '#D9DaE5',
    borderRadius: 8,
    paddingHorizontal: 12,
},
fromToTxt: {
  color: '#120E66',
  fontFamily: 'Roboto',
  fontSize: 14,
  fontWeight: '600',
},
  item: {
    borderRadius: 15,
    margin: 10,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#f1f1f1',
    borderWidth: 0.5,
    shadowColor: 'silver',
    shadowOffset: { width: 0, height: 0 },
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
});
const styles_dropdown = StyleSheet.create({
  fieldWrapper: {
      // paddingVertical: 4,
      marginTop: 10,
      marginBottom: 2,
      // paddingHorizontal: 8, 
      width: '100%',
  },
  dropdownInputGroup: { 
      paddingLeft: 10, 
      paddingRight: 15, 
      borderRadius: 8, 
      borderColor: '#D9DaE5', 
      borderWidth: 1,
      height: 50, 
      borderTopWidth: 1, 
      borderRightWidth: 1 ,
      
  }, 
  dropdownMenuSubsection: {
      borderBottomWidth: 0, 
      marginBottom: 0,
      borderRadius:10
  },
  dropdownMenu: { 
      marginBottom: 0, 
      paddingTop: 0, 
      paddingLeft: 15,
      borderRadius: 8, 
      borderColor: '#D9DaE5', 
      borderWidth: 1, 
      height: 50,
      fontSize: 18
  },
  dropdownContainer: { 
      marginBottom: 0, 
      borderRadius: 8, 
      borderColor: '#D9DaE5', 
      borderWidth: 1
  },
  dropdownFieldWrapper: { 
      width: '50%', 
      paddingHorizontal: 10, 
      paddingTop: 5 
  },
  dropdownChevronIcon: {
      position: "absolute", 
      top: 17, 
      right: 13
  },
  selectedTextStyle: {
      fontSize: 14, 
      fontWeight: '600', 
      color: config.MainColor
  },
  dropdownPlaceholderText: {
      color: config.MainColor,
      fontWeight: '600',
  }

});