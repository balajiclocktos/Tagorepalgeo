import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  Image,
} from 'react-native';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {GOOGLE_MAPS_APIKEY} from '../../utils/configs/Constants';
import MapViewDirections from 'react-native-maps-directions';
import SubHeader from '../common/DrawerHeader';
//import {CustomCalendar} from '../common/CustomCalendar';
import Loader from '../common/Loader';
import Const from '../../components/common/Constants';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import moment from 'moment';
import DatePicker from 'react-native-datepicker';
import RNFetchBlob from 'rn-fetch-blob';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import Timeline from 'react-native-timeline-flatlist';
import {Avatar, Icon, Overlay} from 'react-native-elements';
import {Colors} from '../../utils/configs/Colors';
//import CustomPicker from '../common/CustomPicker';
import AwesomeAlert from 'react-native-awesome-alerts';
import FileViewer from 'react-native-file-viewer';
//import DateTimePicker from 'react-native-modal-datetime-picker';
import CustomLabel from '../common/CustomLabel';
import {Modalize} from 'react-native-modalize';
import {Dimensions} from 'react-native';
import {Box, Select, Toast} from 'native-base';
import LinearGradient from 'react-native-linear-gradient';

const LAT_DELTA = 0.01;
const LONG_DELTA = 0.01;
const COORDINATES = {
  latitude: 19.0339284,
  longitude: 72.9502294,
};

const MINUTE = 60000;

const FIFTEEN_MIN = 15 * 60000;
const {width, height} = Dimensions.get('window');
const geolib = require('geolib');

export class StaffLocation extends Component {
  state = {
    origin: null,
    destination: null,
    inbetweenLocations: [],
    inn: [],
    locations: [],
    trips: 0,
    travelInfo: [],
    tripNoChosen: 0,
    //loader: true,
    date: this.props.route?.params?.date || new Date(),
    data: [],
    showAlert: false,
    message: '',
    reverseData: [],
    distance: '0',
    visible: false,
    driving_type: 'DRIVING',
    photo: this.props.route?.params?.StaffPhoto || '',
    name: this.props.route?.params?.StaffName || '',

    tripsArray: [],
    pickerTrips: [],
    currentTrip: [],
    currentIndex: 0,
    currentTripPicker: 'Trip 1',
  };

  async componentDidMount() {
    //API call
    console.log('PROPS_DATE', this.props.route?.params?.date);
    const driving_type = await AsyncStorage.getItem('driving_type');
    console.log('dd', driving_type);
    this.setState({driving_type: driving_type.toUpperCase()});
    // this.inteval = setInterval(() => {
    //   if (new Date(this.state.date).getDate() === new Date().getDate()) {
    //     this.fetchResults();
    //   }
    // }, FIFTEEN_MIN);

    // if (new Date(this.state.date).getDate() === new Date().getDate()) {
    //   this.fetchResults();
    // } else {
    this.retreiveDataNew();
    // }
    //console.log('photo', this.state.photo);

    //this.setState({locations: ['locations from json'], latitude: locations[0]})
  }

  retreiveDataNew = async () => {
    try {
      const institute_id = await AsyncStorage.getItem('institute_id');
      const bearer_token = await AsyncStorage.getItem('bearer_token');
      this.getStaffReportNew(institute_id, bearer_token);
    } catch (e) {
      alert('Error retreiving data. Please try again.');
    }
  };

  getActivities = json => {
    const report = json.staffReport;
    const dateWiseReport = report.filter(e => e.dateWiseActivities);
    const find = dateWiseReport.find((e, i) => i === 0);
    const dateWise = find.dateWiseActivities;
    const currentDateReport = dateWise.find(
      e =>
        moment(e.captureDate).format('YYYY-MM-DD') ===
        moment(this.state.date).format('YYYY-MM-DD'),
    );
    // const distanceInKm = eval(currentDateReport.distance / 1000);
    // this.setState({distance: distanceInKm});
    const activities = currentDateReport?.activities;
    return activities;
  };

  getAllIndexes = (arr, val) => {
    var indexes = [],
      i;
    for (i = 0; i < arr.length; i++)
      if (arr[i].travelCheckInType === val) indexes.push(i);
    return indexes;
  };

