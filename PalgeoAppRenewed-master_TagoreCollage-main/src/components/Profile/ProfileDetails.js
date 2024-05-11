import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { VStack } from 'native-base';
import { Card } from 'react-native-elements';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AwesomeAlert from 'react-native-awesome-alerts';
import Const from '../common/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { Colors } from '../../utils/configs/Colors';
import CustomCard from '../common/CustomCard';
import Wave from '../../assets/wave.svg';
import Male from '../../assets/male.svg';
import Car from '../../assets/car.svg';
import Day from '../../assets/day.svg';
import Department from '../../assets/department.svg';
import Designation from '../../assets/designation.svg';
import LinearGradient from 'react-native-linear-gradient';
import { Define } from '../M-Dashboard/components/StaffMaster';
import CustomLabel from '../common/CustomLabel';
export default class StaffDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      showAlert: false,
      details: {},
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('user_id').then(user_id => {
      //console.log(user_id);
      AsyncStorage.getItem('institute_id').then(institute_id => {
        this.staffDetails(user_id, institute_id);
      });
    });
  }
  staffDetails = (user_id, institute_id) => {
    this.setState({ showAlert: false });
    fetch(Const + 'api/Staff/information/' + institute_id + '/' + user_id, {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
        'content-type': 'application/json-patch+json',
      },
    })
      .then(response => response.json())
      .then(json => {
        console.log('json_profile', json);
        if (json.status) {
          this.setState({ details: json.staffInformation, showAlert: false });
        } else {
          this.setState({ details: {}, showAlert: false });
        }
      })
      .catch(error => {
        this.setState({ showAlert: false });
      });
  };
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.header }}>
        <View style={styles.center}>
          {this.state.details?.college ? (
            <>
              <Card
                containerStyle={{
                  minHeight: 100,
                  width: '90%',
                  borderRadius: 6,
                  alignSelf: 'center',
                  backgroundColor: 'white',
                  elevation: 4,
                  shadowOpacity: 0.25,
                  shadowColor: 'black',
                  padding: 0,
                  borderWidth: 0,
                  marginVertical: 10,
                }}
                wrapperStyle={{
                  width: '100%',
                  borderRadius: 6,
                  alignSelf: 'center',
                  backgroundColor: 'white',
                }}>
                <View
                  style={{
                    backgroundColor: Colors.mainHeader[0],
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    paddingLeft: 8,
                  }}>
                  <View style={{ width: '100%' }}>
                    <View style={{}}>
                      <CustomLabel
                        title={`${this.state.details.name}`}
                        margin={0}
                        labelStyle={{
                          color: 'white',
                          textTransform: 'capitalize',
                        }}
                      />

                      <CustomLabel
                        labelStyle={{ color: 'white' }}
                        size={12}
                        fontFamily={'Roboto-Regular'}
                        title={`${this.state.details.department} | ${this.state.details.designation}`}
                        margin={0}
                      />
                    </View>
                  </View>
                </View>
                <View style={{ padding: 8 }}>
                  <Define
                    icon
                    name="institution"
                    color={'#696969'}
                    size={15}
                    type="font-awesome"
                    text
                    title={'Institute:'}
                    value={this.state.details.college}
                  />
                  <Define
                    icon
                    size={15}
                    name="v-card"
                    type="entypo"
                    text
                    title={'Staff Type:'}
                    value={this.state.details.type}
                  />
                  <Define
                    icon
                    size={15}
                    name="perm-identity"
                    type="materialIcons"
                    text
                    title={'Staff Code:'}
                    value={this.state.details.staffCode}
                  />
                </View>
              </Card>
              {/* <CustomCard>
                <View
                  style={{
                    width: '100%',
                    alignSelf: 'center',
                    borderRadius: 6,
                    //elevation: 1,
                    borderWidth: 1,
                    borderColor: Colors.overlay,

                    //shadowOffset: {x: 2, y: 2},
                    minHeight: 100,
                    //padding: 10,
                    marginVertical: 10,
                    backgroundColor: 'transparent',
                  }}>
                  <View style={{padding: 8}}>
                    <Define
                      icon
                      name="user"
                      type="feather"
                      size={15}
                      value={this.state.details.name}
                    />

                    <Define
                      icon
                      name="institution"
                      color={'#696969'}
                      size={15}
                      type="font-awesome"
                      text
                      title={'Institute:'}
                      value={this.state.details.college}
                    />
                    <Define
                      icon
                      size={15}
                      name="v-card"
                      type="entypo"
                      text
                      title={'Staff Type:'}
                      value={this.state.details.type}
                    />
                  </View>
                  <LinearGradient
                    colors={Colors.button}
                    start={{x: 0, y: 0.3}}
                    end={{x: 1, y: 1}}
                    style={{width: '100%'}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 6,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '60%',
                          alignItems: 'center',
                          borderRightWidth: 1,
                          borderRightColor: '#FFFFFF99',
                          marginRight: 15,
                        }}>
                        <Department />
                        <CustomLabel
                          title={this.state.details.department}
                          labelStyle={{color: Colors.white, marginLeft: 5}}
                          margin={0}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '40%',
                          alignItems: 'center',
                        }}>
                        <Designation />
                        <CustomLabel
                          title={this.state.details.designation}
                          labelStyle={{color: Colors.white, marginLeft: 5}}
                          margin={0}
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              </CustomCard> */}
            </>
          ) : (
            <ActivityIndicator
              size="large"
              style={{ alignSelf: 'center', justifyContent: 'center' }}
              color={Colors.mainHeader[0]}
            />
          )}
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
  walletContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 5,
    width: wp('90'),
  },
  header: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#67747d',
  },
  headerVal: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
    padding: '3%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    borderWidth: 1,
    borderColor: '#e2e2e2',
    margin: '2%',
  },
  divider1: {
    borderWidth: 1,
    borderColor: '#f3f3f3',
    margin: '2%',
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#ffffff',
  },
  upperBackground: {
    position: 'absolute',
    width: wp('100'),
    height: 100,
    backgroundColor: '#f05760',
    top: 37,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2%',
  },
});
