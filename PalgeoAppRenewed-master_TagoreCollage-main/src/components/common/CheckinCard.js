import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import CustomCard from './CustomCard';
import Wave from '../../assets/wave.svg';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import CustomLabel from './CustomLabel';
import {Colors} from '../../utils/configs/Colors';
import {CustomButton} from './CustomButton';
import moment from 'moment';
import PrimaryCard from './PrimaryCard';
import * as Animatable from 'react-native-animatable';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import HomeCv from '../../assets/home_cv.svg';

const CheckinCard = props => {
  return (
    <PrimaryCard alignSelf="center" width={'95'}>
      {/* <Wave width={'100%'} style={{position: 'absolute', top: 0, left: 0}} /> */}
      <View style={{...styles.row, justifyContent: 'space-between'}}>
        <View style={{...styles.row, maxWidth: '70%', flexWrap: 'wrap'}}>
          <RowBox
            name={
              props.modeOfCheckIn.includes('Travel')
                ? 'bus-side'
                : 'map-marker-check-outline'
            }
            type={'material-community'}
            size={15}
            title={props.modeOfCheckIn}
            border
          />
          <RowBox
            name={
              !props.shiftName.includes('Night') ? 'day-sunny' : 'night-clear'
            }
            type={'fontisto'}
            size={15}
            title={props.shiftName}
          />
        </View>
        <Animatable.View
          iterationCount="infinite"
          duration={3000}
          animation={'tada'}>
          <CustomButton
            onPress={props.onPress}
            title={'Check Out'}
            color={Colors.button[0]}
            textStyle={{fontSize: 10}}
          />
        </Animatable.View>
      </View>
      <View style={styles.row}>
        <View
          style={{
            borderRightWidth: 1,
            borderRightColor: Colors.button[0],
            width: '65%',
            paddingRight: 5,
          }}>
          <RowBox
            name={'location-enter'}
            type={'material-community'}
            size={15}
            color={Colors.mainHeader[0]}
            title={props.accessLocation}
          />
          <RowBox
            maxWidth={'70%'}
            name={'calendar'}
            type={'entypo'}
            size={15}
            color={Colors.mainHeader[0]}
            title={`${moment(
              props.actualCheckInTime,
              'DD.MM.YYYY h:mm a',
            ).format('h:mm a')}(${moment(
              props.actualCheckInTime,
              'DD.MM.YYYY h:mm a',
            ).format('DD.MM.YYYY')})`}
          />
          {/* <CustomButton
            textStyle={{fontSize: 11}}
            radius={20}
            disabled
            color={'#F15761'}
            title={`You checked in at ${moment(
              props.actualCheckInTime,
              'DD.MM.YYYY h:mm a',
            ).format('h:mm a')} on ${moment(
              props.actualCheckInTime,
              'DD.MM.YYYY h:mm a',
            ).format('DD.MM.YYYY')}`}
          /> */}
        </View>
        <View>
          <RowBox
            name={'clock'}
            type={'feather'}
            color={Colors.button[0]}
            size={15}
            title={`Entry: ${props.checkInTime}`}
          />
          <RowBox
            name={'clock'}
            type={'feather'}
            color={Colors.button[0]}
            size={15}
            title={`Exit: ${props.checkOutTime}`}
          />
        </View>
      </View>
      {props.children}
    </PrimaryCard>
  );
};

export default CheckinCard;

export const NewCheckinCard = props => (
  <CustomCard width={'95'} alignSelf={'center'}>
    <View
      style={{
        ...styles.row,
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
      <View
        style={{
          width: widthPercentageToDP('40'),
          backgroundColor: Colors.mainHeader[0],
          opacity: 0.7,
          padding: 5,
          borderRadius: 5,
        }}>
        <RowBox
          name={
            props.modeOfCheckIn.includes('Travel')
              ? 'bus-side'
              : 'map-marker-check-outline'
          }
          type={'material-community'}
          size={15}
          fontSize={14}
          family={'Poppins-Bold'}
          color={'white'}
          textcolor={'white'}
          title={props.modeOfCheckIn}
        />
      </View>
      <RowBox
        name={'day-sunny'}
        type={'fontisto'}
        color={Colors.mainHeader[0]}
        textcolor={'black'}
        size={20}
        title={props.shiftName}
        maxWidth={widthPercentageToDP('50')}
      />
    </View>
    <View
      style={{
        ...styles.row,
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
      <RowBox
        name={'location-enter'}
        type={'material-community'}
        size={15}
        width={'50%'}
        color={Colors.mainHeader[0]}
        title={props.accessLocation}
      />
      <RowBox
        width={'50%'}
        name={'calendar'}
        textcolor={'black'}
        type={'entypo'}
        size={15}
        color={Colors.mainHeader[0]}
        title={`${moment(props.actualCheckInTime, 'DD.MM.YYYY h:mm a').format(
          'h:mm a',
        )}(${moment(props.actualCheckInTime, 'DD.MM.YYYY h:mm a').format(
          'DD.MM.YYYY',
        )})`}
      />
    </View>
    <View
      style={{
        ...styles.row,
        justifyContent: 'space-between',
        borderBottomColor: Colors.overlay,
        borderBottomWidth: 1,
        paddingBottom: 10,
        marginBottom: 5,
      }}>
      <View
        style={{
          width: '50%',
          borderColor: '#AAAAAA',
          borderRadius: 10,
          borderWidth: 1,
        }}>
        <View>
          <RowBox
            name={'clock'}
            type={'feather'}
            color={Colors.button[0]}
            containerStyle={{padding: 3}}
            size={15}
            fontSize={10}
            title={`Entry: ${props.checkInTime}`}
          />
          <View
            style={{
              backgroundColor: Colors.mainHeader[0],
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}>
            <RowBox
              name={'clock'}
              type={'feather'}
              color={'white'}
              textcolor={'white'}
              containerStyle={{padding: 3}}
              fontSize={10}
              size={15}
              title={`Exit: ${props.checkOutTime}`}
            />
          </View>
        </View>
      </View>
      <HomeCv />
    </View>
    <View style={{...styles.row, justifyContent: 'space-between'}}>
      <View>{props.children}</View>
      <Animatable.View
        iterationCount="infinite"
        duration={3000}
        animation={'tada'}
        style={{alignSelf: 'flex-end'}}>
        <CustomButton
          onPress={props.onPress}
          title={'Check Out'}
          color={Colors.button[0]}
          textStyle={{fontSize: 14}}
          radius={30}
        />
      </Animatable.View>
    </View>
  </CustomCard>
);

const RowBox = props => {
  return (
    <View
      style={[
        styles.row,
        {
          borderRightWidth: props.border ? 1 : 0,
          borderRightColor: Colors.overlay,
          maxWidth: props.maxWidth,
          width: props.width,
          //maxWidth: '70%',
        },
      ]}>
      <Icon
        name={props.name}
        size={props.size}
        color={props.color}
        type={props.type}
        style={{marginHorizontal: 5}}
      />
      <CustomLabel
        title={props.title}
        labelStyle={{
          fontSize: props.fontSize || 14,
          fontFamily: props.family || 'Poppins-Regular',
          color: props.textcolor,
        }}
        margin={0}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
