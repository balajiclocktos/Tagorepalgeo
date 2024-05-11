import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Text,
  Image,
} from 'react-native';
import {Icon, Container, Toast} from 'native-base';
import SubHeader from './common/SubHeader';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import MultiSelect from 'react-native-multiple-select';
import Const from './common/Constants';
import AwesomeAlert from 'react-native-awesome-alerts';
import Loader from './common/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import {SafeAreaView} from 'react-native';
import {Colors} from '../utils/configs/Colors';

export default class Circular extends Component {
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
      coordinates: {},
    };
  }
  componentDidMount() {
    AsyncStorage.getItem('org_id').then(org_id => {
      AsyncStorage.getItem('bearer_token').then(bearer_token => {
        AsyncStorage.getItem('institute_id').then(institute_id => {
          this.getInstitutes(org_id, bearer_token, institute_id);
        });
      });
    });
    this.getCurrentLocation();
  }

  getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => this.setState({coordinates: position.coords}),
      error => console.log(error),
      {enableHighAccuracy: true, maximumAge: 0, timeout: 10000},
    );
  };
  onSelectedItemsChange1 = selectedCollages => {
    this.setState({selectedCollages});
  };
  goToMapFencing = () => {
    this.getCurrentLocation();
    if (this.state.selectedCollages[0]) {
      setTimeout(
        () =>
          this.props.navigation.navigate('MapFencing', {
            institute_id: this.state.selectedCollages[0],
            data: {accessLocation: '', id: ''},
            coordinates: this.state.coordinates,
          }),
        1200,
      );
    } else {
      Toast.show({
        text: 'Please select your institute',
        duration: 3000,
        type: 'danger',
        textStyle: {
          fontFamily: 'Poppins-Regular',
          color: '#ffffff',
          textAlign: 'center',
          fontSize: 14,
        },
      });
    }
  };
  getInstitutes = (org_id, bearer_token, institute_id) => {
    this.setState({loader: true});
    console.log(Const + 'api/DataImport/institute/organisation/' + org_id);
    fetch(Const + 'api/DataImport/institute/organisation/' + org_id, {
      method: 'GET',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: 'Bearer ' + bearer_token,
        Accept: 'application/json, text/plain',
        'Content-Type': 'application/json-patch+json',
      },
    })
      .then(response => response.json())
      .then(json => {
        //console.log('institutes', json);
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
          const institute = temparr.filter(item => item.id === institute_id);
          console.log('coll', institute);
          //this.setState({collages: institute});
          this.setState({collages: temparr});
        } else {
          this.setState({collages: []});
        }
      })
      .catch(error => {
        this.setState({loader: false});
        console.error(error);
      });
  };
  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    const {selectedCollages} = this.state;
    return (
      <SafeAreaView style={{backgroundColor: Colors.header, flex: 1}}>
        <AwesomeAlert
          show={this.state.showAlert}
          showProgress={true}
          title="Loading"
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
        />
        <SubHeader
          title="Select Institute"
          showBack={true}
          backScreen="Home"
          navigation={this.props.navigation}
        />
        <View style={{backgroundColor: 'transparent'}}>
          <View style={{marginTop: '4%', marginLeft: '4%', marginRight: '4%'}}>
            <MultiSelect
              items={this.state.collages}
              uniqueKey="id"
              ref={component => {
                this.multiSelect = component;
              }}
              onSelectedItemsChange={this.onSelectedItemsChange1}
              selectedItems={selectedCollages}
              selectText="Search By Institute name . . ."
              searchInputPlaceholderText="Search By Institute name . . ."
              onChangeInput={text => console.log(text)}
              altFontFamily="Poppins-Regular"
              tagRemoveIconColor="#CCC"
              tagBorderColor="#CCC"
              tagTextColor="#000000"
              selectedItemTextColor="#CCC"
              selectedItemIconColor="#CCC"
              itemTextColor="#000"
              hideSubmitButton
              hideTags
              single
              itemFontSize={14}
              styleTextDropdown={{
                paddingLeft: wp('2'),
                fontFamily: 'Poppins:Regular',
              }}
              styleTextDropdownSelected={{paddingLeft: wp('2')}}
              styleRowList={{margin: '1%'}}
              single={true}
            />
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: hp('3'),
            }}>
            <TouchableWithoutFeedback onPress={this.goToMapFencing}>
              <View style={styles.buttonContainer}>
                <Image
                  source={require('../assets/ic_next.png')}
                  style={styles.btImage}
                />
                <Text style={styles.buttonText}>Next</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </SafeAreaView>
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
});
