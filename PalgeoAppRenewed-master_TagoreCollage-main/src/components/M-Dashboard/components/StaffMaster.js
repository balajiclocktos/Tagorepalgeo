import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Wave from '../../../assets/wave.svg';
import Car from '../../../assets/car.svg';
import Male from '../../../assets/male.svg';
import Female from '../../../assets/female.svg';
import Day from '../../../assets/day.svg';
import Department from '../../../assets/department.svg';
import Designation from '../../../assets/designation.svg';
import LinearGradient from 'react-native-linear-gradient';
import CustomLabel from '../../common/CustomLabel';
import {Colors} from '../../../utils/configs/Colors';
import {Avatar} from 'react-native-elements/dist/avatar/Avatar';
import {Icon} from 'react-native-elements';
import moment from 'moment';
import {Card} from 'react-native-elements/dist/card/Card';

export const Define = props => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',

      // width: '50%',
    }}>
    {props.icon && (
      <Icon
        style={{marginRight: 5}}
        size={props.size}
        name={props.name}
        type={props.type}
        color={props.color}
      />
    )}
    {props.text && (
      <CustomLabel
        title={props.title}
        family="Poppins-Regular"
        margin={0}
        color={props.titleColor}
        labelStyle={{
          // color: Colors.overlay,
          fontSize: 12,
        }}
      />
    )}

    <CustomLabel
      {...props}
      margin={0}
      color={props.labelColor || props.color}
      title={props.value}
      labelStyle={{
        borderRightWidth: props.border ? 1 : 0,
        borderColor: Colors.overlay,
        paddingRight: 10,
        fontSize: 12,
        //color: props.fontColor || 'black',
      }}
    />
    {props.image && (
      <Avatar
        rounded
        containerStyle={{borderColor: Colors.button[0], borderWidth: 1}}
        source={{
          uri:
            props.reportingManagerPhoto ||
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWo3luud5KPZknLR5zdUUwzvYBztWgTxrkbA&usqp=CAU',
        }}
      />
    )}
  </View>
);

const NewStaffMaster = props => {
  return (
    <Card
      containerStyle={{
        minHeight: 100,
        width: '100%',
        //borderRadius: 6,
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
        paddingBottom: 10,
      }}>
      <View style={styles.row}>
        <View style={[styles.row, {width: '100%'}]}>
          <View>
            <Avatar
              rounded
              size={40}
              source={{
                uri:
                  props.staffPhoto ||
                  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWo3luud5KPZknLR5zdUUwzvYBztWgTxrkbA&usqp=CAU',
              }}
              containerStyle={{
                borderWidth: 1,
                //borderColor: Colors.white,
                margin: 5,
              }}
            />
          </View>
          <View style={{alignSelf: 'flex-start', marginTop: 8}}>
            {props.gender === 'male' ? <Male /> : <Female />}
          </View>
          <View style={{}}>
            <CustomLabel
              title={`${props.name} (${props.age} years) ${props.staffCode}`}
              margin={0}
              labelStyle={{
                //color: 'white',
                textTransform: 'capitalize',
              }}
            />

            <CustomLabel
              labelStyle={
                {
                  //color: 'white'
                }
              }
              size={12}
              family={'Poppins-Regular'}
              title={`${props.department} | ${props.designation}`}
              margin={0}
            />
          </View>
        </View>
      </View>
      <View>
        <View style={{...styles.row, marginLeft: 10}}>
          <Define
            family={'Poppins-Regular'}
            text
            title={'Staff Type:'}
            value={props.type}
            border
          />

          <Define
            text
            family={'Poppins-Regular'}
            title={'Experience:'}
            value={`${props.experience} years`}
          />
        </View>

        {props.shiftData?.length > 0 && (
          <View style={{...styles.row, marginLeft: 10}}>
            <Car />
            <CustomLabel
              title={
                props.shiftData[0].locationsAssigned[0].includes('Travel')
                  ? 'Travel Checkin'
                  : 'Simple Checkin'
              }
              //labelStyle={{color: Colors.overlay}}
              margin={0}
              family={'Poppins-Regular'}
            />
            <Text> | </Text>
            <Day />
            <CustomLabel
              title={props.shiftData[0].shiftName}
              //labelStyle={{color: Colors.overlay}}
              margin={0}
              family={'Poppins-Regular'}
            />
          </View>
        )}
        <View style={{...styles.row, marginLeft: 10}}>
          <Define
            icon
            name={'mail'}
            type={'antdesign'}
            color={Colors.button[0]}
            labelColor={'black'}
            value={props.email}
            border
            family={'Poppins-Regular'}
            size={15}
          />
          <Define
            icon
            name={'mobile-phone'}
            type={'font-awesome'}
            labelColor={'black'}
            color={Colors.button[0]}
            family={'Poppins-Regular'}
            value={props.mobile}
            size={20}
          />
        </View>
        <View style={{marginLeft: 15}}>
          <Define
            text
            image
            icon
            name={'emoji-people'}
            type={'material'}
            color={Colors.button[0]}
            size={15}
            family={'Poppins-Regular'}
            title={'Reporting Staff:'}
            value={`${props.reportingManager}/${props.rDesignation}`}
            reportingManagerPhoto={props.managerPhoto}
          />
        </View>
      </View>
      {props.shiftData?.length > 0 && (
        <View style={{...styles.row, alignSelf: 'center', width: '95%'}}>
          <Define
            icon
            name={'location-enter'}
            type={'material-community'}
            family={'Poppins-Regular'}
            labelColor={'black'}
            color={'#31BD3F'}
            value={moment(props.shiftData[0].scheduledCheckInTime).format(
              'h:mm a',
            )}
            size={15}
          />
          <Define
            icon
            name={'location-exit'}
            type={'material-community'}
            family={'Poppins-Regular'}
            labelColor={'black'}
            color={'#F15761'}
            value={moment(props.shiftData[0].scheduledCheckOutTime).format(
              'h:mm a',
            )}
            size={15}
          />
          <View style={{width: '50%'}}>
            <Define
              icon
              name={'location-enter'}
              type={'material-community'}
              family={'Poppins-Regular'}
              labelColor={'black'}
              color={'#31BD3F'}
              value={props.shiftData[0].locationsAssigned[0]}
              size={15}
            />
          </View>
        </View>
      )}
    </Card>
  );
};

