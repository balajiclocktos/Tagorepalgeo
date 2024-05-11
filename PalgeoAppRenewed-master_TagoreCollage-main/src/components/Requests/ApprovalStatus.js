import {Image, StyleSheet, Text, View, Divider, FlatList} from 'react-native';
import React, { useEffect, useState } from 'react';
import config from '../../config/config';
import { AnimatedCheckBox } from '../common/AnimatedCheckBox';
import moment from 'moment';

function RenderStep({ data, _index, color, length }) {
  const statusColor = (data?.createdDate == null &&  data.isApproved == false) ? "#DAB01D" : data.isApproved == true ? '#6BC14D' : '#D64B4B';
  const statusIcon = (data?.createdDate == null &&  data.isApproved == false) ?  require('../../assets/clock_3x.png') : data.isApproved == true ? require('../../assets/mdi_tick-circle_3x.png') : require('../../assets/removecheck_3x.png');


  return (
    <View style={styles.stepView}>
      {(_index+1) != length &&
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 54,
            width: 1,
            bottom: -40,
            marginTop: 22.5,
            alignSelf: 'center',
            borderStyle: 'dotted',
            borderWidth: 1,
            borderRadius: 1,
          }}
        />
      }
      <View style={styles.stepicon}>
        <Text style={{marginRight: 7}}>Stage</Text>
        <View style={[styles.stepIconBack, {backgroundColor: statusColor}]}>
          <Text style={{color: 'white'}}>{_index+1}</Text>
          {/* <Image source={require('../../assets/map_icon.png')} /> */}
        </View>
      </View>
      <View style={styles.stepTime}>
        <View style={styles.stageTopContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              style={{width: 40, height: 40, borderRadius: 500}}
              source={data?.image == undefined ? require('../../assets/avatar.png') : data?.image}
            />
            <View style={{flexDirection: 'column', paddingLeft: 10}}>
              <Text>{data?.staff_name}</Text>
              <View style={{flexDirection: 'row'}}>
                <Text>  
                  { ((data?.desig_name)?.length > 9) ? 
                    ((data?.desig_name.substring(0,9-3)) + '...') : 
                  data?.desig_name } | </Text>
                <Text style={[styles.department, {color: color}]}>
                  { ((data?.dept_Name)?.length > 8) ? 
                      ((data?.dept_Name?.substring(0,8-3)) + '...') : 
                  data?.dept_Name }
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.btnContainer, {backgroundColor: statusColor}]}>
            <Image style={styles.statusBtnIcon} source={statusIcon} />
            <Text style={styles.statusBtnText}>{(data?.createdDate == null &&  data.isApproved == false) ? "Pending" : data?.isApproved == true ? "Approved" : "Declined"}</Text>
          </View>
        </View>
        {/* <View style={{ alignSelf: 'flex-start', marginTop: 15 }}>
          
        </View> */}
        {(data?.isApproved == true && data?.staffDetails?.length != 0) &&
          <View style={styles.itemTableContainer}>
            <View style={styles.itemTableWrapper}>
              {[1]?.map((item, index) => {
                  let tableRows = [];
                  
                  for(let i = 1; i <= data?.staffDetails[_index]?.no_of_hours; i++) {
                      tableRows.push(<View key={i} style={styles.tabHeadTexts}><Text style={styles.itemTableHeadText}>{i}</Text></View>);
                  }
                  return(
                      <View style={[styles.itemTableHead, {backgroundColor: config.MainColor}]}>
                              <View style={[styles.tabHeadTexts, {flex: 2}]}><Text style={styles.itemTableHeadText}>Date</Text></View>
                              {tableRows}
                          {/* <View style={{flex: 1}}><Text style={styles.itemTableHeadText}>Qty/Cost</Text></View>     
                          <View style={{flex: 1.5}}><Text style={styles.itemTableHeadText}>Total Amount</Text></View>     
                          <View style={{flex: 0.5}}><Text style={styles.itemTableHeadText}></Text></View>      */}
                      </View>
                  )
              })}
              {data?.staffDetails?.map((item, index) => {
                  let str = item?.hrs;
                  let strArray = str.split(",");    // Remove braces and split into array of strings
                  let intArray = strArray.map(str => parseInt(str));    // Convert each string to an integer
                  console.log('intArray ===', intArray)   // Console integer array

                  let tableRows = [];
                  for(let i = 1; i <= data?.staffDetails[_index]?.no_of_hours; i++) {
                      let checked = intArray.includes(i);
                      console.log(i, ' ===', checked);
                      if(checked) tableRows.push(<View style={styles.columnCheckbox}><Image style={[styles.statusCheckboxIcon, {tintColor: "#6BC14D"}]} source={require('../../assets/mdi_green_tick-circle_3x.png')} /></View>);
                      if(!checked) tableRows.push(<View style={styles.columnCheckbox}><Image style={[styles.statusCheckboxIcon, {tintColor: "#D64B4B"}]} source={require('../../assets/mdi_uncheck_3x.png')} /></View>); 
                  }
                  
                  return(
                      <View style={styles.itemTableRow} key={index}>
                          <View style={[styles.columnOne, {flex: 2}]}><Text style={styles.itemTableRowText}>{moment(item.dt, 'YYYY-MM-DD"T"hh:mm ZZ').format("DD-MM-YYYY")}</Text></View>
                          {tableRows}
                      </View>
                  )
              })}
              {/* {
                <FlatList
                  data={tableItems}
                  showsVerticalScrollIndicator={false}
                  // onEndReachedThreshold={0.5}
                  ListEmptyComponent={() => (
                      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: 'white', marginVertical: 30 }}>
                          <Text style={{ color: 'black' }}>
                              No Items found!
                          </Text>
                      </View>
                  )}
                  contentContainerStyle={{ flex: 1 }}
                  style={{
                      flex: 1,
                  }}
                  keyExtractor={(item) => item.srNo}
                  renderItem={({ item, index }) => (
                      <View style={styles.itemTableRow} key={'tableItems-'+index}>
                          <View style={styles.columnOne}><Text style={styles.itemTableRowText}>{item.date}</Text></View>     
                          <View style={styles.columnCheckbox}>
                            <Image style={[styles.statusCheckboxIcon, {tintColor: item?.isChecked ? "#6BC14D" : "#D64B4B" }]} source={item?.isChecked ? require('../../assets/mdi_green_tick-circle_3x.png') : require('../../assets/mdi_uncheck_3x.png') } />
                            <Text style={{fontSize: 12}}> Morning</Text>
                          </View>
                          <View style={styles.columnCheckbox}>
                          <Image style={[styles.statusCheckboxIcon, {tintColor: item?.isChecked2 ? "#6BC14D" : "#D64B4B" }]} source={item?.isChecked2 ? require('../../assets/mdi_green_tick-circle_3x.png') : require('../../assets/mdi_uncheck_3x.png') } />
                            <Text style={{fontSize: 12}}> Evening</Text>
                          </View>     
                      </View>
                  )}
                />
              }
               */}
            </View>
          </View>
        }
        {(data?.createdDate != null && data?.isApproved != false) &&
          <View style={styles.remarkContainer}>
            <Text style={[styles.remarkTitle, { color: color }]}>Remark:</Text>
            <Text>{data?.remark}</Text>
          </View>
        }
      </View>
      {/* <View style={[styles.step3]}>
        <Text style={styles.step3T1}>Surat</Text>
        <Text style={styles.step3T2}> Description Text</Text>
      </View>
      <View style={{width: '35%'}}>
        {data.approved ? (
          <Text style={[styles.step4Txt,{color:'green'}]}>Reached</Text>
        ) : (
          <Text style={styles.step4Txt}>Will reach on your location in 20 mins </Text>
        )}
        // {reached && <Text style={styles.step4Txt}>Will reach on your location in {durationToReach} mins {reachedStatus ? "Reached" : "will reach"}</Text>}
      </View> */}
    </View>
  );
}

