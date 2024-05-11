import {Image} from 'native-base';
import React from 'react';
import {useRef} from 'react';
import {useState} from 'react';
import {Alert} from 'react-native';
import {Dimensions} from 'react-native';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import CameraComp from './CameraComp';

const CustomAttachment = props => {
  const [state, setState] = useState({
    showCamera: false,
    attachment: {},
  });

  return (
    <View>
      {state.showCamera && (
        <CameraComp
          back
          top
          left
          //height={Dimensions.get('window').height}
          //width={Dimensions.get('window').width}
          position="relative"
          btnText={'Capture'}
          visible={state.showCamera}
          onClose={() => setState({...state, showCamera: false})}
          onPress={camera => {
            const myPromise = new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve(props.openCamera(camera));
              }, 300);
            });
            //props.openCamera(camera);
            myPromise.then(() => setState({...state, showCamera: false}));
          }}
        />
      )}
      <TouchableOpacity
        //onPress={this.SelectImage}
        onPress={() =>
          Alert.alert(
            'Choose one option',
            '',
            [
              {text: 'CANCEL', onPress: () => {}, style: 'cancel'},
              {
                text: 'CAMERA',
                onPress: () => {
                  setState({...state, showCamera: true});
                },
              },
              {text: 'GALLERY', onPress: props.onPress},
            ],
            {
              cancelable: true,
            },
          )
        }
        style={{
          backgroundColor: props.backgroundColor,
          borderRadius: 10,
          height: 40,
          width: '95%',
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Image
          alt={'No image'}
          square
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
            {
              color: props.placeholderTextColor,
              padding: 10,
              fontWeight: '400',
            },
          ]}>
          {props.placeholder || 'Attach document proof'}
        </Text>
      </TouchableOpacity>
      <View style={{width: '100%', flexDirection: 'row', flexWrap: 'wrap'}}>
        {props.files &&
          props.files.length > 0 &&
          props.files.map((e, i) => {
            return (
              <View
                style={{
                  backgroundColor: props.backgroundColor,
                  borderRadius: 10,
                  margin: 10,
                  minHeight: 40,
                  width: '40%',
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
                        color: props.placeholderTextColor,
                        paddingHorizontal: 10,
                        fontSize: 14,
                      },
                    ]}>
                    {e}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    console.log('delete button pressed');
                    props.onDelete(e, i);
                  }}
                  style={{width: '15%', alignItems: 'center'}}>
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
            );
          })}
      </View>
      {/* {text != 'No files attached' ? (
        <View
          style={{
            backgroundColor: props.backgroundColor,
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
                  color: props.placeholderTextColor,
                  paddingHorizontal: 10,
                  fontSize: 14,
                },
              ]}>
              {props.text}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              console.log('delete button pressed');
              props.onDelete();
            }}
            style={{width: '15%', alignItems: 'center'}}>
            <Thumbnail
              square
              style={{
                width: 12,
                height: 12,
                resizeMode: 'contain',
              }}
              source={require('../../assets/cross.png')}
            />
          </TouchableOpacity>
        </View>
      ) : null} */}
    </View>
  );
};

export default CustomAttachment;

const styles = StyleSheet.create({});
