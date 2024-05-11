import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
import { Colors } from '../../../utils/configs/Colors';
import CustomLabel from '../../common/CustomLabel';
import Wave from '../../../assets/wave.svg';
import Male from '../../../assets/male.svg';
import Car from '../../../assets/car.svg';
import Day from '../../../assets/day.svg';
import Department from '../../../assets/department.svg';
import Designation from '../../../assets/designation.svg';
import LeaveBgImage from '../../../assets/leaveBg.svg';
import LinearGradient from 'react-native-linear-gradient';
import Female from '../../../assets/female.svg';
import moment from 'moment';
import { Card } from 'react-native-elements/dist/card/Card';
import { CustomButton } from '../../common/CustomButton';

export const Calendar = props => (
  <TouchableOpacity
    style={{
      width: '40%',
    }}
    onPress={props.onPress}>
    <View
      style={{
        width: '100%',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.button[0],
        padding: 12,
        flexDirection: 'row',
      }}>
      <Icon name="calendar" type="antdesign" color={Colors.button[0]} />
      <CustomLabel title={props.title} />
    </View>
  </TouchableOpacity>
);

export const AbsentCard = props => {
  return (
    <Card
      containerStyle={{
        // minHeight: 100,
        width: '90%',
        borderRadius: 4,
        alignSelf: 'center',
        backgroundColor: 'white',
        elevation: 4,
        shadowOpacity: 0.25,
        shadowOffset: {
          width: 4,
          height: 4,
        },
        shadowRadius: 4,
        shadowColor: 'grey',
        padding: 0,
        borderWidth: 0,
      }}
      wrapperStyle={{
        width: '100%',
        borderRadius: 4,
        alignSelf: 'center',
        backgroundColor: props.index % 2 === 0 ? '#6360F226' : '#C320F233',
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          backgroundColor: props.index % 2 === 0 ? '#6360F226' : '#C320F233',
          borderRadius: 4,
          // marginVertical: 5,
          alignSelf: 'center',
          padding: '1%',
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View>
            <Avatar
              rounded
              source={{
                uri:
                  props.staffPhoto ||
                  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWo3luud5KPZknLR5zdUUwzvYBztWgTxrkbA&usqp=CAU',
              }}
              containerStyle={{ borderWidth: 1, borderColor: Colors.button[0] }}
            />
          </View>
          <View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Poppins-Bold',
                marginVertical: 0,
                marginHorizontal: 10,
                textTransform: 'capitalize',
              }}>
              {props.name}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Poppins-Regular',
                marginVertical: 0,
                marginHorizontal: 10,
                textTransform: 'capitalize',
              }}>
              {props.designation}
            </Text>
          </View>
        </View>
        {props.currentIndex <= 7 && (
          <TouchableOpacity onPress={props.onPress}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: Colors.button[0],
                borderRadius: 6,
                padding: 5,
                margin: 5,
                alignSelf: 'flex-start',
              }}>
              <CustomLabel
                title={'Count'}
                labelStyle={{ color: Colors.button[0] }}
              />
              <Icon
                name={'right'}
                type={'antdesign'}
                color={Colors.button[0]}
                size={15}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};
