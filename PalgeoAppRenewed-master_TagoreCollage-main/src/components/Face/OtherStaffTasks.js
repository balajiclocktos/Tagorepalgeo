import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import SubHeader from '../common/DrawerHeader';
import {Container, Icon, Footer, Card} from 'native-base';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Loader from '../common/Loader';
import Const from '../common/Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from 'react-native-check-box';
var moment = require('moment');
export default class OtherStaffTasks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      showAlert: false,
      StaffNo: '',
      data: [],
      bearer_token: '',
      showAlert1: false,
      error_message: '',
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('bearer_token').then(bearer_token => {
      AsyncStorage.getItem('other_checkedin_user_id').then(
        other_checkedin_user_id => {
          console.log(other_checkedin_user_id);
          AsyncStorage.getItem('institute_id').then(institute_id => {
            this.setState(
              {StaffNo: other_checkedin_user_id, bearer_token: bearer_token},
              () => {
                this.getTasks(other_checkedin_user_id, institute_id);
              },
            );
          });
        },
      );
    });
  }
  goToCheckout = () => {
    var success = false;
    for (var i = 0; i < this.state.data.length; i++) {
      if (this.state.data[i].isMust == 1) {
        if (this.state.data[i].isCompleted) {
          success = true;
        } else {
          success = false;
        }
      } else {
        success = true;
      }
    }
    if (success) {
      let temArr = [];
      this.state.data.map(item => {
        if (item.isCompleted) {
          var obj = {
            StaffCode: item.staff_code,
            TaskId: item.id,
          };
          temArr.push(obj);
        }
      });
      const bearer = this.state.bearer_token;
      fetch(Const + 'api/Staff/UpdateStaffTasksAttended', {
        method: 'POST',
        withCredentials: true,
        credentials: 'include',
        headers: {
          Authorization: bearer,
          Accept: 'text/plain',
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify(temArr),
      })
        .then(response => response.json())
        .then(json => {
          this.setState({loader: false});
          if (json) {
            this.props.navigation.navigate('OtherCheckOut');
          } else {
            this.setState({
              showAlert1: true,
              error_message: 'Tasks not saved.Please try later',
              showAlert: false,
            });
          }
        })
        .catch(error => {
          this.setState({
            showAlert1: true,
            error_message: 'Unknown error occured',
            showAlert: false,
          });
        });
    } else {
      this.setState({
        showAlert1: true,
        error_message:
          'Please select all the necessary tasks which are to be completed',
        showAlert: false,
      });
    }
  };
  getTasks = (user_id, institute_id) => {
    const bearer = this.state.bearer_token;
    fetch(Const + 'api/Staff/StaffTasks', {
      method: 'POST',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: bearer,
        Accept: 'text/plain',
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify({
        staffCode: user_id,
        instituteId: institute_id,
      }),
    })
      .then(response => response.json())
      .then(json => {
        this.setState({loader: false});
        if (json.length > 0) {
          this.setState({data: json});
        } else {
          this.setState({data: []});
        }
      })
      .catch(error => {
        this.setState({loader: false});
        console.error(error);
      });
  };
  handleCheckbox = (index, status) => {
    const newArray = [...this.state.data];
    newArray[index].isCompleted = !status;
    this.setState({data: newArray});
  };
  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    if (this.state.data.length == 0) {
      return (
        <View style={{flex: 1}}>
          <SubHeader
            title="Staff Tasks"
            showBack={true}
            backScreen="Tab"
            showBell={false}
            navigation={this.props.navigation}
          />
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Text style={styles.nodata}>No data found</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.container}>
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
          title="Staff Tasks"
          showBack={true}
          backScreen="Home"
          showBell={false}
          navigation={this.props.navigation}
        />
        <FlatList
          data={this.state.data}
          renderItem={({item, index}) => {
            var gmtDateTime = moment.utc(item.start_Time, 'YYYY-MM-DD HH');
            var startTime = gmtDateTime.local().format('h:mm A');
            return (
              <Card style={styles.walletContainer} key={item.id}>
                <View style={styles.row}>
                  <View style={{width: wp('63'), justifyContent: 'center'}}>
                    <Text style={styles.header}>Sno {index + 1}</Text>
                  </View>
                  <View style={{width: wp('20')}}>
                    <View style={{flexDirection: 'row'}}>
                      <Icon
                        name="clock-o"
                        type="FontAwesome"
                        style={{
                          color: '#000',
                          fontSize: 17,
                          marginTop: '0.5%',
                        }}
                      />
                      <Text style={styles.headerVal1}>{startTime}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={{width: wp('90')}}>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={styles.headerVal1}>- {item.task}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={styles.headerVal1}>
                        - {item.task_Description}
                      </Text>
                    </View>
                    {item.isMust == 1 ? (
                      <Text style={styles.note}>
                        ***This is a mandatory task
                      </Text>
                    ) : null}
                  </View>
                </View>
                {!this.props.route.params.disable ? (
                  <View>
                    <View style={styles.row}>
                      <CheckBox
                        isChecked={item.isCompleted}
                        onClick={() =>
                          this.handleCheckbox(index, item.isCompleted)
                        }
                        checkedCheckBoxColor="#f05760"
                      />
                      <View style={{width: wp('35'), justifyContent: 'center'}}>
                        <Text style={styles.header}>Status</Text>
                      </View>
                    </View>
                  </View>
                ) : null}
              </Card>
            );
          }}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            backgroundColor: '#ffffff',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '2%',
            paddingTop: '3%',
          }}
        />
        {!this.props.route.params.disable ? (
          <TouchableWithoutFeedback onPress={this.goToCheckout}>
            <Footer
              style={{
                backgroundColor: '#f05760',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={styles.footerText}>Next</Text>
            </Footer>
          </TouchableWithoutFeedback>
        ) : null}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#c9c3c5',
  },
  nodata: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'red',
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
    backgroundColor: '#f1f1f1',
    paddingLeft: '5%',
    borderRadius: 10,
    height: hp('7'),
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    height: hp('7'),
  },
  dateContainer: {
    borderWidth: 1,
    borderColor: '#f1f1f1',
    height: hp('6.7'),
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8%',
    backgroundColor: '#4dbd74',
    height: hp('6.2'),
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#ffffff',
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
  },
  header: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#67747d',
    margin: '1%',
  },
  headerVal: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#000000',
    margin: '1%',
  },
  headerVal1: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
  },
  divider: {
    borderWidth: 1,
    borderColor: '#e2e2e2',
    margin: '2%',
  },
  divider2: {
    borderWidth: 1,
    borderColor: '#e2e2e2',
    margin: '1%',
  },
  divider1: {
    borderWidth: 1,
    borderColor: '#f3f3f3',
    margin: '2%',
  },
  statusContainer: {
    backgroundColor: '#f86c6b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5%',
    height: hp('4.5'),
    borderRadius: 5,
    width: wp('23'),
  },
  statusContainer1: {
    backgroundColor: '#63c2de',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5%',
    height: hp('4.5'),
    borderRadius: 5,
    width: wp('23'),
  },
  actionContainer: {
    backgroundColor: '#63c2de',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5%',
    height: hp('4.5'),
    borderRadius: 5,
    width: wp('25'),
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#ffffff',
  },
  note: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: 'red',
  },
});
