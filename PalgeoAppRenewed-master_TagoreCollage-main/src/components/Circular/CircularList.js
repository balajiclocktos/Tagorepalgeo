import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableWithoutFeedback,
  Image,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Box, Text } from 'native-base';
import SubHeader from '../common/DrawerHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../common/Loader';
import AwesomeAlert from 'react-native-awesome-alerts';
import Const from '../common/Constants';
import NoData from '../common/NoData';
import RNFetchBlob from 'rn-fetch-blob';
import { Colors } from '../../utils/configs/Colors';
import { Card } from 'react-native-elements';
import { SafeAreaView } from 'react-native';
import SuccessError from '../common/SuccessError';
import AnimatedLoader from '../common/AnimatedLoader';
var moment = require('moment');
export default class CircularList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      user_id: '',
      bearer_token: '',
      institute_id: '',
      showAlert1: false,
      error_message: '',
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('bearer_token').then(bearer_token => {
      this.setState({ bearer_token: bearer_token });
    });
    AsyncStorage.getItem('user_id').then(user_id => {
      AsyncStorage.getItem('institute_id').then(institute_id => {
        this.setState({ user_id: user_id }, () => {
          this.getCircularList(user_id, institute_id);
        });
      });
    });
  }
  checkPermission = file => {
    this.props.navigation.navigate('ImageViewer', {
      url: file,
    });
  };
  getCircularList = (user_id, institute_id) => {
    this.setState({ showAlert: true });
    console.log("**********************************")
    console.log(Const + 'api/Staff/StaffNotifications')
    console.log(JSON.stringify({
      staffCode: user_id,
      instituteId: institute_id,
    }))
    console.log('Bearer ' + this.state.bearer_token);
    console.log("**********************************")
    fetch(Const + 'api/Staff/StaffNotifications', {
      method: 'POST',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: 'Bearer ' + this.state.bearer_token,
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
        if (json.length > 0) {
          console.log('json aa==>', json);
          this.setState({ data: json, showAlert: false });
        } else {
          this.setState({ data: [], showAlert: false });
        }
      })
      .catch(error => {
        this.setState({
          showAlert: false,
          showAlert1: true,
          error: true,
          error_message: error.message,
        });
      });
  };
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.header }}>
        <AnimatedLoader doNotShowDeleteIcon isVisible={this.state.showAlert} />
        <SuccessError
          isVisible={this.state.showAlert1}
          error={this.state.error}
          deleteIconPress={() => this.setState({ showAlert1: false })}
          subTitle={this.state.error_message}
        />
        <SubHeader
          title="Notifications"
          showBack={true}
          backScreen="Home"
          navigation={this.props.navigation}
        />
        <FlatList
          data={this.state.data}
          renderItem={({ item, index }) => {
            var gmtDateTime = moment.utc(item.sentOn);
            var local = gmtDateTime.local().format('DD-MMM-YYYY h:mm A');
            return (
              <Card
                // padding={5}
                // rounded
                // border="1"
                // borderRadius="md"
                wrapperStyle={{
                  backgroundColor: Colors.secondary,
                  opacity: index % 2 == 0 ? 1 : 0.8,
                  borderBottomLeftRadius: 65,
                  borderTopRightRadius: 65,
                  borderBottomRightRadius: 65,
                }}
                containerStyle={styles.card}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    padding: '3%',
                  }}>
                  <View
                    style={{
                      justifyContent: 'center',
                      width: wp('20'),
                      // marginLeft: 20,
                    }}>
                    {item.notificationImage ? (
                      <Image
                        source={{ uri: item.notificationImage }}
                        style={{ width: 65, height: 65 }}
                        resizeMode="contain"
                      />
                    ) : item.notificationType == 7 ? (
                      <Image
                        source={require('../../assets/loc.jpg')}
                        style={{ width: 65, height: 65 }}
                        resizeMode="contain"
                      />
                    ) : item.notificationType == 6 ? (
                      <Image
                        source={require('../../assets/taskall.jpg')}
                        style={{ width: 65, height: 65 }}
                        resizeMode="contain"
                      />
                    ) : item.notificationType == 5 ? (
                      <Image
                        source={require('../../assets/cir.jpg')}
                        style={{ width: 65, height: 65 }}
                        resizeMode="contain"
                      />
                    ) : item.notificationType == 4 ? (
                      <Image
                        source={require('../../assets/late.jpg')}
                        style={{ width: 65, height: 65 }}
                        resizeMode="contain"
                      />
                    ) : item.notificationType == 3 ? (
                      <Image
                        source={require('../../assets/late.jpg')}
                        style={{ width: 65, height: 65 }}
                        resizeMode="contain"
                      />
                    ) : item.notificationType == 2 ? (
                      <Image
                        source={require('../../assets/early.jpg')}
                        style={{ width: 65, height: 65 }}
                        resizeMode="contain"
                      />
                    ) : item.notificationType == 1 ? (
                      <Image
                        source={require('../../assets/early.jpg')}
                        style={{ width: 65, height: 65 }}
                        resizeMode="contain"
                      />
                    ) : null}
                  </View>
                  <View style={{ width: wp('65'), marginLeft: '2%' }}>
                    <Text
                      style={[
                        styles.subject,
                        {
                          color: index % 2 == 0 ? Colors.button[0] : 'green',
                          fontFamily: 'Poppins-Bold',
                        },
                      ]}>
                      {item.subject}
                    </Text>
                    <Text style={styles.text}>{item.message}</Text>
                    <Text style={styles.date}>{local}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  {item.circularAttachment && (
                    <TouchableWithoutFeedback
                      onPress={() => {
                        this.checkPermission(item.circularAttachment);
                      }}>
                      <Text style={styles.attachText}>Attachment</Text>
                    </TouchableWithoutFeedback>
                  )}
                  {/* {item.notificationImage && (
                    <TouchableWithoutFeedback
                      onPress={() => {
                        this.checkPermission(item.notificationImage);
                      }}>
                      <Text style={styles.attachText1}>Notification Image</Text>
                    </TouchableWithoutFeedback>
                  )} */}
                </View>
              </Card>
            );
          }}
          keyExtractor={(item, index) => index}
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
          ListEmptyComponent={
            <View style={{ marginTop: hp('40') }}>
              <NoData title="No Notifications Found" />
            </View>
          }
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    margin: '0.5%',
  },
  subject: {
    //fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    margin: '0.5%',
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    margin: '0.5%',
    color: '#777777',
  },
  walletContainer: {
    margin: '3%',
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
  },
  header: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#67747d',
  },
  headerVal: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
    paddingLeft: '4%',
    paddingTop: '1%',
    paddingBottom: '1%',
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
  card: {
    width: wp('95'),
    elevation: 2,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    borderBottomLeftRadius: 65,
    borderTopRightRadius: 65,
    borderBottomRightRadius: 65,
    padding: 0,
  },
  attachText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    width: wp('30'),
    color: '#f05760',
    textDecorationLine: 'underline',
  },
  attachText1: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#f05760',
    textDecorationLine: 'underline',
  },
});
