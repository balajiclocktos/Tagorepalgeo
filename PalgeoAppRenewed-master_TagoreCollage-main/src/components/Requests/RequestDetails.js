import moment from 'moment';
import { Card, Container, VStack } from 'native-base';
import React from 'react';
import { useState } from 'react';
import { Image, Pressable, ScrollView } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { CheckBox, Icon } from 'react-native-elements';
import { tokenApi } from '../../utils/apis';
import { Colors } from '../../utils/configs/Colors';
import { isIOS } from '../../utils/configs/Constants';
import { AnimatedLoader, CustomButton, SuccessError } from '../common';
import { ApprovalStages } from '../common/ApprovalStages';
import CustomLabel from '../common/CustomLabel';
import { CustomList2 } from '../common/CustomList2';
import CustomModalTextArea from '../common/CustomModalTextArea';
import SubHeader from '../common/DrawerHeader';
import OverlayImage from '../common/OverlayImage';
const RequestDetails = ({ navigation, route }) => {
  const { item, path } = route?.params;
   console.log('item', Boolean(item.leaveAttachment));
  const { requestDetails } = item;
  const { leaveCategory } = item;
  //  console.log('leaveCategory', leaveCategory);
  const { approvalDetails } = item;
  const lastVersion =
    (requestDetails?.length > 0 &&
      requestDetails.find(e => e.version === requestDetails.length)) ||
    {};
  const firstVersion =
    (requestDetails?.length > 0 &&
      requestDetails.find(e => e.version === 1 || e.version === 0)) ||
    {};
  const originalDetails = firstVersion?.leaveDetails || [];
  const details = lastVersion?.leaveDetails || [];
  const modified = originalDetails.length
    ? details.map(e => {
      return {
        ...e,
        checked: false,
      };
    })
    : [];
  const [cancelledArray, setCancelledArray] = useState(modified);
  const [error, setError] = useState(false);
  const [alertt, setAlert] = useState(false);
  const [loader, setLoader] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ApproverCount, setApproverCount] = useState(false);
  const [requestedImageUrl, SetrequestedImageUrl] = useState(Boolean(item?.leaveAttachment))
  const [msg, setMsg] = useState('');
  const deleteRequest = async () => {
    // console.log({item, index});
    const { leaveRequestId } = item;
    const dates = cancelledArray
      .filter(e => e.checked)
      .map(f => {
        return `${f.leaveAppliedDate}Z`;
      });
    const url = path == 'approved' ? 'api/Leave/CancelLeaveRequestByApprover' : 'api/Leave/CancelLeaveRequest';

    const body = {
      leaveRequestId,
      dates,
    };
    console.log("body = ", body);
    console.log("url = ", url);
    // return;
    try {
      setLoader(true);
      const res = await tokenApi();
      const response = await res.post(url, body);
      const { data } = response;
      setLoader(false);
      if (data.status) {
        return displayMsg(data.message, false);
      }
      console.log("data.message = ", data.message);
      displayMsg(data.message, true);
    } catch (error) {
      setLoader(false);
      displayMsg(error.message, true);
      console.log("errorrrr = ", error);
    }
  };

  const displayMsg = (msg, error) => {
    setError(error);
    setMsg(msg);
    setAlert(true);
    if (isIOS) {
      alert(msg);
      setAlert(false);
    }
  };

  let approvedDetails = [];
  if (path == 'approved') {
    approvedDetails = approvalDetails.map((item2, index2) => {
      return {
        approverLevel: item2.level,
        designation: item2.approverDesignation || '',
        approverName: item2.approverName,
        imagePath: item2.image,
        reason: item2.comments,
        status: item2.status,
      };
    });
  } else {
    approvedDetails = approvalDetails.map((item2, index2) => {
      return {
        approverLevel: item2.approverLevel,
        designation: item2.approverDesignation,
        approverName: item2.approverStaffName,
        imagePath: item2.approverImage,
        reason: item2.approverComment,
        status: item2.leaveApprovalStatus,
      };
    });
  }
  //console.log('approvedDetails', approvedDetails);
  return (
    <View style={styles.container}>
      <SubHeader
        title={
          (item.status === 0
            ? ''
            : item.status === 1
              ? 'Approved'
              : 'Rejected') + ' Request Details'
        }
        showBack={true}
        backScreen="Leaves"
        showBell={false}
        navigation={navigation}
      />
      <SuccessError
        error={error}
        subTitle={msg}
        isVisible={alertt}
        deleteIconPress={() => {
          setAlert(false);
          if (!error) {
            navigation.goBack();
          }
        }}
      />
      <OverlayImage
        images={[{uri:item?.leaveAttachment}]}
        visible={visible}
        close={() => setVisible(false)}
      />
      <AnimatedLoader isVisible={loader} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} nestedScrollEnabled>
        <VStack>
          {leaveCategory === 8 && item.status !== 0 && (
            <View style={{ padding: 10 }}>
              <CustomLabel title="Complaint" />
              <CustomModalTextArea value={item.reason} disabled />
              <CustomLabel title="Summary" />
              <CustomModalTextArea value={item.complaintSummary} disabled />
            </View>
          )}
          {leaveCategory === 7 && item.status !== 0 && (
            <View style={{ padding: 10 }}>
              <CustomLabel title="Missed Punch Details" />
              {originalDetails?.length > 0 &&
                originalDetails.map(e => {
                  return (
                    <>
                      <Card style={{ padding: 10 }}>
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <CustomLabel
                            containerStyle={{ width: '60%' }}
                            title={'Missed Punch Date'}
                            labelStyle={{ color: Colors.button[0] }}
                          />
                          <CustomLabel
                            title={moment(e.leaveAppliedDate).format(
                              'DD.MM.YYYY',
                            )}
                          />
                        </View>
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <CustomLabel
                            containerStyle={{ width: '60%' }}
                            title={'Scheduled Punch Time'}
                            labelStyle={{ color: Colors.button[0] }}
                          />
                          <CustomLabel
                            title={moment(e.scheduledMissedPunchTime).format(
                              'h:mm a',
                            )}
                          />
                        </View>
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <CustomLabel
                            containerStyle={{ width: '60%' }}
                            title={'Actual Punch Time'}
                            labelStyle={{ color: Colors.button[0] }}
                          />
                          <CustomLabel
                            title={moment(e.actualMissedPunchTime).format(
                              'h:mm a',
                            )}
                          />
                        </View>
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                          <CustomLabel
                            containerStyle={{ width: '60%' }}
                            title={'Type'}
                            labelStyle={{ color: Colors.button[0] }}
                          />
                          <CustomLabel
                            title={
                              e.missedPunchIsCheckIn ? 'Check In' : 'Check Out'
                            }
                          />
                        </View>
                      </Card>
                    </>
                  );
                })}
            </View>
          )}
          {leaveCategory !== 8 && leaveCategory !== 7 && leaveCategory !==10 && (
            <View>
              <CustomLabel
                title={'Applied Dates' + '(' + item.leaveTypeName + ')'}
                containerStyle={{ padding: 10, margin: 10 }}
              />
              <CustomList2
                // maxHeight="100%"
                width="95%"
                title1="Date"
                title2={
                  leaveCategory === 3 || leaveCategory === 4 || leaveCategory === 5
                    ? 'Session 1'
                    : 'From'
                }
                title3={
                  leaveCategory === 3 || leaveCategory === 4 || leaveCategory === 5
                    ? 'Session 2'
                    : 'To'
                }
                title4={
                  // ApproverCount == true ?
                  //   "" :
                  path == "requested" ?
                    (leaveCategory === 3 || leaveCategory === 4 || leaveCategory === 5) &&
                    ApproverCount == false &&
                    'Cancel' :
                    (leaveCategory === 3 || leaveCategory === 4 || leaveCategory === 5) && "Cancel"
                }
                color={Colors.secondary}
                headerColor={Colors.button[0]}>
                <ScrollView nestedScrollEnabled>
                  {originalDetails?.length > 0 &&
                    originalDetails.map((e, i) => {
                      // console.log("item = ",e);
                      return (
                        <View
                          key={i}
                          style={[
                            styles.headerContainer,
                            {
                              marginBottom: 10,
                            },
                          ]}>
                          <View style={[styles.headerTitleContainer, {}]}>
                            <Text style={[styles.text, { color: 'black' }]}>
                              {/*{moment(item.DatesSelected).format('DD.MM.YYYY')}*/}
                              {moment(e.leaveAppliedDate).format('DD.MM.YYYY')}
                            </Text>
                          </View>
                          <CheckBox
                            title={
                              leaveCategory === 5
                                ? moment
                                  .utc(e.fromTime)
                                  .local()
                                  .format('h:mm a')
                                : 'Morning'
                            }
                            containerStyle={{
                              backgroundColor: 'transparent',
                              minHeight: 50,
                              borderColor: 'transparent',
                            }}
                            checked={leaveCategory === 5 ? true : e.firstHalf}
                            checkedIcon={
                              <Icon
                                name={
                                  leaveCategory === 5
                                    ? 'clockcircleo'
                                    : 'check-square-o'
                                }
                                type={
                                  leaveCategory === 5
                                    ? 'antdesign'
                                    : 'font-awesome'
                                }
                                color={Colors.button[0]}
                              />
                            }
                            uncheckedIcon={
                              <Icon
                                name="squared-cross"
                                color={Colors.button[0]}
                                type={'entypo'}
                              />
                            }
                            checkedColor={Colors.button[0]}
                            disabled
                          />

                          <CheckBox
                            title={
                              leaveCategory === 5
                                ? moment.utc(e.toTime).local().format('h:mm a')
                                : 'Evening'
                            }
                            containerStyle={{
                              backgroundColor: 'transparent',
                              minHeight: 50,
                              borderColor: 'transparent',
                            }}
                            checked={leaveCategory === 5 ? true : e.secondHalf}
                            checkedColor={Colors.button[0]}
                            checkedIcon={
                              <Icon
                                name={
                                  leaveCategory === 5
                                    ? 'clockcircleo'
                                    : 'check-square-o'
                                }
                                type={
                                  leaveCategory === 5
                                    ? 'antdesign'
                                    : 'font-awesome'
                                }
                                color={Colors.button[0]}
                              />
                            }
                            disabled
                            uncheckedIcon={
                              <Icon
                                name="squared-cross"
                                color={Colors.button[0]}
                                type={'entypo'}
                              />
                            }
                          />
                          {path == "requested" ?
                            (leaveCategory === 3 || leaveCategory === 4 || leaveCategory === 5) &&
                            ApproverCount == false &&
                            <CheckBox
                              // title={'Cancel'}
                              containerStyle={{
                                backgroundColor: 'transparent',
                                minHeight: 50,
                                borderColor: 'transparent',
                              }}
                              checked={cancelledArray[i].checked}
                              onPress={() => {
                                cancelledArray[i].checked =
                                  !cancelledArray[i].checked;
                                setCancelledArray([...cancelledArray]);
                                //console.log('cancelledArr', cancelledArray);
                              }}
                              checkedColor={Colors.button[0]}
                              uncheckedColor={Colors.red}
                              checkedIcon={
                                <Icon
                                  name={'check-square-o'}
                                  type={'font-awesome'}
                                  color={Colors.button[0]}
                                />
                              }
                            />
                            :
                            (leaveCategory === 3 || leaveCategory === 4 || leaveCategory === 5) &&
                            <CheckBox
                              // title={'Cancel'}
                              containerStyle={{
                                backgroundColor: 'transparent',
                                minHeight: 50,
                                borderColor: 'transparent',
                              }}
                              checked={cancelledArray[i].checked}
                              onPress={() => {
                                cancelledArray[i].checked =
                                  !cancelledArray[i].checked;
                                setCancelledArray([...cancelledArray]);
                                //console.log('cancelledArr', cancelledArray);
                              }}
                              checkedColor={Colors.button[0]}
                              uncheckedColor={Colors.red}
                              checkedIcon={
                                <Icon
                                  name={'check-square-o'}
                                  type={'font-awesome'}
                                  color={Colors.button[0]}
                                />
                              }
                            />
                            // )
                          }
                        </View>
                      );
                    })}
                </ScrollView>
              </CustomList2>
              {requestedImageUrl && <Pressable onPress={() => setVisible(true)} style={{ width: "95%", backgroundColor: "#CCDDFF", alignSelf: "center", top: 5, borderRadius: 5, padding: 5 }}>
                <Image source={{ uri: item?.leaveAttachment }} style={{ height: 100, width: 100, resizeMode: "contain" }}></Image>
              </Pressable>}
              
              {item.status !== 0 && (
                <View>
                  <CustomLabel
                    title={'Approved Dates'}
                    containerStyle={{ padding: 10, margin: 10 }}
                  />
                  <CustomList2
                    // maxHeight="100%"
                    width="95%"
                    title1="Date"
                    title2={
                      leaveCategory === 3 || leaveCategory === 4 || leaveCategory === 5
                        ? 'Session 1'
                        : 'From'
                    }
                    title3={
                      leaveCategory === 3 || leaveCategory === 4 || leaveCategory === 5
                        ? 'Session 2'
                        : 'To'
                    }
                    color={Colors.secondary}
                    headerColor={Colors.button[0]}>
                    <ScrollView nestedScrollEnabled>
                      {details?.length > 0 &&
                        details.map((e, i) => {
                          return (
                            <View
                              key={i}
                              style={[
                                styles.headerContainer,
                                {
                                  marginBottom: 10,
                                },
                              ]}>
                              <View style={[styles.headerTitleContainer, {}]}>
                                <Text style={[styles.text, { color: 'black' }]}>
                                  {/*{moment(item.DatesSelected).format('DD.MM.YYYY')}*/}
                                  {moment(e.leaveAppliedDate).format(
                                    'DD.MM.YYYY',
                                  )}
                                </Text>
                              </View>

                              {item.status !== 0 && (
                                <CheckBox
                                  title={
                                    leaveCategory === 5
                                      ? moment
                                        .utc(e.fromTime)
                                        .local()
                                        .format('h:mm a')
                                      : 'Morning'
                                  }
                                  containerStyle={{
                                    backgroundColor: 'transparent',
                                    minHeight: 50,
                                    borderColor: 'transparent',
                                  }}
                                  checked={
                                    leaveCategory === 5 ? true : e.firstHalf
                                  }
                                  checkedColor={Colors.button[0]}
                                  checkedIcon={
                                    <Icon
                                      name={
                                        leaveCategory === 5
                                          ? 'clockcircleo'
                                          : 'check-square-o'
                                      }
                                      type={
                                        leaveCategory === 5
                                          ? 'antdesign'
                                          : 'font-awesome'
                                      }
                                      color={Colors.button[0]}
                                    />
                                  }
                                  uncheckedIcon={
                                    <Icon
                                      name="squared-cross"
                                      color={Colors.button[0]}
                                      type={'entypo'}
                                    />
                                  }
                                  disabled
                                />
                              )}

                              {item.status !== 0 && (
                                <CheckBox
                                  title={
                                    leaveCategory === 5
                                      ? moment
                                        .utc(e.toTime)
                                        .local()
                                        .format('h:mm a')
                                      : 'Evening'
                                  }
                                  containerStyle={{
                                    backgroundColor: 'transparent',
                                    minHeight: 50,
                                    borderColor: 'transparent',
                                  }}
                                  checked={
                                    leaveCategory === 5 ? true : e.secondHalf
                                  }
                                  checkedColor={Colors.button[0]}
                                  checkedIcon={
                                    <Icon
                                      name={
                                        leaveCategory === 5
                                          ? 'clockcircleo'
                                          : 'check-square-o'
                                      }
                                      type={
                                        leaveCategory === 5
                                          ? 'antdesign'
                                          : 'font-awesome'
                                      }
                                      color={Colors.button[0]}
                                    />
                                  }
                                  uncheckedIcon={
                                    <Icon
                                      name="squared-cross"
                                      color={Colors.button[0]}
                                      type={'entypo'}
                                    />
                                  }
                                  disabled
                                />
                              )}
                            </View>
                          );
                        })}
                    </ScrollView>
                  </CustomList2>
                </View>
              )}
              <View style={{ margin: 10 }}>
                {(leaveCategory === 3 || leaveCategory === 4 || leaveCategory === 5) &&
                  cancelledArray.filter(e => e.checked).length > 0 && (
                    <CustomButton
                      title="Cancel"
                      color={Colors.button[0]}
                      radius={10}
                      onPress={deleteRequest}
                    />
                  )
                }
              </View>
            </View>
          )}
          {approvalDetails?.length > 0 ? (
            <ApprovalStages
              width="95%"
              key={1}
              title="Approval Stages"
              color={Colors.secondary}
              headerColor={Colors.button[0]}
              Arr={approvedDetails}
              rowData={(e) => {
                console.log(e.status);
                if (e.status == 1) {
                  setApproverCount(true)
                }
                console.log("ApproverCount = ", ApproverCount);
              }}
            />
          ) : (
            <View>
              <Text style={{ alignSelf: 'center', marginTop: 10 }}>
                No Data Found
              </Text>
            </View>
          )}
        </VStack>
      </ScrollView>
    </View>
  );
};

export default RequestDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  headerContainer: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    borderRadius: 15,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  headerTitleContainer: {
    width: '24%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
});
