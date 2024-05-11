import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import {Row} from 'native-base';
import {RNCamera} from 'react-native-camera';
import {Icon} from 'react-native-elements';
import {Colors} from '../../utils/configs/Colors';
import {useIsFocused} from '@react-navigation/core';
import CustomLabel from './CustomLabel';
import {useEffect} from 'react';
import {PermissionsAndroid} from 'react-native';
import {Platform} from 'react-native';
import {CustomButton} from './CustomButton';

const CameraComp = props => {
  const [torch, setTorch] = useState(false);

  const isFocused = useIsFocused();
  console.log('isFocused', isFocused);

  const styles = StyleSheet.create({
    container: {
      //flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: props.position || 'absolute',
      overflow: 'hidden',
      top: props.top ? undefined : 100,
      left: !props.left ? 40 : undefined,
      //zIndex: 1,
      height: props.height || 400,
      width: props.width || 300,
      borderRadius: 19,
      borderWidth: 7,
      borderColor: Colors.mainHeader[1],
    },
    preview: {
      flex: 1,
    },
    capture: {
      flex: 0,
      width: Dimensions.get('screen').width,
      backgroundColor: '#f05760',
      padding: 15,
      paddingHorizontal: 20,
      alignSelf: 'center',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
  });
  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.preview}
        type={
          props.onBarCodeRead || props.back
            ? RNCamera.Constants.Type.back
            : RNCamera.Constants.Type.front
        }
        flashMode={
          torch
            ? RNCamera.Constants.FlashMode.torch
            : RNCamera.Constants.FlashMode.auto
        }
        onBarCodeRead={props.onBarCodeRead}
        onRecordingStart={props.onRecordingStart}
        onRecordingEnd={props.onRecordingEnd}
        captureAudio={false}
        playSoundOnRecord={true}
        onPictureTaken={props.onPictureTaken}
        onCameraReady={() => console.log('Camera is ready now!')}
        onMountError={error =>
          alert(
            'Error mounting camera:' +
              error.message +
              '. Please restart the app again.',
          )
        }
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}>
        {({camera, status}) => {
          if (status !== 'READY') return <Text>Waiting</Text>;
          return (
            <>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  alignSelf: 'center',
                }}>
                {!props.onBarCodeRead && Platform.OS === 'android' && (
                  <Icon
                    name={torch ? 'md-flash' : 'md-flash-off'}
                    color={Colors.white}
                    size={30}
                    type={'ionicon'}
                    onPress={() => setTorch(!torch)}
                    style={{margin: 100}}
                  />
                )}
                <CustomButton
                  disabled={props.pressed}
                  title={props.btnText}
                  color={Colors.button[0]}
                  width={150}
                  textStyle={{textTransform: 'uppercase'}}
                  onPress={() => props.onPress(camera)}
                />
                {/* <TouchableOpacity
                  onPress={() => props.onPress(camera)}
                  style={styles.capture}
                  disabled={props.pressed}>
                  <Text
                    style={{
                      fontSize: 17,
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: 2,
                      fontFamily: 'Poppins-Regular',
                      fontWeight: 'bold',
                    }}>
                    {' '}
                    {props.btnText}{' '}
                  </Text>
                </TouchableOpacity> */}
              </View>
            </>
          );
        }}
        {/* <CustomButton
          disabled={props.pressed}
          title={props.btnText}
          color={Colors.button[0]}
          onPress={() => props.onPress(camera)}
          
        /> */}
      </RNCamera>
    </View>
    // <Modal
    //   visible={props.visible}
    //   onRequestClose={props.onClose}
    //   onDismiss={props.onClose}
    //   style={styles.container}>
    //   {props.reduce && props.pressed && (
    //     <View
    //       style={{
    //         height: Dimensions.get('screen').height * 0.4,
    //         marginBottom: 30,
    //         alignItems: 'center',
    //         justifyContent: 'center',
    //       }}>
    //       <Image
    //         source={require('../../assets/update.jpg')}
    //         style={{
    //           width: 100,
    //           height: 100,
    //           margin: 0,
    //         }}
    //         resizeMode="contain"
    //       />
    //       <Text
    //         style={{
    //           fontSize: 20,
    //           textAlign: 'center',
    //           fontFamily: 'Poppins-SemiBold',
    //         }}>
    //         {props.question} and {props.text}
    //       </Text>
    //     </View>
    //   )}

    //   {isFocused && (
    // <RNCamera
    //   style={styles.preview}
    //   type={
    //     props.onBarCodeRead || props.back
    //       ? RNCamera.Constants.Type.back
    //       : RNCamera.Constants.Type.front
    //   }
    //   flashMode={
    //     torch
    //       ? RNCamera.Constants.FlashMode.torch
    //       : RNCamera.Constants.FlashMode.auto
    //   }
    //   onBarCodeRead={props.onBarCodeRead}
    //   onRecordingStart={props.onRecordingStart}
    //   onRecordingEnd={props.onRecordingEnd}
    //   captureAudio={false}
    //   playSoundOnRecord={true}
    //   onPictureTaken={props.onPictureTaken}
    //   onCameraReady={() => console.log('Camera is ready now!')}
    //   onMountError={error =>
    //     alert(
    //       'Error mounting camera:' +
    //         error.message +
    //         '. Please restart the app again.',
    //     )
    //   }
    //   androidCameraPermissionOptions={{
    //     title: 'Permission to use camera',
    //     message: 'We need your permission to use your camera',
    //     buttonPositive: 'Ok',
    //     buttonNegative: 'Cancel',
    //   }}>
    //   {({camera, status}) => {
    //     if (status !== 'READY') return <Text>Waiting</Text>;
    //     return (
    //       <>
    //         <View
    //           style={{
    //             flex: 1,
    //             justifyContent: 'flex-end',
    //             alignSelf: 'center',
    //           }}>
    //           {!props.onBarCodeRead && Platform.OS === 'android' && (
    //             <Icon
    //               name={torch ? 'md-flash' : 'md-flash-off'}
    //               color={Colors.white}
    //               size={30}
    //               type={'ionicon'}
    //               onPress={() => setTorch(!torch)}
    //               style={{margin: 100}}
    //             />
    //           )}
    //           <TouchableOpacity
    //             onPress={() => props.onPress(camera)}
    //             style={styles.capture}
    //             disabled={props.pressed}>
    //             <Text
    //               style={{
    //                 fontSize: 17,
    //                 color: 'white',
    //                 textTransform: 'uppercase',
    //                 letterSpacing: 2,
    //                 fontFamily: 'Poppins-Regular',
    //                 fontWeight: 'bold',
    //               }}>
    //               {' '}
    //               {props.btnText}{' '}
    //             </Text>
    //           </TouchableOpacity>
    //         </View>
    //       </>
    //     );
    //   }}
    // </RNCamera>
    //   )}
    // </Modal>
  );
};
export default CameraComp;
