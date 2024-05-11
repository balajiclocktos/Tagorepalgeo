import { Image } from 'native-base';
import React, { Component } from 'react';
import { Text, Alert, View, StyleSheet, TouchableOpacity } from 'react-native';
import { CustomButton } from './CustomButton';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';
import CameraComp from './CameraComp';
import ImageCropPicker from 'react-native-image-crop-picker';
import { TextInput } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { Dimensions } from 'react-native';
import CustomModal from './CustomModal';
import { Modal } from 'react-native';
import { Toolbar } from '../Face/FaceRegister';
import FullCamera from './FullCamera';
export class CustomTextArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Attachment: {},
      cameraType: RNCamera.Constants.Type.back,
    };
  }
  SelectImage = async () => {
    const { SelectedImage } = this.props;
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      // let typeIdentifier = res.type.split('/');
      //console.log(typeIdentifier[1]);
      console.log('res = ', res);

      RNFetchBlob.fs
        .readFile(res[0].uri, 'base64')
        .then(data => {
          //console.log('data =', data);
          var Attachment = {
            FileName: res[0].name,
            // 'Attachment_' + new Date().getTime() + '.' + typeIdentifier[1],
            //FileType: res.type,
            //Attachment: res.uri,
            Attachment: data,
          };

          this.setState(
            { Attachment: Attachment },
            () => SelectedImage(Attachment),
            // console.log('Attachment = ', Attachment),
          );
        })
        .catch(err => {
          console.log(err);
          console.log('User cancelled the picker');
        });
    } catch (err) {
      console.log('Unknown Error: ' + JSON.stringify(err));
    }
  };
  openCamera = async camera => {
    const { SelectedImage } = this.props;

    const options1 = { quality: 0, base64: true };
    try {
      const image1 = await camera.takePictureAsync(options1);

      // const image = await ImageCropPicker.openCamera({
      //   width: 300,
      //   height: 400,
      //   includeBase64: true,
      //   cropping: true,
      // });
      // //console.log(image);
      let fileExtension = image1.uri.slice(-3);
      console.log(fileExtension, image1.uri);
      var Attachment = {
        FileName: 'Attachment_' + new Date().getTime() + '.' + fileExtension,
        //FileType: image.mime,
        Attachment: image1.base64,
        //Attachment: image.path.replace('file:///', 'file://'),
      };

      this.setState(
        { Attachment: Attachment },
        () => {
          SelectedImage(Attachment);
          this.setState({ showCamera: false });
        },
        //console.log('Attachment = ', Attachment),
      );
    } catch (e) {
      console.log();
    }
  };
  render() {
    let {
      text,
      onChangeText,
      value,
      placeholder,
      width,
      backgroundColor,
      placeholderTextColor,
      title,
      onPress,
      onPress2,
      isAttachmentMandatory,
    } = this.props;
    return (
      <View
        style={[
          styles.item1,
          { width: width, paddingHorizontal: 10, paddingBottom: 15 },
        ]}>
        <Text style={[styles.label, { margin: 10 }]}>{title}</Text>
        <TextInput
          multiline
          // blurOnSubmit={true}
          numberOfLines={5}
          textAlignVertical="top"
          bordered
          placeholderTextColor={placeholderTextColor}
          placeholder={placeholder}
          style={[
            styles.textarea,
            {
              height: this.props.height,
              width: width,
              //backgroundColor: backgroundColor,
              borderColor: 'gray',
              borderWidth: 0.5,
              alignSelf: 'center',
            },
          ]}
          value={value}
          onChangeText={message => {
            onChangeText(message);
          }}
        />
        <View style={{ marginTop: 20 }}>
          {isAttachmentMandatory && (
            <Text style={[styles.label, { margin: 10 }]}>Attachment</Text>
          )}
          {this.state.showCamera && isAttachmentMandatory && (
            <FullCamera
              visible={this.state.showCamera}
              onDismiss={() => this.setState({ showCamera: false })}
              type={this.state.cameraType}
              onShortCapture={camera => this.openCamera(camera)}
            />
          )}
          {isAttachmentMandatory && (
            <TouchableOpacity
              //onPress={this.SelectImage}
              onPress={() =>
                Alert.alert('Choose one option', '', [
                  {
                    text: 'CAMERA',
                    onPress: () => this.setState({ showCamera: true }),
                  },
                  { text: 'GALLERY', onPress: () => this.SelectImage() },
                ])
              }
              style={{
                //backgroundColor: backgroundColor,
                borderRadius: 5,
                height: 40,
                borderColor: 'gray',
                borderWidth: 0.5,
                width: '95%',
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Image
                alt="square"
                style={{
                  width: 15,
                  height: 15,
                  resizeMode: 'contain',
                  marginLeft: 10,
                }}
                source={require('../../assets/attachment.png')}
              />
              <Text
                style={[
                  styles.label,
                  { color: placeholderTextColor, padding: 10, fontWeight: '400' },
                ]}>
                Attach document proof
              </Text>
            </TouchableOpacity>
          )}
          {text != 'No files attached' && isAttachmentMandatory ? (
            <View
              style={{
                backgroundColor: backgroundColor,
                borderRadius: 10,
                margin: 10,
                minHeight: 40,
                width: '95%',
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: '85%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: placeholderTextColor,
                      paddingHorizontal: 10,
                      fontSize: 14,
                    },
                  ]}>
                  {text}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  console.log('delete button pressed');
                  onPress2();
                }}
                style={{ width: '15%', alignItems: 'center' }}>
                <Image
                  alt="square"
                  style={{
                    width: 12,
                    height: 12,
                    resizeMode: 'contain',
                  }}
                  source={require('../../assets/cross.png')}
                />
              </TouchableOpacity>
            </View>
          ) : null}
          {!this.props.noBtn && (
            <View style={{ marginVertical: 20 }}>
              <CustomButton
                title={
                  this.props.buttonTitile ? this.props.buttonTitile : 'Apply'
                }
                width={
                  this.props.buttonWidth
                    ? this.props.buttonWidth
                    : this.props.width
                      ? this.props.width
                      : '40%'
                }
                color={
                  this.props.buttonColor
                    ? this.props.buttonColor
                    : placeholderTextColor
                }
                onPress={() => {
                  onPress();
                }}
              />
            </View>
          )}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  item1: {
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
    //elevation: 3,
    //shadowColor: 'silver',
    //shadowOffset: {width: 0, height: 0.5},
    //shadowOpacity: 0.6,
  },
  textarea: {
    alignSelf: 'center',
    padding: 10,
    //borderLeftWidth: 0,
    //borderBottomWidth: 0,
    //borderTopWidth: 0,
    //borderRightWidth: 0,
    borderRadius: 8,
    width: '100%',
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#000000',
  },
});
