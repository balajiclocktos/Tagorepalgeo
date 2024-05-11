import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import CustomCard from '../../common/CustomCard';
import Task from '../../../assets/task.svg';
import Male from '../../../assets/male.svg';
import Female from '../../../assets/female.svg';

import LinearGradient from 'react-native-linear-gradient';
import CustomLabel from '../../common/CustomLabel';
import {Colors} from '../../../utils/configs/Colors';
import {Avatar} from 'react-native-elements/dist/avatar/Avatar';
import {Icon} from 'react-native-elements';
import {Define} from './StaffMaster';
const TaskStatus = props => {
  return (
    <CustomCard radius={0} width={'100'}>
      <View
        style={
          ([styles.row],
          {
            //backgroundColor: '#0061FF99',
            //borderTopLeftRadius: 6,
            //borderTopRightRadius: 6,
          })
        }>
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
              title={`${props.name} | ${props.staffCode}`}
              margin={0}
              labelStyle={{color: 'black', textTransform: 'capitalize'}}
            />

            <CustomLabel
              labelStyle={{color: 'black'}}
              size={12}
              family={'Poppins-Regular'}
              title={`${props.department} | ${props.designation}`}
              margin={0}
            />
          </View>
        </View>
      </View>
      <View>
        <View
          style={{
            flexDirection: 'row',
            // backgroundColor: 'yellow',
            // alignItems: 'center',
            padding: 5,
          }}>
          <View style={{marginTop: 4, marginRight: 6}}>
            <Task width={20} height={15} />
          </View>
          <View>
            <CustomLabel
              title={props.taskTitle}
              labelStyle={{textTransform: 'capitalize'}}
              margin={0}
            />
            <CustomLabel
              title={props.taskDescription}
              labelStyle={{
                color: Colors.button[0],
                textTransform: 'capitalize',
              }}
              margin={0}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
          }}>
          <Define
            icon
            name={'clock'}
            type={'feather'}
            size={15}
            color={Colors.button[0]}
            value={props.taskTimings}
          />
          <View style={styles.row}>
            <Task width={15} height={15} />
            <CustomLabel
              title={props.mandatory ? 'Mandatory' : 'Not Mandatory'}
            />
          </View>
        </View>

        <Define
          text
          image
          title={'Alloted By:'}
          value={`${props.reportingManager}/${props.rDesignation}`}
          reportingManagerPhoto={props.managerPhoto}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
          }}>
          <Define
            icon
            name={props.status === 'Pending' ? 'pending-actions' : 'check-all'}
            type={
              props.status === 'Pending' ? 'material' : 'material-community'
            }
            size={15}
            color={props.status === 'Pending' ? '#FE9705' : '#31BD3F'}
            value={props.status}
            fontColor={props.status === 'Pending' ? '#FE9705' : '#31BD3F'}
          />

          <Text> | </Text>
          <Define text title={'Staff Type:'} value={props.type} />
        </View>
        <Box value={props.attachments.length} onPress={props.onPress} />
      </View>
    </CustomCard>
  );
};

export default TaskStatus;

const Box = props => {
  return (
    <View
      style={{
        width: '85%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        //alignSelf: 'center',
        //padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: Colors.button[0],
      }}>
      <View style={{marginLeft: 8}}>
        <Define
          icon
          value={`${props.value} file(s) attached`}
          name={'attachment'}
          type={'entypo'}
          color={Colors.button[0]}
        />
      </View>
      <LinearGradient
        style={{
          alignSelf: 'flex-end',
        }}
        colors={Colors.button}>
        <TouchableOpacity onPress={props.onPress}>
          <View style={styles.row}>
            <Icon
              name="download"
              type={'font-awesome'}
              color={Colors.white}
              size={25}
            />
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
});