export const StaffMaster = props => {
  return (
    <View style={styles.container}>
      <Wave width={'100%'} style={{position: 'absolute', top: 0, left: 0}} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          //backgroundColor: 'yellow',
        }}>
        <View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View>
              <Avatar
                rounded
                source={{
                  uri:
                    props.staffPhoto ||
                    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWo3luud5KPZknLR5zdUUwzvYBztWgTxrkbA&usqp=CAU',
                }}
                containerStyle={{
                  borderWidth: 1,
                  borderColor: Colors.button[0],
                  margin: 5,
                }}
              />
            </View>
            {props.gender.toLowerCase() === 'male' ? <Male /> : <Female />}
            <CustomLabel
              title={`${props.name} ( ${props.age} years )    ${props.staffCode}`}
              margin={0}
              labelStyle={{textTransform: 'capitalize'}}
            />
          </View>
          {props.shiftData?.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 5,
              }}>
              <Car />
              <CustomLabel
                title={
                  props.shiftData[0].locationsAssigned[0].includes('Travel')
                    ? 'Travel Checkin'
                    : 'Simple Checkin'
                }
                labelStyle={{color: Colors.overlay}}
                margin={0}
              />
              <Text> | </Text>
              <Day />
              <CustomLabel
                title={props.shiftData[0].shiftName}
                labelStyle={{color: Colors.overlay}}
                margin={0}
              />
            </View>
          )}
          <View style={styles.row}>
            <Define text title={'Staff Type:'} value={props.type} border />

            <Define
              text
              title={'Experience:'}
              value={`${props.experience} years`}
            />
          </View>
          <View style={styles.row}>
            <Define
              icon
              name={'mail'}
              type={'antdesign'}
              color={Colors.button[0]}
              value={props.email}
              border
              size={15}
            />
            <Define
              icon
              name={'mobile-phone'}
              type={'font-awesome'}
              color={Colors.button[0]}
              value={props.mobile}
              size={20}
            />
          </View>
          <Define
            text
            title={'Reporting Staff:'}
            value={`${props.reportingManager}/${props.rDesignation}`}
          />
          {props.shiftData?.length > 0 && (
            <View style={styles.row}>
              <Define
                icon
                name={'location-enter'}
                type={'material-community'}
                color={'#31BD3F'}
                value={moment(props.shiftData[0].scheduledCheckInTime).format(
                  'h:mm a',
                )}
                size={20}
              />
              <Define
                icon
                name={'location-exit'}
                type={'material-community'}
                color={'#F15761'}
                value={moment(props.shiftData[0].scheduledCheckOutTime).format(
                  'h:mm a',
                )}
                size={20}
              />

              <Define
                icon
                name={'location-enter'}
                type={'material-community'}
                color={'#31BD3F'}
                value={props.shiftData[0].locationsAssigned[0]}
                size={20}
              />
            </View>
          )}
        </View>
      </View>
      <LinearGradient colors={Colors.button} style={{width: '100%'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 6,
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: '50%',
              alignItems: 'center',
              borderRightWidth: 1,
              borderRightColor: '#FFFFFF99',
              marginRight: 15,
            }}>
            <Department />
            <CustomLabel
              title={props.department}
              labelStyle={{color: Colors.white, marginLeft: 5, fontSize: 12}}
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
              title={props.designation}
              labelStyle={{color: Colors.white, marginLeft: 5, fontSize: 12}}
              margin={0}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default NewStaffMaster;

const styles = StyleSheet.create({
  container: {
    minHeight: 100,
    width: '90%',
    alignSelf: 'center',

    //alignItems: 'center',
    borderRadius: 6,
    borderColor: Colors.overlay,
    borderWidth: 1,

    marginVertical: 10,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
});