export const LeaveCard = props => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        //backgroundColor: props.index % 2 === 0 ? '#6360F226' : '#C320F233',
        borderRadius: 4,
        marginVertical: '2%',
        alignSelf: 'center',
        padding: '1%',
        justifyContent: 'space-between',
        // elevation: 1,
        // shadowOffset: {x: 0, y: 1},
        // shadowOpacity: 0.25,
      }}>
      <LeaveBgImage
        width={'100%'}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <View style={{ width: "15%", alignItems: "center", justifyContent: "center" }}>
          <Avatar
            rounded
            source={{
              uri: props.staffPhoto,
            }}
            containerStyle={{ borderWidth: 1, borderColor: Colors.button[0] }}
          />
        </View>
        <View style={{ width: "60%", }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Poppins-Bold',
              marginVertical: 0,
              marginHorizontal: 10,
              textTransform: 'capitalize',
            }}>
            {props.name}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: 'Poppins-Regular',
              marginVertical: 0,
              marginHorizontal: 10,
              textTransform: 'capitalize',
            }}>
            {props.designation}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: 'Poppins-Regular',
              marginVertical: 0,
              marginHorizontal: 10,
              textTransform: 'capitalize',
              textDecorationLine: 1
            }}>
            <Text style={{ fontWeight: "bold" }}>Reason</Text> {props.firstHalfReason}
          </Text>
        </View>

      </View>
      <View >
        {props.isLeave && (
          <CustomLabel
            title={
              props.isFirstHalfLeave && !props.isSecondHalfLeave
                ? 'Morning'
                : !props.isFirstHalfLeave && props.isSecondHalfLeave
                  ? 'Evening'
                  : props.isFirstHalfLeave && props.isSecondHalfLeave
                    ? 'Full Day'
                    : ''
            }
          />
        )}
        {props.currentIndex <= 7 && (
          <TouchableOpacity onPress={props.onPress}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: Colors.button[0],
                borderRadius: 6,
                padding: 5,
                margin: 5,
                alignSelf: 'flex-start',
              }}>
              <CustomLabel
                title={'Count'}
                labelStyle={{ color: Colors.button[0] }}
              />
              <Icon
                name={'right'}
                type={'antdesign'}
                color={Colors.button[0]}
                size={15}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const NewPresentCard = props => {
  console.log(props.modeOfCheckIn);
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
  return (
    <Card
      containerStyle={{
        minHeight: 100,
        width: '100%',
        borderRadius: 6,
        alignSelf: 'center',
        backgroundColor: 'white',
        //elevation: 4,
        shadowOpacity: 0.25,
        shadowColor: 'black',
        // shadowOffset: {
        //   width: 0,
        //   height: 4,
        // },
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
        style={
          ([styles.row],
          {
            //backgroundColor: '#0061FF99',
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
          })
        }>
        <View style={[styles.row, { width: '100%', alignItems: 'baseline' }]}>
          <View style={{ alignSelf: 'flex-start', marginTop: 12 }}>
            {props.gender === 'male' ? <Male /> : <Female />}
          </View>
          <View style={{}}>
            <View style={styles.row}>
              <CustomLabel
                //labelStyle={{color: 'white'}}
                size={16}
                title={props.name}
                margin={0}
              />
              {props.overTimeHours > 0 && (
                <CustomLabel
                  labelStyle={{ color: Colors.red }}
                  title={`( ${props.overTimeHours} hours)`}
                  margin={0}
                />
              )}
            </View>
            <CustomLabel
              //abelStyle={{color: 'white'}}
              size={12}
              family={'Poppins-Regular'}
              title={`${props.department} | ${props.designation}`}
              margin={0}
            />
          </View>
          {props.currentIndex <= 7 && (
            <View>
              <TouchableOpacity onPress={props.onPress}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 0,
                    backgroundColor: 'white',
                    borderRadius: 5,
                    padding: 5,
                    margin: 5,
                    alignSelf: 'flex-start',
                  }}>
                  <CustomLabel
                    title={'Count'}
                    labelStyle={{ color: Colors.button[0] }}
                  />
                  <Icon
                    name={'right'}
                    type={'antdesign'}
                    color={Colors.button[0]}
                    size={15}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            paddingHorizontal: 10,
          }}>
          <View style={{ width: '40%' }}>
            <View
              style={{
                flexDirection: 'row',
                //justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon
                name={'location-enter'}
                type={'material-community'}
                color={'#31BD3F'}
                size={15}
              />
              <CustomLabel
                //containerStyle={{height: 40, width: 150, overflow: 'hidden'}}
                title={props.checkInLocation}
                family="Poppins-Regular"
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                //justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon
                name={'location-exit'}
                type={'material-community'}
                color={'#F15761'}
                size={15}
              />
              <CustomLabel
                //labelStyle={{fontWeight: '100'}}
                family="Poppins-Regular"
                color={'black'}
                title={
                  props.checkInLocation
                    ? props.checkOutLocation || 'Currently checked-in'
                    : ''
                }
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              width: '40%',
              //backgroundColor: 'yellow',
              alignSelf: 'stretch',
            }}>
            <View>
              <CustomLabel
                title={moment(props.scheduledCheckInTime).format('h:mm a')}
                labelStyle={{ textAlign: 'center', opacity: 0.6 }}
              />
              <Avatar
                containerStyle={{ borderWidth: 2, borderColor: Colors.button[0] }}
                size={50}
                rounded
                source={{ uri: props.checkInImagePath || props.staffPhoto }}
              />
              <CustomLabel
                title={
                  props.actualCheckInTime
                    ? moment(props.actualCheckInTime).format('h:mm a')
                    : 'N/A'
                }
                labelStyle={{
                  textAlign: 'center',
                  color:
                    props.firstHalfStatus === 'Late' ? Colors.red : 'black',
                }}
              />
            </View>
            <View>
              <CustomLabel
                title={moment(props.scheduledCheckOutTime).format('h:mm a')}
                labelStyle={{ textAlign: 'center', opacity: 0.6 }}
              />
              <Avatar
                containerStyle={{ borderWidth: 2, borderColor: Colors.button[0] }}
                size={50}
                rounded
                source={{ uri: props.checkOutImagePath || props.staffPhoto }}
              />
              <CustomLabel
                title={
                  props.actualCheckOutTime
                    ? moment(props.actualCheckOutTime).format('h:mm a')
                    : 'N/A'
                }
                labelStyle={{
                  textAlign: 'center',
                  color:
                    props.secondHalfStatus === 'Early' ? Colors.red : 'black',
                }}
              />
            </View>
          </View>
        </View>
      </View>
      {props.modeOfCheckIn === 'Travel CheckIn' && (
        <CustomButton
          alignSelf={'flex-end'}
          marginRight={10}
          color={Colors.button[0]}
          title={'Track'}
          onPress={props.track}
        />
      )}
    </Card>
  );
};

