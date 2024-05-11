import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ImageView from "react-native-image-viewing";

const OverlayImage = (props) => {
  return (
    <ImageView
    images={props.images}
    imageIndex={0}
    visible={props.visible}
    onRequestClose={props.close}
    />
  )
}

export default OverlayImage

const styles = StyleSheet.create({})