const ApprovalStatus = ({props, color, data}) => {
  const [shortedData, setShortedData] = useState();

  function sortApproversData() {
    let data2 = data?.sort((a, b) => (a.priority < b.priority) ? 1 : -1);

    setShortedData(data2);
  }

  useEffect(() => {
    sortApproversData();
  }, [data])

  return (
    <View style={{flex: 1}}>
      {/* {data.stage != 3 &&
       
      // <View style={[styles.stepicon, {position: 'absolute', marginLeft: 1, flex: 1}]}>
       
      // </View>
      } */}
    
      {shortedData?.map((item, index) => {
        return (
          <RenderStep
            key={'RenderStep-'+index}
            data={item}
            color={color}
            length={data.length}
            _index={index}
            // time={item.pickup_time}
            // stopName={item.pointName}
            // description={item.stage_Name}
            // reached={true}
            // durationToReach={item.durationToReach}
            // reachedStatus={item.reachedStatus}
          />
        );
      })}
    </View>
  );
};

export default ApprovalStatus;

const styles = StyleSheet.create({
  stepView: {
    flexDirection: 'row',
    margin: 15,
    justifyContent: 'space-between',
    flex: 1,
    position: 'relative'
  },
  stepicon: {
    width: '23%',
    flexDirection: 'row',
    paddingRight: 10
  },
  stepIconBack: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#12B6C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTime: {
    width: '77%',
    color: '#120E66',
    fontSize: 10,
    fontWeight: '400',
    fontFamily: 'Roboto',
    // marginTop: 5,
  },
  stageTopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // backgroundColor: 'black'
  },
  statusBtnIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  statusBtnText: {
    color: 'white',
    paddingLeft: 6
  },
  btnContainer: { 
    flexDirection: 'row',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 7,
    height: 30,
    backgroundColor: '#D64B4B',
  },
  department: {
    color: config.PrimaryColor
  },
  remarkContainer: {
    borderColor: '#D9DaE5',
    borderWidth: 1,
    padding: 7,
    borderRadius: 5,
    flexDirection: 'row',
    marginTop: 10
  },
  remarkTitle: {
    fontWeight: '600',
    color: config.MainColor,
    paddingRight: 5
  },

  // Table Css
  itemTableContainer: {
    marginTop: 15,
    backgroundColor: 'white',
    elevation: 2,
    // margin: 5,
    borderRadius: 10,
    flexDirection: 'row', 
    flexWrap: 'wrap',
    marginVertical: 10
  },
  itemTableWrapper: {
    flexDirection: 'column', 
    flex: 1
  },
  itemTableHead: {
    alignItems: 'center', 
    paddingVertical: 10,
    paddingHorizontal: 6, 
    borderTopLeftRadius: 10, 
    borderTopRightRadius: 10, 
    flexDirection: 'row', 
    flex: 1, 
    backgroundColor: config.MainColor,
  },
  itemTableHeadText: {
    color: 'white'
  },
  itemTableRow: {
    alignItems: 'center', 
    paddingVertical: 9, 
    marginHorizontal: 6, 
    borderTopLeftRadius: 10, 
    borderTopRightRadius: 10, 
    flexDirection: 'row', 
    flex: 1,
  },
  itemTableRowText: {
    color: 'black', 
    fontSize: 12,
  },
  tabHeadTexts: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  checkboxIcon: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: config.MainColor,
    marginRight: -12
  },
  columnOne: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  columnCheckbox: {
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxText: {
    color: "black",
    textDecorationLine: "none",
    fontSize: 12
  },
  statusCheckboxIcon: {
    width: 15,
    height: 15,
  }
});
