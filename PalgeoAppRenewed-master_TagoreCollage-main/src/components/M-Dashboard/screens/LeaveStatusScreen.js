import {Select} from 'native-base';
import React from 'react';
import {FlatList} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';
import {Icon} from 'react-native-elements/dist/icons/Icon';
import {
  heightPercentageToDP,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Colors} from '../../../utils/configs/Colors';
import CustomLabel from '../../common/CustomLabel';
import LeaveChart from '../../common/LeaveChart';

const LeaveStatusScreen = props => {
  return (
    <View>
      {props.leaveData.length > 0 && (
        <View>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginTop: '2%',
              marginLeft: '3%',
              marginRight: '2%',
            }}>
            {props.yearsArray?.length > 0 && (
              <View style={{width: wp('43')}}>
                <CustomLabel title={'From'} />

                <View style={[styles.dateContainer, {flexDirection: 'row'}]}>
                  <Select
                    width={'120'}
                    dropdownIcon={<View />}
                    selectedValue={props.selectedValue}
                    onValueChange={props.onValueChange}>
                    {props.yearsArray.map((e, i) => (
                      <Select.Item label={e} value={i} key={i} />
                    ))}
                  </Select>
                  <Icon
                    name={'calendar'}
                    color={Colors.button[0]}
                    type={'ant-design'}
                  />
                </View>
              </View>
            )}

            {props.yearsArray?.length > 0 && (
              <View style={{width: wp('43'), marginLeft: wp('1')}}>
                <CustomLabel title={'To'} />

                <View style={[styles.dateContainer, {flexDirection: 'row'}]}>
                  <Select
                    width={'120'}
                    dropdownIcon={<View />}
                    selectedValue={props.selectedValue1}
                    onValueChange={props.onValueChange1}>
                    {props.yearsArray.map((e, i) => (
                      <Select.Item label={e} value={i} key={i} />
                    ))}
                  </Select>
                  <Icon
                    name={'calendar'}
                    color={Colors.button[0]}
                    type={'ant-design'}
                  />
                </View>
              </View>
            )}
          </View>
          {props.masterLeaves?.length > 0 && (
            <View
              style={{
                borderBottomColor: '#AAAAAA',
                borderBottomWidth: 1,
                padding: 10,
                marginTop: 10,
              }}>
              <FlatList
                horizontal
                data={props.masterLeaves}
                showsHorizontalScrollIndicator={false}
                renderItem={props.renderItemHorizontal}
                extraData={props.extraData}
                keyExtractor={props.keyExtractorHorizontal}
                //ListFooterComponent={<View style={{width: 105}}></View>}
              />
            </View>
          )}
          {props.masterLeaves?.length > 0 && (
            <View
              style={{
                alignSelf: 'center',
                //marginBottom: 120,
                marginTop: 20,
              }}>
              <LeaveChart
                selectedValue={props.selectedLeaveValue}
                options={props.masterLeaves}
                onValueChange={props.onValueChangeLeave}
                type="leave"
                totalLeaves={props.totalLeaves}
                notAvailed={props.notAvailed}
                fullyAvailed={props.fullyAvailed}
                partiallyAvailed={props.partiallyAvailed}
              />
            </View>
          )}
          {/* <View
                  style={{
                    width: '100%',
                    // height: 70,
                    justifyContent: 'center',
                  }}>
                  <CustomTabs
                    borderRadius={0}
                    height={40}
                    width={'100%'}
                    textSize={14}
                    color={Colors.calendarBg}
                    textColor={'black'}
                    backgroundColor={'transparent'}
                    ActiveTab={activeTab2}
                    type="bottom"
                    //tab1Width={'25%'}
                    //tab2Width={'25%'}
                    //tab3Width={'25%'}
                    //tab4Width={'25%'}
                    //tab5Width={'25%'}
                    tab1="All"
                    tab2="Staff Type"
                    tab3="Department"
                    tab4="Gender"
                    onPress={value => {
                      if (value === 'Staff Type') {
                        this.setState(
                          {
                            staffTypeTab: true,
                          },
                          () =>
                            this.getLeaveDetails(
                              null,
                              this.state.masterLeaves[
                                this.state.staffCurrentIndex
                              ].id,
                            ),
                        );
                      }
                      if (value === 'Department') {
                        this.setState(
                          {
                            depTab: true,
                          },
                          () =>
                            this.getLeaveDetails(
                              null,
                              this.state.masterLeaves[
                                this.state.staffCurrentIndex
                              ].id,
                            ),
                        );
                      }
                      this.setState({activeTab2: value});
                    }}
                  />
                </View> */}

          {props.leaveData?.length > 0 && (
            <View style={{}}>
              <FlatList
                data={props.leaveData}
                renderItem={props.renderItem}
                extraData={props.extraData1}
                keyExtractor={props.keyExtractor}

                //ListFooterComponent={<View style={{width: 105}}></View>}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default LeaveStatusScreen;

const styles = StyleSheet.create({
  dateContainer: {
    borderWidth: 0.5,
    borderColor: 'gray',
    height: heightPercentageToDP('5.5'),
    paddingRight: 15,
    borderRadius: 5,
    alignItems: 'center',
    //backgroundColor: '#ffffff',
  },
});
