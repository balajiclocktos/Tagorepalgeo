<Agenda
  items={this.state.items}
  loadItemsForMonth={() => {}}
  selected={this.state.date}
  onDayPress={day =>
    this.setState(
      {
        date: day.dateString,
        // origin: null,
        // destination: null,
        // inn: [],
        // locations: [],
        // distance: '0',
      },
      () => {
        this.getStaffReport(this.state.StaffNo);
        this.getTasks(
          this.state.user_id,
          this.state.institute_id,
          this.state.bearer_token,
        );
        console.log('day', day);
        // this.getTotalWorkingDays(
        //   this.state.user_id,
        //   this.state.institute_id,
        //   this.state.bearer_token,
        //   day.dateString,
        // );
      },
    )
  }
  renderItem={this.renderItem}
  renderEmptyDate={this.renderEmptyDate}
  renderEmptyData={this.renderEmptyDate}
  rowHasChanged={this.rowHasChanged}
  showClosingKnob={true}
  futureScrollRange={100}
  style={{maxHeight: 300}}
  displayLoadingIndicator={false}
  theme={{
    agendaKnobColor: Colors.header,
    agendaDayNumColor: Colors.maroon,
    agendaTodayColor: Colors.header,
    selectedDayBackgroundColor: Colors.header,
    selectedDayTextColor: Colors.white,
    dotColor: Colors.maroon,
    todayTextColor: Colors.maroon,
  }}
/>;

//focussed Data in Home.js

