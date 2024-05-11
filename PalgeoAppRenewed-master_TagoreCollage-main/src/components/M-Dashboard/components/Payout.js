import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import CustomCard from '../../common/CustomCard';
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
import {Define} from './StaffMaster';
const Payout = props => {
  return (
    <CustomCard width={'100'}>
      <View style={[styles.row]}>
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
                borderColor: Colors.mainHeader[0],
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
              labelStyle={{textTransform: 'capitalize', fontSize: 14}}
            />

            <CustomLabel
              size={12}
              family={'Roboto-Regular'}
              title={`${props.department} | ${props.designation}`}
              margin={0}
            />
          </View>
        </View>
      </View>
      <View>
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            //padding: 5,
            width: '100%',
          }}>
          {props.checkInType && <Car />}
          {props.checkInType && (
            <CustomLabel
              title={props.checkInType}
              containerStyle={{width: '39%'}}
              margin={0}
            />
          )}

          {props.assignedLocation && (
            <Define
              icon
              name={'location-enter'}
              type={'material-community'}
              color={'#31BD3F'}
              value={props.assignedLocation}
              size={15}
            />
          )}
        </View>

        <View style={styles.row}>
          {props.shiftCheckInTime !== '' && (
            <Define
              icon
              name={'location-enter'}
              type={'material-community'}
              color={'#31BD3F'}
              value={moment(props.shiftCheckInTime).format('h:mm a')}
              size={15}
            />
          )}
          {props.shiftCheckOutTime !== '' && (
            <Define
              icon
              name={'location-exit'}
              type={'material-community'}
              color={'#F15761'}
              value={moment(props.shiftCheckOutTime).format('h:mm a')}
              size={15}
            />
          )}
          {props.shiftName && (
            <View style={styles.row}>
              <Day />
              <CustomLabel
                title={props.shiftName}
                //labelStyle={{color: Colors.overlay}}
                margin={0}
              />
            </View>
          )}
        </View>
        <Define
          text
          image
          icon
          name={'emoji-people'}
          type={'material'}
          size={15}
          color={Colors.button[0]}
          title={'Reporting Staff:'}
          value={`${props.reportingManager}/${props.rDesignation}`}
          reportingManagerPhoto={props.managerPhoto}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            //padding: 5,
          }}>
          <Define
            icon
            text
            title={'Total Working Days:'}
            name={'calendar'}
            type={'antdesign'}
            color={Colors.button[0]}
            value={`${props.totalWorkingDays} days`}
            size={15}
          />

          <Text> | </Text>
          <Define text title={'LOP Days:'} value={`${props.lop} days`} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 5,
          }}>
          <Define
            text
            title={'Total Allowances:'}
            value={`₹ ${props.totalAllowances}`}
          />

          <Text> | </Text>
          <Define
            text
            title={'Total Deductions:'}
            value={`₹ ${props.totalDeductions}`}
          />
        </View>
        <View style={{width: '90%'}}>
          <Box
            title={'Net Salary:'}
            value={`₹ ${props.netSalary}`}
            onPress={ props.onPress2}
          />
        </View>
      </View>
    </CustomCard>
  );
};

export default Payout;

const Box = props => {
  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // alignSelf: 'center',
        paddingLeft: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Colors.button[0],
      }}>
      <View style={{width: '50%'}}>
        <Define
          icon
          text
          title={'Net Salary:'}
          value={props.value}
          name={'rupee'}
          type={'font-awesome'}
          color={Colors.button[0]}
        />
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: Colors.button[0],
          //width: '40%',
          borderRadius: 6,

          paddingHorizontal: 10,
          paddingVertical: 7,
        }}
        onPress={props.onPress}>
        <View style={{...styles.row, justifyContent: 'space-around'}}>
          <Icon
            name="file-pdf-o"
            type={'font-awesome'}
            color={Colors.red}
            backgroundColor={Colors.white}
            size={25}
          />
          <CustomLabel labelStyle={{color: 'white'}} title={'View Pay Slip'} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
