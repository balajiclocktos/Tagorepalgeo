import React, {useRef} from 'react';
import {Modal} from 'react-native';
import {StyleSheet, Text, View} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {Toolbar} from '../Face/FaceRegister';

const FullCamera = props => {
  const ref = useRef(null);
  return (
    <Modal
      visible={props.visible}
      onDismiss={props.onDismiss}
      onRequestClose={props.onDismiss}>
      <RNCamera
        type={props.type}
        flashMode={props.flashMode}
        style={{width: '100%', height: '100%'}}
        ref={ref}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
      />
      <Toolbar
        noUploadButton
        noFlash
        onShortCapture={() => props.onShortCapture(ref.current)}
      />
    </Modal>
  );
};

export default FullCamera;

const styles = StyleSheet.create({});
