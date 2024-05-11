import moment from 'moment';

import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { Text, TouchableOpacity, StyleSheet, View, Image } from 'react-native';
import { Avatar, CheckBox, Icon } from 'react-native-elements';
import Timeline from 'react-native-timeline-flatlist';
import { Colors } from '../../utils/configs/Colors';
import { CustomList2 } from './CustomList2';
export class ApprovalStages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
    //this.renderEvent = this.renderEvent.bind(this);
  }

  renderDetail = rowData => {
    if (this.props?.rowData) {
      this.props.rowData(rowData);
    }
    // console.log(rowData);
    const { onPress } = this.props;
    var desc = null;
    var status = null;
    var reason = null;
    var modifications = null;
    //if (rowData.description)
    desc = (
      <View
        style={[styles.descriptionContainer, { width: '80%', paddingLeft: 10 }]}>
        <Text style={[styles.title]}>{rowData.title}</Text>
        <Text style={[styles.textDescription, { fontSize: 11 }]}>
          {rowData.description}
        </Text>
        <Text style={[styles.textDescription, { fontSize: 11 }]}>
          {rowData.department}
        </Text>
      </View>
    );
    status = (
      <View
        style={{
          alignItems: 'center',
          backgroundColor:
            rowData.status == 1
              ? 'green'
              : rowData.status == 2
                ? 'red'
                : 'orange',
          width: '50%',
          //marginLeft: 60,
          //paddingHorizontal: 10,
          justifyContent: 'center',
          alignItems: 'center',
          height: 30,
          borderRadius: 5,
        }}>
        {/*<Text style={[styles.title]}>Status</Text>*/}
        <View
          style={{
            //width: '100%',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          {rowData.status == 1 ? (
            <Icon size={16} name="check" color={'white'} type={'entypo'} />
          ) : rowData.status == 2 ? (
            <Icon size={16} name="cross" color={'white'} type={'entypo'} />
          ) : (
            <Icon size={16} name="clock" color={'white'} type={'entypo'} />
          )}
          <Text
            style={[styles.textDescription, { marginLeft: 10, color: 'white' }]}>
            {rowData.status == 1
              ? 'Approved'
              : rowData.status == 2
                ? 'Rejected'
                : 'Pending'}
          </Text>
        </View>
      </View>
    );
    reason = (
      <View style={{ justifyContent: 'center', marginTop: 10 }}>
        <Text style={[styles.title, { color: 'gray', fontSize: 12 }]}>
          {rowData.reason}
        </Text>
      </View>
    );
    if (rowData?.leaveDates?.length > 0)
      modifications = (
        <View
          style={{
            //marginVertical: 20,
            alignItems: 'center',
            width: '100%',
            //elevation: 1,
            //backgroundColor: 'yellow',
          }}>
          {rowData.leaveDates.length > 0 &&
            rowData.leaveDates.map((item, i) => {
              return (
                <View
                  key={i}
                  style={{
                    marginVertical: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    //alignItems: 'center',
                    width: '110%',
                    //elevation: 1,

                    //backgroundColor: 'yellow',
                  }}>
                  <Text style={{ alignSelf: 'center' }}>
                    {moment(item.datesSelected).format('DD.MM.YYYY')}
                  </Text>
                  <CheckBox
                    checkedColor={Colors.button[0]}
                    containerStyle={{ padding: 0 }}
                    title="M"
                    checked={item.firstHalf}
                    disabled
                  />
                  <CheckBox
                    checkedColor={Colors.button[0]}
                    containerStyle={{ padding: 0 }}
                    title="E"
                    checked={item.secondHalf}
                    disabled
                  />
                </View>
              );
            })}
        </View>
      );

    // modifications = (
    //   <View
    // style={{
    //   marginVertical: 20,
    //   alignItems: 'center',
    //   width: '100%',
    //     }}>
    //     <ScrollView nestedScrollEnabled={true}>
    //       {rowData?.leaveDates?.length ? (
    //         rowData.leaveDates.map((item, index) => {
    //           //console.log(item);
    //           return (
    //             <View
    //               key={index}
    //               style={[
    //                 styles.headerContainer,
    //                 {
    //                   width: '100%',
    //                   height: 40,
    //                   //flexDirection: 'row',
    //                   borderRadius: 15,
    //                   //justifyContent: 'space-evenly',
    //                   alignItems: 'center',
    //                   marginTop: 5,
    //                 },
    //               ]}>
    //               <View
    //                 style={[
    //                   styles.headerTitleContainer,
    //                   {
    //                     width: '24%',
    //                     height: '100%',
    //                     borderRadius: 10,
    //                   },
    //                 ]}>
    //                 <Text style={[styles.text, {color: 'black'}]}>
    //                   {/*{moment(item.DatesSelected).format('DD.MM.YYYY')}*/}
    //                   {moment(item.datesSelected).format('DD.MM.YYYY')}
    //                 </Text>
    //               </View>
    //               <CheckBox
    //                 title={
    //                   // item.fromTime !== item.toTime
    //                   //   ? moment(item.fromTime).format('h:mm a')
    //                   'Morning'
    //                 }
    //                 containerStyle={{
    //                   backgroundColor: 'transparent',
    //                 }}
    //                 checked={
    //                   // item.fromTime !== item.toTime ? true :
    //                   item.firstHalf
    //                 }
    //                 checkedColor={Colors.button[0]}
    //                 disabled
    //               />

    //               <CheckBox
    //                 title={
    //                   // item.fromTime !== item.toTime
    //                   //   ? moment(item.toTime).format('h:mm a')
    //                   'Evening'
    //                 }
    //                 containerStyle={{
    //                   backgroundColor: 'transparent',
    //                 }}
    //                 checked={
    //                   // item.fromTime !== item.toTime ? true :
    //                   item.secondHalf
    //                 }
    //                 checkedColor={Colors.button[0]}
    //                 disabled
    //               />

    //               {/*) : null}*/}
    //             </View>
    //           );
    //         })
    //       ) : (
    //         <View
    //           style={{
    //             marginTop: 35,
    //             alignItems: 'center',
    //             width: '100%',
    //           }}>
    //           <Text>No Data Found</Text>
    //         </View>
    //       )}
    //     </ScrollView>
    //   </View>
    // );

    return (
      <TouchableOpacity onPress={() => this.setState({ show: !this.state.show })}>
        <View
          style={{
            width: '100%',
            //justifyContent: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              //alignItems: 'center',
              //justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                //alignItems: 'center',
              }}>
              <Avatar
                avatarStyle={styles.avatarStyle}
                rounded
                size={'medium'}
                source={{
                  uri:
                    rowData.imageUrl ||
                    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtOqCkEk1bHWlechHBJVOMBkfxoe9vXRO9SH0aTfy8mhNfXVH0DPk0Iu7LEYGg4YlIeAE&usqp=CAU',
                }}
              />

              {desc}
            </View>
          </View>
          {reason}
          {modifications}
          {rowData.status == 1 || rowData.status == 0 || rowData.status == 2
            ? status
            : null}
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    let {
      onPress,
      horizontal,
      title,
      key,
      color,
      reverse,
      width,
      headerColor,
      Arr,
    } = this.props;
    let data = [];
    let sortedData = reverse
      ? Arr.sort((e1, e2) => e1.approverLevel <= e2.approverLevel)
      : Arr.sort((e1, e2) => e1.approverLevel >= e2.approverLevel);

    sortedData.map((item, index) => {
      //console.log('itemmm = ', item);
      data.push({
        time: 'Stage ' + item.approverLevel,
        title: item.approverName,
        description: item.designation,
        department: item.department || '',
        imageUrl: item.imagePath,
        status: item.status,
        reason: item.reason,
        leaveDates: item.leaveDates,
        icon: (
          <Image
            style={{ width: 22, height: 22, marginTop: 2 }}
            source={
              item.status === 0
                ? require('../../assets/waiting.png')
                : item.status === 1
                  ? require('../../assets/approve.png')
                  : require('../../assets/active.png')
            }
          />
        ),
      });
    });

    return (
      <View
        style={{
          width: width,
          alignSelf: 'center',
          elevation: 3,
          backgroundColor: 'white',
          shadowColor: 'silver',
          shadowOffset: { width: 0, height: 0.5 },
          shadowOpacity: 0.6,
          paddingBottom: 10,
          borderRadius: 10,
        }}>
        <View
          style={[
            styles.headerContainer,
            {
              //backgroundColor: headerColor,
              alignSelf: 'flex-start',
              alignItems: 'center',
              flexDirection: 'column',
            },
          ]}>
          <Text style={[styles.text, { color: 'black' }]}>{title}</Text>
        </View>
        {data.length ? (
          <Timeline
            options={{
              horizontal,
            }}
            data={data}
            style={{ padding: 10 }}
            // circleColor={'transparent'}
            circleColor={Colors.button[0]}
            timeStyle={{ color: Colors.button[0], fontFamily: 'Poppins-Regular' }}
            timeContainerStyle={{ minWidth: 52 }}
            innerCircle={'icon'}
            lineColor={Colors.button[0]}
            renderDetail={rowData => this.renderDetail(rowData)}
          />
        ) : (
          <Text style={{ alignSelf: 'center', marginTop: 5 }}>
            No Approver Found
          </Text>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'white',
  },
  headerContainer: {
    width: '100%',
    minHeight: 40,
    flexDirection: 'row',
    borderRadius: 10,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    marginLeft: 1,
    //marginRight: 8,
  },
  title: {
    color: Colors.button[0],
    fontWeight: 'bold',
    textTransform: 'capitalize',
    fontSize: 15,
    lineHeight: 18,
    marginBottom: 5,
    fontFamily: 'Poppins-Regular',
  },
  textDescription: {
    textTransform: 'capitalize',
    fontSize: 13,
    lineHeight: 16,
    fontFamily: 'Poppins-Regular',
  },
  avatarStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
});
