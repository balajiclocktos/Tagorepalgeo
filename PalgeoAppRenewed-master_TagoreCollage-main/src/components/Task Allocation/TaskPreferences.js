// branches are customized in getBranches api else part because of no data

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Text,
  Image,
} from 'react-native';

import SubHeader from '../common/DrawerHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import MultiSelect from 'react-native-multiple-select';
import Const from '../common/Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
import Loader from '../common/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator} from 'react-native';
import {Colors} from '../../utils/configs/Colors';
import CustomLoader from './CustomLoader';
import axios from 'axios';
import {SafeAreaView} from 'react-native';
import {ScrollView} from 'react-native';
import CustomSelect from '../common/CustomSelect';
import {CustomButton} from '../common/CustomButton';
import Stepper from '../common/Stepper';
export default class TaskPreferences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      SelectedInstitute: [],
      SelectedTaskType: [],
      SelectedBranch: [],
      SelectedStaffTypes: [],
      SelectedDepartment: [],
      SelectedDesignation: [],
      SelectedStaffMembers: [],
      Institutes: [],
      ShowBranches: false,
      ShowTaskType: false,
      TaskTypes: [
        {id: '1', name: 'Assigned Location'},
        {id: '2', name: 'Travel Checkin'},
      ],
      Branches: [
        {id: '1', name: 'Branch 1'},
        {id: '2', name: 'Branch 2'},
      ],
      StaffTypes: [],
      Departments: [],
      Designations: [],
      StaffMembers: [],
      showAlert: false,
      showAlert1: false,
      error_message: '',
    };
  }

  componentDidMount() {
    AsyncStorage.getItem('org_id').then(org_id => {
      AsyncStorage.getItem('bearer_token').then(bearer_token => {
        this.setState({org_id, bearer_token});
        this.getInstitues(org_id, bearer_token);
      });
    });
  }
  onSelectedInstitute = SelectedInstitute => {
    console.log('dd', SelectedInstitute);
    this.setState({SelectedInstitute, ShowTaskType: true}, () => {});
  };
  onSelectedTaskType = SelectedTaskType => {
    this.setState({SelectedTaskType, ShowBranches: true}, () => {
      this.getBranches(this.state.SelectedInstitute[0]);
      this.getStaffType(this.state.SelectedInstitute[0]);
      this.getDepartments(
        this.state.SelectedInstitute[0],
        this.state.bearer_token,
      );
    });
  };
  onSelectedBranch = SelectedBranch => {
    this.setState({SelectedBranch}, () => {
      //this.getStaffType(this.state.org_id);
    });
  };
  onSelectedStaffTypes = SelectedStaffTypes => {
    this.setState({SelectedStaffTypes}, () => {
      //this.getDepartments(this.state.org_id, this.state.bearer_token);
    });
  };
  onSelectedDepartment = SelectedDepartment => {
    this.setState({SelectedDepartment}, () => {
      this.getDesignations(this.state.SelectedInstitute[0]);
    });
  };
  onSelectedDesignation = SelectedDesignation => {
    this.setState({SelectedDesignation}, () => {
      this.getStaff(this.state.org_id);
    });
  };
  onSelectedStaffMembers = SelectedStaffMembers => {
    console.log('staffs', SelectedStaffMembers);
    this.setState({SelectedStaffMembers});
  };
  goToTaskAllocationStep2 = () => {
    if (this.state.SelectedInstitute.length) {
      if (this.state.SelectedTaskType.length) {
        // if (this.state.SelectedBranch.length) {
        if (this.state.SelectedStaffTypes.length) {
          if (this.state.SelectedDepartment.length) {
            if (this.state.SelectedDesignation.length) {
              if (this.state.SelectedStaffMembers.length) {
                this.props.navigation.navigate('TaskAssignedLocation', {
                  SelectedInstitute: this.state.SelectedInstitute,
                  SelectedTaskType: this.state.SelectedTaskType,
                  SelectedBranch: this.state.SelectedBranch,
                  SelectedStaffTypes: this.state.SelectedStaffTypes,
                  SelectedDepartment: this.state.SelectedDepartment,
                  SelectedDesignation: this.state.SelectedDesignation,
                  SelectedStaffMembers: this.state.SelectedStaffMembers,
                });
              } else {
                this.setState({
                  showAlert1: true,
                  error_message: 'Please Select Staff Member',
                  showAlert: false,
                });
              }
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
              error_message: 'Please select your Department',
              showAlert: false,
            });
          }
        } else {
          this.setState({
            showAlert1: true,
            error_message: 'Please select your Staff Types',
            showAlert: false,
          });
        }
        // } else {
        //   this.setState({
        //     showAlert1: true,
        //     error_message: 'Please select your Branch',
        //     showAlert: false,
        //   });
        // }
      } else {
        this.setState({
          showAlert1: true,
          error_message: 'Please select Task Type',
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
  getInstitues = (org_id, bearer_token) => {
    const url = `${Const}api/Master/GetInstitute/${org_id}`;
    console.log('org_id = ', org_id);
    console.log('url = ', Const + 'api/Master/GetInstitute/' + org_id);
    this.setState({loader: true});
    axios
      .get(url, {
        headers: {
          Authorization: 'Bearer ' + bearer_token,
        },
      })

      // fetch('https://insproplus.com/palgeoapi/api/Master/GetInstitute/' + 2, {
      //   method: 'GET',
      //   headers: {
      //     Accept: 'text/plain',
      //     'Content-Type': 'application/json-patch+json',
      //   },
      // })
      .then(response => {
        console.log(JSON.stringify(response));
        return response.data;
      })
      .then(json => {
        console.log('Institute = ', json);
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
          this.setState({
            Institutes: temparr,
          });
        } else {
          this.setState({Institutes: []});
        }
      })
      .catch(error => {
        console.log(error);
        this.setState({loader: false});
      });
  };
  getBranches = org_id => {
    console.log('org_id = ', org_id);
    this.setState({loader: true});
    console.log('Url = ', Const + 'api/Master/GetInstituteBranches/' + org_id);
    fetch(Const + 'api/Master/GetInstituteBranches/' + org_id, {
      //console.log('Url = ', Const + 'api/Master/GetInstituteBranches/' + org_id);
      //fetch(Const + 'api/Master/GetInstituteBranches/' + org_id, {
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
        console.log('Branches = ', json);
        if (json.length > 0) {
          let temparr = [];
          var currentArr = json;
          currentArr.map((item, index) => {
            var obj = {
              id: item.id.toString(),
              name: item.branchName,
            };
            temparr.push(obj);
          });
          this.setState({
            Branches: temparr,
          });
        } else {
          //this.setState({Branches: []});
          this.setState(
            {
              //Branches: temparr,
              Branches: [
                {id: '1', name: 'Branch 1'},
                {id: '2', name: 'Branch 2'},
              ],
            },
            () => {
              console.log('Customize Branches = ', this.state.Branches);
            },
          );
        }
      })
      .catch(error => {
        this.setState({loader: false});
      });
  };
  getStaffType = org_id => {
    console.log('org_id = ', org_id);
    this.setState({loader: true});
    console.log('Url = ', Const + 'api/Master/GetStaffType/' + org_id);
    fetch(Const + 'api/Master/GetStaffType/' + org_id, {
      //console.log('Url = ', Const + 'api/Master/GetInstituteBranches/' + org_id);
      //fetch(Const + 'api/Master/GetInstituteBranches/' + org_id, {
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
        console.log('StaffTypes = ', json);
        if (json.length > 0) {
          let temparr = [];
          var currentArr = json;
          currentArr.map((item, index) => {
            var obj = {
              id: item.id.toString(),
              name: item.type,
            };
            temparr.push(obj);
          });
          this.setState({
            StaffTypes: temparr,
          });
        } else {
          this.setState({StaffTypes: []});
        }
      })
      .catch(error => {
        this.setState({loader: false});
      });
  };
  getStaff = org_id => {
    console.log('org_id = ', org_id);
    this.setState({loader: true});
    console.log('Url = ', Const + 'api/Staff/staff/all/' + org_id + '/0/');
    fetch(
      `${Const}api/Staff/staff/all/${org_id}/${this.state.SelectedInstitute[0]}`,
      {
        method: 'GET',
        headers: {
          Accept: 'text/plain',
          'Content-Type': 'application/json-patch+json',
          Authorization: 'Bearer ' + this.state.bearer_token,
        },
      },
    )
      .then(response => response.json())
      .then(json => {
        this.setState({loader: false});
        console.log('StaffMembers = ', json);
        if (json.length > 0) {
          let temparr = [];
          var currentArr = json;
          currentArr.map((item, index) => {
            var obj = {
              id: item.staffCode,
              name: item.name,
            };
            temparr.push(obj);
          });
          this.setState({
            StaffMembers: temparr,
          });
        } else {
          this.setState({StaffMembers: []});
        }
      })
      .catch(error => {
        this.setState({loader: false});
      });
  };
  getDepartments = (institue, bearer_token) => {
    console.log('institue id = ', institue);
    console.log('url = ', Const + 'api/Master/GetDepartment/' + institue);
    this.setState({loader: true});
    fetch(Const + 'api/Master/GetDepartment/' + institue, {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
        Authorization: 'Bearer ' + bearer_token,
      },
    })
      .then(response => response.json())
      .then(json => {
        console.log('Department = ', json);
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
          this.setState({Departments: temparr});
        } else {
          this.setState({Departments: []});
        }
      })
      .catch(error => {
        this.setState({loader: false});
      });
  };
  getDesignations = institute => {
    console.log('institute id = ', institute);
    console.log('url = ', Const + 'api/Master/GetDesignation/' + institute);

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
        console.log('Designation = ', json);
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
          this.setState({Designations: temparr});
        } else {
          this.setState({Designations: []});
        }
      })
      .catch(error => {
        this.setState({loader: false});
      });
  };
  render() {
    const {
      SelectedInstitute,
      SelectedTaskType,
      SelectedBranch,
      SelectedStaffTypes,
      SelectedDepartment,
      SelectedDesignation,
      SelectedStaffMembers,
    } = this.state;
    return (
      <View style={{flex: 1}}>
        {this.state.loader && <CustomLoader />}
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
          title="Task Allocation Step"
          showBack={true}
          backScreen="Home"
          navigation={this.props.navigation}
        />
        <Stepper step1 />
        <ScrollView>
          <CustomSelect
            items={this.state.Institutes}
            uniqueKey="id"
            onSelectedItemsChange={this.onSelectedInstitute}
            selectedItems={SelectedInstitute}
            selectText="Select Institute"
            searchInputPlaceholderText="Select Institute"
            //  hideSubmitButton
            //  hideTags
            single
          />

          {this.state.Institutes.length && this.state.ShowTaskType ? (
            <CustomSelect
              items={this.state.TaskTypes}
              uniqueKey="id"
              single
              onSelectedItemsChange={this.onSelectedTaskType}
              selectedItems={SelectedTaskType}
              selectText="Select Task Type"
              searchInputPlaceholderText="Select Task Type"
              onChangeInput={text => console.log(text)}
            />
          ) : null}

          {this.state.TaskTypes.length && this.state.ShowBranches ? (
            <CustomSelect
              items={this.state.Branches}
              uniqueKey="id"
              onSelectedItemsChange={this.onSelectedBranch}
              selectedItems={SelectedBranch}
              selectText="Select Branch"
              searchInputPlaceholderText="Select Branch"
            />
          ) : null}
          {this.state.Branches.length ? (
            <CustomSelect
              items={this.state.StaffTypes}
              uniqueKey="id"
              onSelectedItemsChange={this.onSelectedStaffTypes}
              selectedItems={SelectedStaffTypes}
              selectText="Select Staff Types"
              searchInputPlaceholderText="Select Staff Types"
            />
          ) : null}
          {this.state.StaffTypes.length ? (
            <CustomSelect
              items={this.state.Departments}
              uniqueKey="id"
              onSelectedItemsChange={this.onSelectedDepartment}
              selectedItems={SelectedDepartment}
              selectText="Select Department"
              searchInputPlaceholderText="Select Department"
            />
          ) : null}
          {this.state.SelectedDepartment.length ? (
            <CustomSelect
              items={this.state.Designations}
              uniqueKey="id"
              onSelectedItemsChange={this.onSelectedDesignation}
              selectedItems={SelectedDesignation}
              selectText="Select Designation"
              searchInputPlaceholderText="Select Designation"
            />
          ) : null}
          {this.state.Designations.length ? (
            <CustomSelect
              items={this.state.StaffMembers}
              uniqueKey="id"
              onSelectedItemsChange={this.onSelectedStaffMembers}
              selectedItems={SelectedStaffMembers}
              selectText="Select Staff Member"
              searchInputPlaceholderText="Select Staff Member"
            />
          ) : null}
          <CustomButton
            radius={20}
            marginTop={10}
            marginBottom={10}
            padding={10}
            width={'30%'}
            color={Colors.mainHeader[0]}
            title={'Next'}
            onPress={this.goToTaskAllocationStep2}
          />
        </ScrollView>
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