  groupByKey = (array, key) => {
    const arr = [];
    arr.reduce();
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) return hash;
      return Object.assign(hash, {
        [obj[key]]: (hash[obj[key]] || []).concat(obj),
      });
    }, {});
  };

  getStaffReportNew = async (institute_id, bearer_token) => {
    const from_date = moment(this.state.date).format('YYYY-MM-DD');
    const to_date = from_date;
    this.setState({showAlert: true});
    const url = `${Const}api/Staff/StaffCummulativeTravelCheckInActivities`;
    const body = {
      FromDate: from_date,
      ToDate: to_date,
      InstituteId: Number(institute_id),
      StaffCodes: [this.props.route.params.StaffCode],
      IsTravelReport: true,
      IsMobileApp: true,
    };
    const headers = {
      headers: {
        Authorization: 'Bearer ' + bearer_token,
      },
    };
    //console.log('BDOY', body);
    try {
      const response = await axios.post(url, body, headers);
      const json = response.data;
      //console.log('json', JSON.stringify(json.staffReport, null, 2));
      if (json?.staffReport?.length > 0) {
        const activities = this.getActivities(json);
        console.log(
          'activities',
          activities.find(e => e.travelCheckInType === 1),
        );
        if (!activities) {
          this.setState({
            origin: null,
            destination: null,
            reverseData: [],
            data: [],
            showAlert: false,
          });
          return alert('No history available for this date');
        }
        if (activities.length > 0) {
          const removeNullTrips = activities.filter(
            e => e.tripIdentifier !== null,
          );
          // separate trips based on trip identifier:
          //const tripsArr = this.groupByKey(removeNullTrips, 'tripIdentifier');
          // const pkerTrips = tripsArr.map((e, i) => `Trip ${i + 1}`);
          //console.log('tripsGrouping ==', tripsArr.length);
          // end of logic
          // this.setState({
          //   tripsArray,
          //   pickerTrips,
          //   currentTrip: tripsArray[this.state.currentIndex],
          // });

          const tripsIndexes = this.getAllIndexes(activities, 4);
          console.log('tripsIndexes', tripsIndexes);
          let tripsArray = [];
          let j = 0;
          if (tripsIndexes.length === 0) {
            if (activities.find(e => e.travelCheckInType === 1)) {
              tripsArray.push(activities);
              this.setState(
                {
                  tripsArray,
                  pickerTrips: tripsArray.map((e, i) => `Trip ${i + 1}`),
                  currentTrip: tripsArray[this.state.currentIndex],
                },
                () => {
                  this.doRemainingWork(tripsArray);
                },
              );
            }
          } else {
            //console.log('j', j);
            for (let i = 0; i < tripsIndexes.length; i++) {
              let u = tripsIndexes[i] + 1;
              const trip = activities.slice(j, u);
              tripsArray.push(trip);
              j = tripsIndexes[i] + 1;
            }
            const pickerTrips = tripsArray.map((e, i) => `Trip ${i + 1}`);
            //console.log('tripsArray', tripsArray);
            this.setState(
              {
                tripsArray,
                pickerTrips,
                currentTrip: tripsArray[this.state.currentIndex],
              },
              () => this.doRemainingWork(tripsArray),
            );
          }

          //console.log('reverse', reverse);
          //this.setState({reverseData: reverse || []});
        }
        this.setState({showAlert: false});
      } else {
        Toast.show({
          render: () => {
            return (
              <Box bg="emerald.500" px="2" py="1" rounded="sm" mb={5}>
                'No trips found'
              </Box>
            );
          },
        });
        this.setState({reverseData: [], showAlert: false});
      }
    } catch (error) {
      this.setState({showAlert: false});
      console.log('error', error);
    }
  };

  doRemainingWork = tripsArray => {
    const locations = tripsArray[this.state.currentIndex].filter(
      each => each.coordinates,
    );
    console.log('locations[Trip]', locations, this.state.currentIndex);
    if (locations?.length > 0) {
      const origin = locations[0];
      const destination = locations[locations.length - 1];
      const slicedArray = locations.slice(1, -1);
      const inn = slicedArray.map(e => e.coordinates);
      const distance = geolib.getPathLength([
        origin.coordinates,
        ...inn,
        destination.coordinates,
      ]);
      this.setState({
        locations,
        origin,
        destination,
        inn,
        //distance: locations[locations.length - 2].routeDistance / 1000,
        distance: distance / 1000,
      });
    }
    const reverse = tripsArray[this.state.currentIndex];
    this.setState({travelInfo: reverse}, this.setTimeLineData);
  };

  componentWillUnmount() {
    clearInterval(this.inteval);
  }

  setTimeLineData = () => {
    const {travelInfo} = this.state;
    const renderData =
      travelInfo.length > 0 &&
      travelInfo
        .filter(e => e.activity !== null && e.geoLocatioName !== null)
        .map((e, ind, locationss) => {
          return {
            time: moment(e.capturedTime).format('HH:mm:ss'),
            title: e.activity
              ? e.activity
              : ind === 0
              ? 'Starting point'
              : ind === locationss.length - 1
              ? 'Latest/Last point'
              : `Location`,
            description: e.geoLocatioName || e.activity,
            coordinates: e.coordinates,
            activity: e.activity,
            subject: e.subject,
            fileUrls: e.fileUrls,
            travelType: e.travelCheckInType,
            titleStyle: {
              color:
                ind % 2 === 0
                  ? '#5A189A'
                  : ind % 3 === 0
                  ? '#FAA307'
                  : '#4361EE',
            },
            lineColor:
              ind % 2 === 0 ? '#5A189A' : ind % 3 === 0 ? '#FAA307' : '#4361EE',
          };
        });
    // renderData.forEach((each, i) => {
    //   if (each.travelType === 4) {
    //     renderData.splice(i + 1, 1);
    //   }
    // });
    //renderData.pop();
    this.setState({data: renderData, reverseData: renderData.reverse()});
  };

  fetchResults = async () => {
    const check = this.state.date.getDate() === new Date().getDate();

    const institute_id = await AsyncStorage.getItem('institute_id');
    const bearer_token = await AsyncStorage.getItem('bearer_token');

    if (!check) {
      console.log('I ran');
      this.retreiveDataNew();
      return;
      //this.setState({loader: true});
    }
    //setTimeout(() => this.setState({loader: false}), 1200);
    const body = {
      FromDate: moment(this.state.date).format('YYYY-MM-DD'),
      ToDate: moment(this.state.date).format('YYYY-MM-DD'),
      InstituteId: Number(institute_id),
      //InstituteId: 1,
      StaffCodes: [this.props.route.params.StaffCode],
      //StaffCodes: ['ct101'],
      IsTravelReport: true,
      IsMobileApp: true,
    };
    try {
      //const response = await axios.post(Const + 'api/Staff/TravelInfo', body);
      const response = await axios.post(
        Const + 'api/Staff/StaffCummulativeTravelCheckInActivities',
        body,
        {
          headers: {
            Authorization: 'Bearer ' + bearer_token,
          },
        },
      );
      const json = response.data.staffReport;
      //console.log('json', JSON.stringify(json[0].dateWiseActivities, null, 4));
      // return;
      if (json.length === 0) {
        this.setState({
          origin: null,
          destination: null,
          reverseData: [],
          data: [],
        });
        return alert('No history available for this day');
      }
      const coordinatesArray = json[0].dateWiseActivities[0].activities.filter(
        each => each.coordinates,
      );

      const origin = coordinatesArray[0];
      const destination = coordinatesArray[coordinatesArray.length - 1];

      //coordinatesArray = [...newCcc];
      //console.log('origin', origin);
      //console.log('destination', destination);
      // console.log('coordinatesArray', coordinatesArray);
      const slicedArray = coordinatesArray.slice(1, -1);
      const inn = slicedArray.map(e => e.coordinates);
      console.log('inn', inn);

      this.setState(
        {
          travelInfo: json[0].dateWiseActivities[0].activities,
          inn,
          origin,
          destination,
          locations: coordinatesArray,
        },
        this.setTimeLineData,
      );

      //******************* OLD_API_LOGIC ******************/
      //const lengthTrips = json[0].travelInfo.length;
      //this.setState({trips: lengthTrips, travelInfo: json[0].travelInfo});
      //console.log('tripsCount', lengthTrips);
      //const {length} = json[0].travelInfo[0].activities;
      //let data = [];
      // const between = json[0].travelInfo[0].activities.filter(
      //   (e, i) => i !== 0 && i !== length - 1,
      // );
      // between.forEach((e, i) => {
      //   data.push(e);
      // });

      // for (let i = 0; i < lengthTrips; i++) {
      //   const {inbetweenLocations} = this.state;
      //   const between = json[0].travelInfo[i].activities.filter(
      //     (e, i) => i !== 0 && i !== length - 1,
      //   );
      //   // between.forEach((e, i) => {
      //   //   data.push(e);
      //   // });
      //   this.setState(
      //     {
      //       origin: [...this.state.origin, json[0].travelInfo[i].activities[0]],
      //       destination: [
      //         ...this.state.destination,
      //         json[0].travelInfo[i].activities[length - 1],
      //       ],
      //       inbetweenLocations: [...inbetweenLocations, between],
      //     },
      //     () => {
      //       const {origin, destination, inbetweenLocations, locations, data} =
      //         this.state;
      //       let newInbetween = [...inbetweenLocations];
      //       console.log(
      //         'origin, dest, inbet ==>',

      //         newInbetween,
      //       );

      //       inbetweenLocations[i].forEach((each, ind) => {
      //         const distance = geolib.getDistance(
      //           origin[i].coordinates,
      //           each.coordinates,
      //         );

      //         if (distance <= 50) {
      //           let index = newInbetween[i].indexOf(each);
      //           newInbetween[i].splice(index, 1);
      //         }
      //       });

      //       this.setState({inbetweenLocations: [...newInbetween]});
      //       let locationss = [
      //         {...origin[i]},
      //         ...newInbetween[i],
      //         {...destination[i]},
      //       ];
      //       console.log('loc ===>?', locationss);
      //       let renderData = locationss.map((e, ind) => {
      // return {
      //   time: moment.utc(e.createdTime).local().format('HH:mm'),
      //   title:
      //     ind === 0
      //       ? 'Starting point'
      //       : ind === locationss.length - 1
      //       ? 'Latest/Last point'
      //       : e.isPaused
      //       ? `Location ${ind}(Paused)`
      //       : e.isResumed
      //       ? `Location ${ind}(Resumed)`
      //       : `Location ${ind}`,
      //   description: e.address,
      //   coordinates: e.coordinates,
      //   isPaused: e.isPaused,
      //   isResumed: e.isResumed,
      // };
      //       });
      //       this.setState(
      //         {
      //           locations: [...locations, locationss],
      //           data: [...data, renderData],
      //         },
      //         () => {
      //           const inn = locationss.map((each) => each.coordinates);
      //           //console.log('inn', inn.length);
      //           this.setState({inn: [...this.state.inn, inn]});
      //         },
      //       );
      //     },
      //   );
      // }
      // this.setState(
      //   {
      //     origin: json[0].travelInfo[0].activities[0],
      //     destination: json[0].travelInfo[0].activities[length - 1],
      //     //inbetweenLocations: data,
      //   },
      //   () => {
      //     const {origin, destination, inbetweenLocations} = this.state;

      //     let newInbetween = [...inbetweenLocations];

      //     inbetweenLocations.forEach((each, i) => {
      //       const distance = geolib.getDistance(
      //         origin.coordinates,
      //         each.coordinates,
      //       );

      //       if (distance <= 50) {
      //         let index = newInbetween.indexOf(each);
      //         newInbetween.splice(index, 1);
      //       }
      //     });

      //     this.setState({inbetweenLocations: [...newInbetween]});
      //     let locations = [{...origin}, ...newInbetween, {...destination}];
      //     let renderData = locations.map((e, i) => {
      //       return {
      //         time: moment.utc(e.createdTime).local().format('HH:mm'),
      //         title:
      //           i === 0
      //             ? 'Starting point'
      //             : i === locations.length - 1
      //             ? 'Latest/Last point'
      //             : e.isPaused
      //             ? `Location ${i}(Paused)`
      //             : e.isResumed
      //             ? `Location ${i}(Resumed)`
      //             : `Location ${i}`,
      //         description: e.address,
      //       };
      //     });
      //     this.setState({locations, data: renderData});
      //   },
      // );
    } catch (e) {
      alert(e.message);
      console.log('e', e);
    }
  };

  getFileExtention = fileUrl => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined;
  };

  checkPermission = async fileUrl => {
    // Function to check the platform
    // If Platform is Android then check for permissions.

    if (Platform.OS === 'ios') {
      this.downloadFile(fileUrl);
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message:
              'Application needs access to your storage to download File',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Start downloading
          this.setState({
            visible: false,
            showAlert: true,
            message: 'Downloading...',
          });
          this.downloadFile(fileUrl);
          console.log('Storage Permission Granted.');
        } else {
          // If permission denied then show alert
          Alert.alert('Error', 'Storage Permission Not Granted');
        }
      } catch (err) {
        // To handle permission related exception
        console.log('++++' + err);
      }
    }
  };

  downloadFile = fileUrl => {
    let date = new Date();
    // File URL which we want to download
    let FILE_URL = fileUrl;
    // Function to get extention of the file url
    let file_ext = this.getFileExtention(FILE_URL);

    file_ext = '.' + file_ext[0];
    console.log('file_ext', file_ext);
    // config: To get response by passing the downloading related options
    // fs: Root directory path to download
    const {config, fs} = RNFetchBlob;
    let RootDir =
      Platform.OS === 'android' ? fs.dirs.DownloadDir : fs.dirs.DocumentDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        path:
          RootDir +
          '/file_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          file_ext,
        description: 'downloading file...',
        notification: true,
        // useDownloadManager works with Android only
        useDownloadManager: true,
      },
    };
    config(options)
      .fetch('GET', FILE_URL)
      .then(res => {
        // Alert after successful downloading
        console.log('res -> ', JSON.stringify(res));
        this.setState({showAlert: false}, () =>
          FileViewer.open(res.path())
            .then(() => console.log('success'))
            .catch(err => alert('Error occured opening the file')),
        );
      });
  };

  openModal = item => {
    //console.log('file', item);
    this.setState({fileUrls: item.fileUrls}, () => {
      this.setState({visible: true});
    });
  };

  render() {
    const {data, origin, destination, inn, locations, loader, photo, name} =
      this.state;

    //let inn = [];
    //console.log('ll ==>', locations);

    const {navigation} = this.props;
    if (loader) {
      return <Loader />;
    }
    return (
      <View style={styles.container}>
        {Platform.OS === 'android' && (
          <TouchableWithoutFeedback>
            <SubHeader
              title="Travel History"
              showBack={true}
              backScreen="M-Dashboard"
              navigation={navigation}
            />
          </TouchableWithoutFeedback>
        )}
        {Platform.OS === 'ios' && (
          <>
            <SubHeader
              title="Travel History"
              showBack={true}
              backScreen="M-Dashboard"
              navigation={navigation}
            />
            {/* <TouchableOpacity
              onPress={() => this.setState({showCalendar: true})}>
              <CustomLabel title={'Choose Date'} />
              <CustomLabel
                containerStyle={{
                  borderWidth: 1,
                  borderColor: Colors.overlay,
                  borderRadius: 10,
                  padding: 5,
                  width: '30%',
                  alignItems: 'center',
                }}
                title={moment(this.state.date).format('YYYY-MM-DD')}
              />
              <DateTimePicker
                maximumDate={new Date()}
                isVisible={this.state.showCalendar}
                onConfirm={date =>
                  this.setState({date: date, showCalendar: false}, () =>
                    this.fetchResults(),
                  )
                }
                onCancel={() => this.setState({showCalendar: false})}
                date={new Date(this.state.date)}
              />
            </TouchableOpacity> */}
            {/* <CustomCalendar 
          title = {'Choose Date'} 
          onPress = {() => this.setState({showCalendar: true})} 
          isVisible = {this.state.showCalendar} 
          onConfirm = {(date) =>this.setState({date: date,showCalendar:false}, () =>
          this.fetchResults())} 
          onCancel = {() =>this.setState({showCalendar:false})} 
          date={new Date(this.state.date)} 
        /> */}
          </>
        )}
        {this.state.pickerTrips?.length > 1 && (
          <LinearGradient
            colors={Colors.mainHeader}
            style={{
              maxHeight: 40,
              width: 100,
              borderRadius: 7,
              //paddingHorizontal: 3,
              // marginBottom: 10,
              alignSelf: 'flex-end',
            }}>
            <Select
              style={{
                borderWidth: 0,
                padding: 0,
                //minWidth: 120,
                //textAlign: 'center',
                color: 'white',
                //alignItems: 'center',
              }}
              selectedValue={this.state.currentTripPicker}
              onValueChange={(value, i) => {
                console.log('val', value);
                this.setState(
                  {
                    currentTripPicker: value,
                    currentIndex: this.state.pickerTrips.indexOf(value),
                  },
                  () => this.retreiveDataNew(),
                  // this.getStaffReportNew(
                  //   this.state.institute_id,
                  //   this.state.bearer_token,
                  // ),
                );
              }}>
              {this.state.pickerTrips.map((e, i) => (
                <Select.Item label={e} key={i} value={e} />
              ))}
            </Select>
          </LinearGradient>
        )}
        {/* <CustomPicker
          options={this.state.travelInfo}
          selectedValue={this.state.tripNoChosen.toString()}
          onValueChange={(val) =>
            this.setState(
              {tripNoChosen: Number(val), loader: true, distance: '0'},
              () => this.fetchResults(),
            )
          }
        /> */}

        {this.state.visible && (
          <Overlay
            onBackdropPress={() => this.setState({visible: false})}
            overlayStyle={{
              width: '70%',
              minHeight: '30%',
              justifyContent: 'center',
              backgroundColor: Colors.white,
            }}
            isVisible={this.state.visible}>
            <View style={{flex: 1, alignSelf: 'center'}}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: Colors.maroon,
                  marginBottom: 10,
                }}>
                Download files:
              </Text>
              {this.state.fileUrls.map((each, i) => {
                const num = i + 1 + '';
                return (
                  <TouchableOpacity onPress={() => this.checkPermission(each)}>
                    <Text
                      style={{
                        borderBottomColor: 'blue',
                        borderBottomWidth: 1,
                        color: 'blue',
                        marginBottom: 5,
                        maxWidth: '70%',
                      }}>
                      {'Attachment ' + num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Overlay>
        )}

        <AwesomeAlert
          show={this.state.showAlert}
          showProgress={true}
          progressColor={Colors.header}
          message={this.state.message}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={true}
          messageStyle={{
            fontFamily: 'Poppins-Regular',
            fontSize: 13,
            textAlign: 'center',
          }}
          titleStyle={{fontFamily: 'Poppins-SemiBold', fontSize: 14}}
        />

        {/* {origin.length > 0 && destination.length > 0 && ( */}
        {origin && destination && (
          <View style={styles.map}>
            <MapView
              style={{width: '100%', height: '100%'}}
              //mapType={'satellite'}
              ref={c => (this.mapView = c)}
              //loadingEnabled
              followUserLocation={true}
              //cacheEnabled={true}
              initialRegion={{
                latitude: parseFloat(
                  destination?.coordinates?.latitude || COORDINATES.latitude,
                ),
                longitude: parseFloat(
                  destination?.coordinates?.longitude || COORDINATES.longitude,
                ),
                latitudeDelta: LAT_DELTA,
                longitudeDelta: LONG_DELTA,
              }}
              zoomEnabled={true}>
              {locations.length > 0 && (
                <>
                  <Marker
                    key={origin.capturedTime}
                    coordinate={origin.coordinates}
                    opacity={0.7}
                    //description={'Origin'}
                    title={moment(origin.capturedTime)
                      .local()
                      .format('h:mm a')}>
                    <Image
                      source={{
                        uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_8jXWxkA50-ColElavoSs1x8pLcz5m9fj2A&usqp=CAU',
                      }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 60,
                        //backgroundColor: 'transparent',
                        resizeMode: 'contain',
                        //tintColor: 'green',
                      }}
                    />
                  </Marker>
                  <Marker
                    key={destination.capturedTime}
                    coordinate={destination.coordinates}
                    //opacity={0.7}
                    description={'Destination'}
                    title={moment(destination.capturedTime)
                      .local()
                      .format('h:mm a')}>
                    <>
                      <Text
                        style={{
                          textTransform: 'capitalize',
                          fontWeight: 'bold',
                          color: Colors.maroon,
                        }}>
                        {name}
                      </Text>
                      <Avatar
                        rounded
                        size="medium"
                        avatarStyle={{
                          width: '100%',
                          height: '100%',
                          //borderRadius: 50,
                          resizeMode: 'stretch',
                        }}
                        // containerStyle={{
                        //   position: 'absolute',
                        //   top: 0,
                        //   right: 0,
                        //   zIndex: 1,
                        // }}
                        source={{
                          uri:
                            photo ||
                            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtOqCkEk1bHWlechHBJVOMBkfxoe9vXRO9SH0aTfy8mhNfXVH0DPk0Iu7LEYGg4YlIeAE&usqp=CAU',
                        }}
                      />
                    </>
                  </Marker>
                </>
              )}

              {locations.length > 0 && (
                <Polyline
                  key="polyline"
                  coordinates={locations.map(w => w.coordinates)}
                  //coordinates={inn}
                  geodesic={true}
                  strokeColor="rgba(0,179,253, 0.6)"
                  strokeWidth={6}
                  zIndex={0}
                />
                // <MapViewDirections
                //   //optimizeWaypoints
                //   onStart={params =>
                //     this.setState({
                //       showAlert: true,
                //       message: `Fetching distance between initial and latest/last location...`,
                //     })
                //   }
                //   mode={
                //     this.state.driving_type === 'BUS' ||
                //     this.state.driving_type === 'TRAIN'
                //       ? 'TRANSIT'
                //       : this.state.driving_type
                //   }
                //   onReady={result => {
                //     this.setState({
                //       showAlert: false,
                // distance:
                //   locations[locations.length - 2].routeDistance / 1000,
                //       distance: result.distance,
                //     });

                //     this.mapView.fitToCoordinates(result.coordinates, {
                //       edgePadding: {
                //         right: width / 20,
                //         bottom: height / 20,
                //         left: width / 20,
                //         top: height / 20,
                //       },
                //     });
                //     console.log(`Distance: ${result.distance} km`);
                //     console.log(`Duration: ${result.duration} min.`);
                //   }}
                //   onError={err => {
                //     this.setState({showAlert: false}, () =>
                //       alert('Error fetching path: ' + err),
                //     );
                //   }}
                //   origin={origin.coordinates}
                //   destination={destination.coordinates}
                //   waypoints={inn}
                //   splitWaypoints={true}
                //   apikey={GOOGLE_MAPS_APIKEY}
                //   strokeWidth={8}
                //   strokeColor="red"
                // />
              )}
            </MapView>
          </View>
        )}
        <Modalize
          alwaysOpen={200}
          handlePosition={'inside'}
          handleStyle={{backgroundColor: Colors.red}}
          scrollViewProps={{nestedScrollEnabled: true}}>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: Colors.overlay,
              padding: 5,
              alignItems: 'center',
              marginTop: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Avatar
                rounded
                source={{uri: this.state.photo}}
                size={'medium'}
              />
              <View style={{marginLeft: 10}}>
                <CustomLabel title={this.state.name} />
                <CustomLabel
                  family={'Poppins-Regular'}
                  title={`${Number(this.state.distance).toFixed(2)} km`}
                />
              </View>
            </View>
            <View style={styles.dateContainer}>
              <DatePicker
                //showIcon={false}
                style={
                  {
                    //width: widthPercentageToDP('40'),
                    //marginLeft: 20,
                  }
                }
                date={this.state.date}
                mode="date"
                placeholder={moment(this.state.date)
                  .format('YYYY-MM-DD')
                  .toString()}
                format="YYYY-MM-DD"
                minDate="2016-05-01"
                maxDate={moment().format('YYYY-MM-DD').toString()}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateInput: {
                    //marginLeft: 36
                    borderColor: 'transparent',
                    //marginTop: 10,
                    //marginRight: 36,
                    minHeight: 60,

                    padding: 0,
                  },
                  dateText: {
                    color: 'black',
                    textAlign: 'center',
                    fontSize: 17,
                    fontFamily: 'Poppins-Regular',
                  },
                  // ... You can check the source to find the other keys.
                }}
                onDateChange={date => {
                  console.log('date', date);
                  this.setState(
                    {
                      date: new Date(date),
                      distance: 0,
                      origin: null,
                      destination: null,
                      reverseData: [],
                      pickerTrips: [],
                    },
                    () => this.retreiveDataNew(),
                  );
                }}
              />
            </View>
          </View>

          <Timeline
            ref={c => (this.timeLine = c)}
            //data={data[this.state.tripNoChosen]}
            data={this.state.reverseData}
            // renderDetail={rowData => {
            //   console.log('rr', rowData);
            //   return (
            //     <View style={styles.container}>
            //       <Text style={styles.title}>{rowData.title}</Text>
            //       <Text style={[styles.description]} allowFontScaling={true}>
            //         {rowData.description || ''}
            //       </Text>
            //       {rowData.fileUrls && rowData.fileUrls.length > 0 && (
            //         <TouchableOpacity onPress={() => this.openModal(rowData)}>
            //           <Text
            //             style={{
            //               borderColor: Colors.button[0],
            //               borderWidth: 1,
            //               padding: 3,
            //               maxWidth: '50%',
            //               textAlign: 'center',
            //               fontWeight: 'bold',
            //               fontFamily: 'Poppins-Regular',
            //               color: Colors.white,
            //               backgroundColor: Colors.button[0],
            //             }}>
            //             View Attachments
            //           </Text>
            //         </TouchableOpacity>
            //       )}
            //       {rowData.subject && (
            //         <Text
            //           style={{
            //             color: Colors.mainHeader[0],
            //             fontWeight: 'bold',
            //             fontSize: 14,
            //             fontStyle: 'italic',
            //           }}
            //           numberOfLines={2}>
            //           "{rowData.subject}"
            //         </Text>
            //       )}
            //     </View>
            //   );
            // }}
            //onPressUrl={(index) => this.openModal(index)}
            // circleSize={20}
            // circleColor="red"
            // lineColor="hotpink"
            //innerCircle={'dot'}
            renderCircle={(row, index) => {
              return (
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    borderWidth: 1,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: '#4361EE',
                    position: 'absolute',
                    left: 105,
                  }}>
                  <CustomLabel
                    title={row.title.charAt(0)}
                    size={15}
                    color="white"
                    containerStyle={{
                      backgroundColor:
                        index % 2 === 0
                          ? '#5A189A'
                          : index % 3 === 0
                          ? '#FAA307'
                          : '#4361EE',
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                </View>
              );
            }}
            timeStyle={{
              textAlign: 'center',
              backgroundColor: Colors.button[0],
              color: 'white',
              padding: 5,
              borderRadius: 13,
              //color: Colors.header,
              fontFamily: 'Poppins-Regular',
            }}
            timeContainerStyle={{minWidth: 100}}
            innerCircle={'dot'}
            //lineColor={Colors.button[0]}

            descriptionStyle={{color: 'gray'}}
            options={{
              contentContainerStyle: {
                paddingBottom: 15,
                nestedScrollEnabled: true,
              },
              style: {
                paddingTop: 15,
                //paddingBottom: 100,
                //backgroundColor: 'yellow',
              },
            }}
          />
        </Modalize>
      </View>
    );
  }
}

export default StaffLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: 'yellow',
    //paddingBottom: 50,
  },
  map: {
    height: Dimensions.get('window').height,
    width: '100%',
    alignSelf: 'center',
    //marginTop: 30,
  },
  dateContainer: {
    borderRadius: 8,
    width: widthPercentageToDP('40'),
    elevation: 5,
    shadowColor: 'grey',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    backgroundColor: Colors.white,
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#67747d',
  },
  labelContainer: {
    margin: '1.5%',
    alignSelf: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    borderLeftWidth: 2,
    flexDirection: 'column',
    flex: 1,
  },
  detail: {paddingTop: 10, paddingBottom: 10},
  description: {
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#aaa',
    marginTop: 10,
    marginBottom: 10,
  },
});
