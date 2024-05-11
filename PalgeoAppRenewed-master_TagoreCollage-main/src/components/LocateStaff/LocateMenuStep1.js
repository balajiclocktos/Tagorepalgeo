import React, {Component} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {VStack} from 'native-base';
import SubHeader from '../common/DrawerHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Const from '../common/Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
import Loader from '../common/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Colors} from '../../utils/configs/Colors';
import CustomSelect from '../common/CustomSelect';
import Stepper from '../common/Stepper';
import LocateStaff from '../../assets/locateStaff.svg';
import {CustomButton} from '../common/CustomButton';
export default class LocateMenuStep1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCollages: [],
      selectedBranches: [],
      selectedDesignations: [],
      collages: [],
      departments: [],
      designations: [],
      showAlert: false,
      showAlert1: false,
      error_message: '',
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('org_id').then(org_id => {
      AsyncStorage.getItem('bearer_token').then(bearer_token => {
        this.setState({org_id, bearer_token});
        this.getColleges(org_id, bearer_token);
      });
    });
  }
  onSelectedItemsChange1 = selectedCollages => {
    this.setState({selectedCollages}, () => {
      this.getDepartments(selectedCollages[0]);
    });
    this.getDesignations(selectedCollages[0]);
  };
  onSelectedItemsChange2 = selectedBranches => {
    this.setState({selectedBranches});
  };
  onSelectedItemsChange3 = selectedDesignations => {
    this.setState({selectedDesignations});
  };
  goToCircularStep2 = () => {
    if (this.state.selectedCollages[0]) {
      if (this.state.selectedBranches[0]) {
        if (this.state.selectedDesignations[0]) {
          this.props.navigation.navigate('LocateMenuStep2', {
            collage: this.state.selectedCollages,
            department: this.state.selectedBranches,
            designation: this.state.selectedDesignations,
          });
        } else {
          this.setState({
            showAlert1: true,
            error_message: 'Please select your designation',
            showAlert: false,
          });
        }
      } else {
        this.setState({
          showAlert1: true,
          error_message: 'Please select your department',
          showAlert: false,
        });
      }
    } else {
      this.setState({
        showAlert1: true,
        error_message: 'Please select your institute',
        showAlert: false,
      });
    }
  };
  getColleges = (org_id, bearer_token) => {
    this.setState({loader: true});
    fetch(Const + 'api/Master/GetInstitute/' + org_id, {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
        Authorization: 'Bearer ' + bearer_token,
      },
    })
      .then(response => response.json())
      .then(json => {
        //console.log('colleges', json);
        this.setState({loader: false});
        if (json.length > 0) {
          let temparr = [];
          var currentArr = json;
          currentArr.map((item, index) => {
            var obj = {
              id: item.id.toString(),
              name: item.name,
            };
            temparr.push(obj);
          });
          this.setState({collages: temparr});
        } else {
          this.setState({collages: []});
        }
      })
      .catch(error => {
        this.setState({loader: false});
      });
  };
  getDepartments = institue => {
    this.setState({loader: true});

    fetch(Const + 'api/Master/GetDepartment/' + institue, {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
        Authorization: 'Bearer ' + this.state.bearer_token,
      },
    })
      .then(response => response.json())
      .then(json => {
        //console.log('departments', json);
        this.setState({loader: false});
        if (json.length > 0) {
          let temparr = [];
          var currentArr = json;
          currentArr.map((item, index) => {
            var obj = {
              id: item.id.toString(),
              name: item.department,
            };
            temparr.push(obj);
          });
          const uniques = Object.values(
            temparr.reduce((a, c) => {
              a[c.name] = c;
              return a;
            }, {}),
          );
          this.setState({departments: uniques});
        } else {
          this.setState({departments: []});
        }
      })
      .catch(error => {
        this.setState({loader: false});
      });
  };
  getDesignations = institute => {
    this.setState({loader: true});
    fetch(Const + 'api/Master/GetDesignation/' + institute, {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
        Authorization: 'Bearer ' + this.state.bearer_token,
      },
    })
      .then(response => response.json())
      .then(json => {
        this.setState({loader: false});
        if (json.length > 0) {
          let temparr = [];
          var currentArr = json;
          currentArr.map((item, index) => {
            var obj = {
              id: item.id.toString(),
              name: item.designation,
            };
            temparr.push(obj);
          });
          const uniques = Object.values(
            temparr.reduce((a, c) => {
              a[c.name] = c;
              return a;
            }, {}),
          );
          this.setState({designations: uniques});
        } else {
          this.setState({designations: []});
        }
      })
      .catch(error => {
        this.setState({loader: false});
      });
  };
  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    const {selectedCollages, selectedBranches, selectedDesignations} =
      this.state;
    return (
      <View style={{flex: 1, backgroundColor: Colors.header}}>
        <AwesomeAlert
          show={this.state.showAlert}
          showProgress={true}
          title="Loading"
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
        />
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
          cancelButtonTextStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
          messageStyle={{fontFamily: 'Poppins-Regular', fontSize: 13}}
          titleStyle={{fontFamily: 'Poppins-SemiBold', fontSize: 14}}
        />
        <SubHeader
          title="Locate Staff"
          showBack={true}
          backScreen="Home"
          navigation={this.props.navigation}
        />
        <ScrollView nestedScrollEnabled>
          <VStack>
            <Stepper step1 />
            <CustomSelect
              items={this.state.collages}
              onSelectedItemsChange={this.onSelectedItemsChange1}
              selectedItems={selectedCollages}
              selectText="Search By Institute . . ."
              searchInputPlaceholderText="Search By Institute . . ."
              //onChangeInput={text => console.log(text)}
              // altFontFamily="Poppins-Regular"
              // tagRemoveIconColor="#CCC"
              // tagBorderColor="#CCC"
              // tagTextColor="#000000"
              // selectedItemTextColor="#CCC"
              // selectedItemIconColor="#CCC"
              // itemTextColor="#000"
              //hideSubmitButton
              //hideTags
              single
              // itemFontSize={14}
              // styleDropdownMenu={{
              //   elevation: 5,
              //   shadowColor: 'black',
              //   marginTop: 10,
              // }}
              // styleTextDropdown={{
              //   paddingLeft: wp('2'),
              //   fontFamily: 'Poppins-Regular',
              // }}
              // styleTextDropdownSelected={{paddingLeft: wp('2')}}
              // styleRowList={{margin: '1%'}}
            />

            <CustomSelect
              items={this.state.departments}
              onSelectedItemsChange={this.onSelectedItemsChange2}
              selectedItems={selectedBranches}
              selector
              selectText="Search By Department . . ."
              searchInputPlaceholderText="Search By Department . . ."
            />

            <CustomSelect
              items={this.state.designations}
              onSelectedItemsChange={this.onSelectedItemsChange3}
              selectedItems={selectedDesignations}
              selectText="Search By Designation . . ."
              searchInputPlaceholderText="Search By Designation . . ."
            />

            <CustomButton
              onPress={this.goToCircularStep2}
              color={Colors.button[0]}
              title={'Next'}
              marginTop={20}
              width={'50%'}
              radius={120}
              textStyle={{fontSize: 20}}
            />
          </VStack>
        </ScrollView>
        <View
          style={{
            width: '70%',
            justifyContent: 'flex-end',
            alignSelf: 'center',
          }}>
          <LocateStaff width={'100%'} />
        </View>
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
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f05760',
    borderRadius: 20,
    width: wp('35'),
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
});