export const PresentCard = props => {
  return (
    <View
      style={{
        width: '90%',
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
      <Wave width={'100%'} style={{ position: 'absolute', top: 0, left: 0 }} />
      <View
        style={
          {
            //flexDirection: 'row',
            //alignItems: 'center',
            //justifyContent: 'space-between',
            //backgroundColor: 'yellow',
          }
        }>
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Male />
              <CustomLabel title={props.name} margin={0} />
              {props.overTimeHours > 0 && (
                <CustomLabel
                  labelStyle={{ color: Colors.red }}
                  title={`( ${props.overTimeHours} hours)`}
                  margin={0}
                />
              )}
            </View>
            {props.currentIndex <= 7 && (
              <TouchableOpacity onPress={props.onPress}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: Colors.button[0],
                    borderRadius: 6,
                    padding: 5,
                    margin: 5,
                    alignSelf: 'flex-start',
                  }}>
                  <CustomLabel
                    title={'Count'}
                    labelStyle={{ color: Colors.button[0] }}
                  />
                  <Icon
                    name={'right'}
                    type={'antdesign'}
                    color={Colors.button[0]}
                    size={15}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Car />
            <CustomLabel
              title={props.modeOfCheckIn}
              labelStyle={{ color: Colors.overlay }}
              margin={0}
            />
            <Text> | </Text>
            <Day />
            <CustomLabel
              title={props.shiftName}
              labelStyle={{ color: Colors.overlay }}
              margin={0}
            />
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
          paddingHorizontal: 10,
        }}>
        <View style={{ width: '40%' }}>
          <View
            style={{
              flexDirection: 'row',
              //justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icon
              name={'location-enter'}
              type={'material-community'}
              color={'#31BD3F'}
            />
            <CustomLabel
              //containerStyle={{height: 40, width: 150, overflow: 'hidden'}}
              title={props.checkInLocation}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              //justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icon
              name={'location-exit'}
              type={'material-community'}
              color={'#F15761'}
            />
            <CustomLabel
              labelStyle={{ fontWeight: '100' }}
              title={
                props.checkInLocation
                  ? props.checkOutLocation || 'Currently checked-in'
                  : ''
              }
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '40%',
            //backgroundColor: 'yellow',
            alignSelf: 'stretch',
          }}>
          <View>
            <CustomLabel
              title={
                props.scheduledCheckInTime
                  ? moment(props.scheduledCheckInTime).format('h:mm a')
                  : 'N/A'
              }
              labelStyle={{ color: Colors.overlay, textAlign: 'center' }}
            />
            <Avatar
              containerStyle={{ borderWidth: 2, borderColor: Colors.button[0] }}
              size={50}
              rounded
              source={{ uri: props.staffPhoto }}
            />
            <CustomLabel
              title={
                props.actualCheckInTime !== null
                  ? props.actualCheckInTime
                  : 'N/A'
              }
              labelStyle={{
                textAlign: 'center',
                color: props.firstHalfStatus === 'Late' ? Colors.red : 'black',
              }}
            />
          </View>
          <View>
            <CustomLabel
              title={
                props.scheduledCheckOutTime
                  ? moment(props.scheduledCheckOutTime).format('h:mm a')
                  : 'N/A'
              }
              labelStyle={{ color: Colors.overlay, textAlign: 'center' }}
            />
            <Avatar
              containerStyle={{ borderWidth: 2, borderColor: Colors.button[0] }}
              size={50}
              rounded
              source={{ uri: props.staffPhoto }}
            />
            <CustomLabel
              title={
                props.actualCheckOutTime
                  ? moment(props.actualCheckOutTime).format('h:mm a')
                  : 'N/A'
              }
              labelStyle={{
                textAlign: 'center',
                color:
                  props.secondHalfStatus === 'Early' ? Colors.red : 'black',
              }}
            />
          </View>
        </View>
      </View>
      <LinearGradient colors={Colors.button} style={{ width: '100%' }}>
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
              labelStyle={{ color: Colors.white, marginLeft: 5 }}
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
              labelStyle={{ color: Colors.white, marginLeft: 5 }}
              margin={0}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};
