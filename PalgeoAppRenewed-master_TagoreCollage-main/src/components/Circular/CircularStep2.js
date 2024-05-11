import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableWithoutFeedback} from 'react-native';
import {VStack, Card} from 'native-base';
import DrawerHeader from '../common/DrawerHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Const from '../common/Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
import Loader from '../common/Loader';
import CheckBox from 'react-native-check-box';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Nodata from '../common/NoData';
import {ListItem} from 'react-native-elements';
import {ScrollView} from 'react-native';
import CustomSelect from '../common/CustomSelect';
import {TouchableOpacity} from 'react-native';
import CustomLabel from '../common/CustomLabel';
import {Colors} from '../../utils/configs/Colors';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import CustomCard from '../common/CustomCard';
import SearchBar from 'react-native-elements/dist/searchbar/SearchBar-ios';
import GradientButton from '../common/GradientButton';
import Stepper from '../common/Stepper';
import StaffLocation from '../ManagerReports/StaffLocation';
import SuccessError from '../common/SuccessError';
import AnimatedLoader from '../common/AnimatedLoader';
import {CustomButton} from '../common/CustomButton';
export default class CircularStep2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      dataSource: [],
      showAlert: false,
      loader: false,
      isLoading: true,
      text: '',
      bearer_token: '',
      showAlert1: false,
      error_message: '',
      filteredSource: [],
    };
    this.arrayholder = [];
  }
  componentDidMount() {
    AsyncStorage.getItem('bearer_token').then(bearer_token => {
      this.setState({bearer_token: bearer_token}, () => {
        this.getData(bearer_token);
      });
    });
  }
  send = () => {
    var staffArr = [];
    this.state.dataSource.map((item, index) => {
      {
        item.others.map((item1, index1) => {
          item1.member.map((item2, index1) => {
            if (item2.isChecked) {
              staffArr.push(item2.id);
            }
          });
        });
      }
    });
    if (staffArr.length == 0) {
      this.setState({
        showAlert1: true,
        error_message: 'Select staff members',
        showAlert: false,
        error: true,
      });
    } else {
      this.props.navigation.navigate('CircularStep3', {data: staffArr});
    }
  };
  getData = bearer => {
    var college = this.props.route.params.collage;
    var department = this.props.route.params.department;
    var designation = this.props.route.params.designation;
    this.setState({loader: true});
    fetch(Const + 'api/StaffTaskAllotment/GetTreeForStaffAllotment', {
      method: 'POST',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: 'Bearer ' + bearer,
        Accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify({
        Institite_Id: college[0],
        DepartmentList: department,
        DesignationList: designation,
      }),
    })
      .then(response => response.json())
      .then(json => {
        console.log(
          'body',
          JSON.stringify({
            Institite_Id: college[0],
            DepartmentList: department,
            DesignationList: designation,
          }),
        );
        if (Object.entries(json).length > 0) {
          var mainArr = [];
          var mainArr1 = [];
          Object.entries(json).map(([make1, type1]) => {
            var arr = [];
            mainArr.push(make1);
            mainArr.map((item, index) => {
              Object.entries(type1).map(([make, type]) => {
                var mem = type;
                var memArr = [];
                for (var a = 0; a < mem.length; a++) {
                  var memObj = {
                    id: '',
                    name: '',
                    isChecked: false,
                  };
                  var sliptmember = mem[a].split('-');
                  var memObj = {
                    id: sliptmember[1],
                    name: sliptmember[0],
                  };
                  memArr.push(memObj);
                }
                var obj = {
                  desig: make,
                  member: memArr,
                  is_checked: false,
                  show: false,
                };
                arr.push(obj);
              });
              var newObj = {
                id: item,
                name: item,
                isChecked: false,
                others: arr,
              };
              mainArr1.push(newObj);
            });
          });
          this.arrayholder = mainArr1;
          console.log('main+++', JSON.stringify(mainArr1, null, 2));
          this.setState({
            loader: false,
            dataSource: mainArr1,
            filteredSource: mainArr1,
          });
        } else {
          this.setState({loader: false, dataSource: []});
        }
      })
      .catch(error => {
        this.setState({loader: false});
      });
  };
  SearchFilterFunction(text) {
    const newData = this.arrayholder.filter(function (item, index) {
      const itemData = item.desig ? item.desig.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      dataSource: newData,
      text: text,
    });
  }
  handleCheckbox = (mainIndex, secondIndex, index, status) => {
    const newArray = [...this.state.dataSource];
    newArray[mainIndex].others[secondIndex].member[index].isChecked = !status;
    this.setState({dataSource: newArray});
  };
  handleCheckbox1 = (mainIndex, secondIndex, status) => {
    const newArray = [...this.state.dataSource];
    newArray[mainIndex].others[secondIndex].isChecked = !status;
    var IndexMemberArr = newArray[mainIndex].others[secondIndex].member;
    IndexMemberArr.map((item, index) => {
      if (!status) {
        item.isChecked = true;
      } else if (status) {
        item.isChecked = false;
      }
    });
    this.setState({dataSource: newArray});
  };
  handleCheckbox0 = (mainIndex, status) => {
    const newArray = [...this.state.dataSource];
    newArray[mainIndex].isChecked = !status;
    var IndexDesigArr = newArray[mainIndex].others;
    IndexDesigArr.map((item, index) => {
      if (!status) {
        item.isChecked = true;
      } else if (status) {
        item.isChecked = false;
      }
      item.member.map((item1, index1) => {
        if (!status) {
          item1.isChecked = true;
        } else if (status) {
          item1.isChecked = false;
        }
      });
    });
    this.setState({dataSource: newArray});
  };

  filterName = (text, item, index, mainIndex) => {
    this.setState({search: text});
    let original = this.state.dataSource;

    let staffList = original[mainIndex].others[index].member;

    staffList = staffList.filter(e =>
      e.name.toUpperCase().includes(text.toUpperCase()),
    );
    original[mainIndex].others[index].member = [...staffList];
    this.setState({filteredSource: [...original]});
    console.log('staff', original[mainIndex].others);
  };

  handleShow = (item, index, mainIndex) => {
    let newA = [...this.state.dataSource];
    newA[mainIndex].others[index].show = !newA[mainIndex].others[index].show;
    this.setState({dataSource: [...newA]});
  };

  render() {
    console.log('dd', this.state.dataSource.length);
    if (this.state.loader) {
      return <Loader />;
    }
    if (this.state.dataSource.length === 0) {
      return (
        <>
          <DrawerHeader
            title="E-Circular"
            showBack={true}
            backScreen="Circular"
            navigation={this.props.navigation}
          />

          <Nodata />
        </>
      );
    }
    return (
      <View style={{flex: 1}}>
        <AnimatedLoader doNotShowDeleteIcon isVisible={this.state.showAlert} />
        <SuccessError
          isVisible={this.state.showAlert1}
          error={this.state.error}
          deleteIconPress={() => this.setState({showAlert1: false})}
          subTitle={this.state.error_message}
        />
        <DrawerHeader
          title="E-Circular"
          showBack={true}
          backScreen="Circular"
          navigation={this.props.navigation}
        />
        <Stepper step2 />
        <ScrollView>
          <View style={{margin: '1%'}}>
            {/* <View style={{marginTop:'4%',marginLeft:'1%',marginRight:'1%'}}>
                            <View>
                            <Item regular  style={styles.item}>
                                <Input 
                                    placeholder='Search by department...' 
                                    style={styles.input}
                                    value = {this.state.userNameOrEmailAddress}
                                    onChangeText={text => this.SearchFilterFunction(text)}
                                 />
                                <Icon active name='search' type="FontAwesome" style={{fontSize:17,color:'#f05760'}} onPress={this.showPassword} />
                            </Item>
                        </View>
                    </View> */}
            <View style={{marginTop: 15}}>
              {this.state.filteredSource.map((item0, index0) => {
                return (
                  <View key={item0.id}>
                    <View style={styles.row}>
                      <CheckBox
                        isChecked={item0.isChecked}
                        onClick={() =>
                          this.handleCheckbox0(index0, item0.isChecked)
                        }
                        checkedCheckBoxColor="#f05760"
                      />
                      <Text
                        style={{
                          fontFamily: 'Poppins-SemiBold',
                          fontSize: 14,
                          marginLeft: 3,
                          marginBottom: 8,
                        }}>
                        {item0.name}
                      </Text>
                    </View>
                    <ScrollView nestedScrollEnabled>
                      <VStack>
                        {item0.others.map((item, index1) => {
                          return (
                            <View>
                              <TouchableOpacity
                                onPress={() =>
                                  this.handleShow(item, index1, index0)
                                }>
                                <View
                                  style={{
                                    borderColor: Colors.button[0],
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    marginVertical: 10,
                                    padding: 10,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: '90%',
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                  }}>
                                  <CustomLabel title={item.desig} />
                                  <Icon
                                    name={'chevron-down-sharp'}
                                    type={'ionicon'}
                                  />
                                </View>
                              </TouchableOpacity>
                              {item.show && (
                                <CustomCard
                                  style={{
                                    margin: '1%',
                                    //elevation: 4,
                                    borderRadius: 10,
                                    padding: '1%',
                                  }}
                                  key={index1}>
                                  <SearchBar
                                    placeholder="Search a staff"
                                    onChangeText={text =>
                                      this.filterName(
                                        text,
                                        item,
                                        index1,
                                        index0,
                                      )
                                    }
                                    value={this.state.search || ''}
                                    inputContainerStyle={{
                                      //padding: 0,
                                      borderWidth: 1,
                                      borderBottomWidth: 1,
                                      borderColor: Colors.overlay,
                                    }}
                                  />
                                  <ListItem
                                    itemDivider
                                    style={{borderRadius: 10}}>
                                    <CheckBox
                                      isChecked={item.isChecked}
                                      onClick={() =>
                                        this.handleCheckbox1(
                                          index0,
                                          index1,
                                          item.isChecked,
                                        )
                                      }
                                      checkedCheckBoxColor="#f05760"
                                    />
                                    <Text
                                      style={{
                                        fontFamily: 'Poppins-SemiBold',
                                        fontSize: 14,
                                      }}>
                                      {'All Staff'}
                                    </Text>
                                  </ListItem>
                                  {item.member.map((item1, index) => {
                                    return (
                                      <ListItem key={item1.id}>
                                        <CheckBox
                                          isChecked={item1.isChecked}
                                          onClick={() =>
                                            this.handleCheckbox(
                                              index0,
                                              index1,
                                              index,
                                              item1.isChecked,
                                            )
                                          }
                                          checkedCheckBoxColor="#f05760"
                                        />
                                        <Text
                                          style={{
                                            fontFamily: 'Poppins-Regular',
                                            fontSize: 12,
                                            marginLeft: wp('2'),
                                          }}>
                                          {item1.name}
                                        </Text>
                                      </ListItem>
                                    );
                                  })}
                                </CustomCard>
                              )}
                            </View>
                          );
                        })}
                      </VStack>
                    </ScrollView>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <CustomButton
          onPress={this.send}
          color={Colors.button[0]}
          title={'Next'}
          marginTop={20}
          marginBottom={20}
          width={'40%'}
          radius={120}
          textStyle={{fontSize: 20}}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    margin: '1%',
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12.5,
    margin: '1%',
    color: '#909090',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#c9c3c5',
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
    backgroundColor: '#ffffff',
    paddingLeft: '5%',
    borderRadius: 10,
    borderColor: '#f1f1f1',
    borderWidth: 1,
    borderRightWidth: 0,
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    height: hp('7'),
    borderColor: '#f1f1f1',
    borderWidth: 1,
    elevation: 2,
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
  },
});