focussedData = async () => {
  this.setState({loader: true});
  setTimeout(() => this.setState({loader: false}), 1000);
  const assignedLocationsAll = await getAssignedLocations();
  const checked_out = await this.asyncStorageDataFetch('checked_out');
  const bearer_token = await this.asyncStorageDataFetch('bearer_token');
  const StaffNo = await this.asyncStorageDataFetch('user_id');
  const institute_id = await this.asyncStorageDataFetch('institute_id');
  const profile_pic = await this.asyncStorageDataFetch('profile_pic');
  //('pppp', profile_pic);
  const running_status = await this.asyncStorageDataFetch('running_status');
  const isFaceRequired = await this.asyncStorageDataFetch('isFaceRequired');
  const travelCheckIn = await this.asyncStorageDataFetch('travelCheckIn');
  const isTravelCheckinWithMpin = await this.asyncStorageDataFetch(
    'isTravelCheckinWithMpin',
  );
  const qrCheckInPressed = await this.asyncStorageDataFetch('qrCheckInPressed');
  const travelMpinPressed = await this.asyncStorageDataFetch(
    'travelMpinPressed',
  );
  const actualCheckInTime = await this.asyncStorageDataFetch(
    'actualCheckInTime',
  );
  const locations = JSON.parse(await this.asyncStorageDataFetch('locations'));
  const beaconPressed = await this.asyncStorageDataFetch('beaconPressed');
  const wifiPressed = await this.asyncStorageDataFetch('wifiPressed');
  //console.log('actualCheckInTime', actualCheckInTime);
  const current_travel_checkin = await this.asyncStorageDataFetch(
    'current_travel_checkin',
  );
  const trackInBackground = await this.asyncStorageDataFetch(
    'trackInBackground',
  );
  const state = await BackgroundGeolocation.getState();
  this.setState({
    assignedLocationsAll,
    checked_out,
    locations,
    bearer_token,
    profile_pic,
    StaffNo,
    institute_id,
    running_status: running_status ? running_status : 'resume',
    current_travel_checkin,
    travelCheckIn: travelCheckIn === 'yes' ? true : false,
    qrCheckInPressed: qrCheckInPressed === 'yes' ? true : false,
    travelMpinPressed: travelMpinPressed === 'yes' ? true : false,
    beaconPressed: beaconPressed === 'yes' ? true : false,
    wifiPressed: wifiPressed === 'yes' ? true : false,
  });

  if (current_travel_checkin === 'running') {
    await this.getAppointments();
  }
  if (current_travel_checkin === 'stopped') {
    this.setState({appointments: []});
  }

  try {
    const body = {
      staffCode: StaffNo,
      instituteId: Number(institute_id),
    };
    const res = await tokenApi();
    const response = await res.post('api/Staff/IsCheckedInNew', body);
    const json = response.data;
    this.setState({isOn: true});
    //console.log('jOSN=-==', json);

    if (json && json.isCheckedIn) {
      console.log('state_bg==', state);
      // ToDo:
      // check for background location tracking flag and also new one time
      // check in flag logic

      if (!state.enabled && trackInBackground === 'true') {
        await BackgroundGeolocation.start();
        if (!isIOS) {
          RNDisableBatteryOptimizationsAndroid.isBatteryOptimizationEnabled().then(
            isEnabled => {
              if (isEnabled) {
                RNDisableBatteryOptimizationsAndroid.openBatteryModal();
              }
            },
          );
        }
      }
      this.setState({
        modeOfCheckIn: json.modeOfCheckIn,
        actualCheckInTime: moment
          .utc(json?.checkedInTime)
          .local()
          .format('DD.MM.YYYY h:mm a'),
        checked_out: 'no',
      });
      await AsyncStorage.setItem('checked_out', 'no');
      if (json?.shiftInfo) {
        await AsyncStorage.setItem(
          'checkInTime',
          moment.utc(json?.shiftInfo?.checkinTime).local().format('h:mm a'),
        );
        await AsyncStorage.setItem(
          'checkOutTime',
          moment.utc(json?.shiftInfo?.checkoutTime).local().format('h:mm a'),
        );
        this.setState({
          checkInTime: moment
            .utc(json?.shiftInfo?.checkinTime)
            .local()
            .format('h:mm a'),
          checkOutTime: moment
            .utc(json?.shiftInfo?.checkoutTime)
            .local()
            .format('h:mm a'),
          shiftName: json?.shiftInfo?.shiftName,
        });
      }
      if (json?.locationDetails) {
        this.setState({geofence: json?.locationDetails});
        const coordinates = JSON.parse(json.locationDetails.coordinates);
        if (coordinates.length > 0) {
          const latitudeChecked = JSON.parse(
            json?.locationDetails?.coordinates,
          );
          //  console.log('latitudeChecked', latitudeChecked[0]);
          this.setState({
            latitudeChecked: latitudeChecked[0].Latitude,
            longitudeChecked: latitudeChecked[0].Longitude,
          });
        }
      }
      //console.log('latitudeChecked', latitudeChecked[0]);
    } else {
      this.setState({checked_out: 'yes'});
      await AsyncStorage.setItem('checked_out', 'yes');
      await BackgroundGeolocation.resetOdometer();
      await BackgroundGeolocation.stop();
    }
  } catch (e) {
    if (e.message.includes('Network')) {
      this.setState({isOn: false});
    }

    alert('Error fetching current checkin status: ' + e.message);
    console.log('focus_isCheckedInError', e);
  }
  if (isFaceRequired === 'false' && isTravelCheckinWithMpin === 'no') {
    if (trackInBackground === 'true') {
      BackgroundGeolocation.start();
      if (!isIOS) {
        RNDisableBatteryOptimizationsAndroid.isBatteryOptimizationEnabled().then(
          isEnabled => {
            if (isEnabled) {
              RNDisableBatteryOptimizationsAndroid.openBatteryModal();
            }
          },
        );
      }
    }
  }

  if (checked_out === 'no') {
    if (!state.enabled && trackInBackground === 'true') {
      BackgroundGeolocation.start();
      if (!isIOS) {
        RNDisableBatteryOptimizationsAndroid.isBatteryOptimizationEnabled().then(
          isEnabled => {
            if (isEnabled) {
              RNDisableBatteryOptimizationsAndroid.openBatteryModal();
            }
          },
        );
      }
    }
  }
  if (
    checked_out === 'yes' &&
    (isFaceRequired === 'true' || isTravelCheckinWithMpin === 'yes')
  ) {
    BackgroundGeolocation.resetOdometer();
    if (current_travel_checkin === 'stopped') BackgroundGeolocation.stop();
  }
};
