import React, {Component} from 'react';
import {
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  View,
  Text,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Container, VStack, Icon} from 'native-base';
import SubHeader from './common/SubHeader';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import Loader from './common/Loader';
import RNFetchBlob from 'rn-fetch-blob';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FileViewer from 'react-native-file-viewer';
class ImageView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      imageLoader: true,
    };
  }
  getExtention = filename => {
    return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
  };
  checkPermission = async () => {
    var file = this.props.route.params.url;
    if (Platform.OS === 'ios') {
      this.downloadImage(file);
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to download Photos',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage Permission Granted.');
          this.downloadImage(file);
        } else {
          alert('Storage Permission Not Granted');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };
  downloadImage = file => {
    this.setState({loader: true});
    let date = new Date();
    let image_URL = file;
    let ext = this.getExtention(image_URL);
    ext = '.' + ext[0];
    const {config, fs} = RNFetchBlob;
    //let PictureDir = fs.dirs.PictureDir;
    let RootDir =
      Platform.OS === 'android' ? fs.dirs.DownloadDir : fs.dirs.DocumentDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        path:
          RootDir +
          '/file_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          file_ext,
        description: 'downloading file...',
        notification: true,
        // useDownloadManager works with Android only
        useDownloadManager: true,
      },
    };
    config(options)
      .fetch('GET', image_URL)
      .then(res => {
        this.setState({loader: false}, () => {
          // alert('File Downloaded Successfully.');
          FileViewer.open(res.path())
            .then(() => console.log('success'))
            .catch(err => alert('Error occured opening the file'));
        });
      });
  };
  render() {
    if (this.state.loader) {
      return <Loader />;
    }
    return (
      <>
        <SubHeader
          title="Image View"
          showBack={true}
          backScreen="CircularList"
          showPlus={false}
          navigation={this.props.navigation}
        />
        <VStack
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {this.props.route.params.url != undefined &&
          (this.getExtention(this.props.route.params.url) === 'png' ||
            this.getExtention(this.props.route.params.url) === 'jpeg') ? (
            <Image
              source={{uri: this.props.route.params.url}}
              style={{width: 350, height: 300}}
              onLoadEnd={() => {
                this.setState({imageLoader: false});
              }}
              resizeMode="stretch"
            />
          ) : (
            <View style={{marginTop: '9%'}}>
              <Text style={styles.previewText}>Preview not available</Text>
            </View>
          )}
          {this.state.imageLoader &&
            this.props.route.params.url != undefined && (
              <ActivityIndicator color="#f05760" />
            )}
          {this.props.route.params.url != undefined ? (
            <TouchableWithoutFeedback onPress={this.checkPermission}>
              <View style={styles.buttonContainer}>
                <Text style={styles.footerText}>View Attachment</Text>
              </View>
            </TouchableWithoutFeedback>
          ) : null}
        </VStack>
      </>
    );
  }
}

export default ImageView;

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#ffffff',
  },
  loginImage: {
    width: 200,
    height: 200,
  },
  buttonContainer: {
    width: wp('80'),
    backgroundColor: '#f05760',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 30,
    marginTop: '8%',
  },
  previewText: {
    fontFamily: 'Poppins-Regular',
  },
});
