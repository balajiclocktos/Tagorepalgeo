import React, {useEffect, useRef} from 'react';
import {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';

const NewCamera = props => {
  const camera = useRef(null);
  const [type, setType] = useState(null);

  // const cameraPermission = await Camera.getCameraPermissionStatus();
  // console.log('cameraPermission', cameraPermission);
  // if (cameraPermission === 'not-determined') {
  //   const newCameraPermission = await Camera.requestCameraPermission();
  //   console.log('newCameraPermission', newCameraPermission);
  //   if (newCameraPermission === 'authorized') {
  //   const avaialble = Camera.getAvailableCameraDevices();
  //   console.log('availalbe', avaialble);
  const devices = useCameraDevices('wide-angle-camera');
  const device = devices.back;

  //   /}

  if (device === null) return <Text>Loading</Text>;

  return (
    <Camera
      {...props}
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={props.visible}
      photo={true}
      ref={camera}
    />
  );
};

export default NewCamera;

const styles = StyleSheet.create({});
