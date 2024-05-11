import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  
} from 'react-native';
import { CheckBox, Icon, Overlay } from 'react-native-elements';

//import ImageView from 'react-native-image-viewing';
import { Card, VStack, Image as Thumbnail } from 'native-base';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import Const from '../common/Constants';
import moment from 'moment';
import { CustomButton } from '../common/CustomButton';
import CustomModalTextArea from '../common/CustomModalTextArea';
import CustomLabel from '../common/CustomLabel';
import { CustomList2 } from '../common/CustomList2';
import { Colors } from '../../utils/configs/Colors';
import { ApprovalStages } from '../common/ApprovalStages';
import SubHeader from '../common/DrawerHeader';
//import Timeline from 'react-native-timeline-flatlist';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native';
import CustomCard from '../common/CustomCard';
import AnimatedLoader from '../common/AnimatedLoader';
import Error from '../popups/error';
import { tokenApi } from '../../utils/apis';
import SuccessError from '../common/SuccessError';
import { isIOS } from '../../utils/configs/Constants';
import Pdf from 'react-native-pdf';
import { Alert } from 'react-native';
import FileViewer from "react-native-file-viewer"
import RNFS from "react-native-fs";
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];
const source = { uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf', cache: true };
const url =
  "https://github.com/vinzscam/react-native-file-viewer/raw/master/docs/react-native-file-viewer-certificate.pdf";

export default class DocumentViewr extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileURL : {uri: this.props.route?.params?.uri, cache: true},
      // url_extension :  url_extension
    };

    
    // this.state = {react-native-file-viewer
    //   LeaveDates: [],
    //   LeaveDatesOriginal: [],
    //   approverArr: [],
    //   Visible: false,
    //   //request: this.props.route?.params?.request,
    //   LeaveItemData: this.props.route?.params?.LeaveItemData,
    //   user_id: this.props.route?.params?.user_id || '',
    //   institute_id: this.props.route?.params?.institute_id || '',
    //   Comment: '',
    //   leaveAnalysis: [],
    //   approved:
    //     this.props?.route?.params?.LeaveItemData.status === 1 ? true : false,
    //   rejected:
    //     this.props?.route?.params?.LeaveItemData.status === 2 ? true : false,
    // };
    // console.log('props = ', JSON.stringify(this.props?.route?.params?.LeaveItemData));
  }
  componentDidMount() {
    console.log("URL"+this.state.fileURL)
    const extension = this.getUrlExtension(this.state.fileURL.uri);
    const localFile = `${RNFS.DocumentDirectoryPath}/temporaryfile.${extension}`;
    const options = {
      fromUrl:  this.state.fileURL.uri,
      toFile: localFile,
    };

  RNFS.downloadFile(options)
  .promise.then(() => FileViewer.open(localFile))
  .then(() => {
    // success
    console.log("Success");
  })
  .catch((error) => {
    // error
    console.log("Error")
  });


    // Alert.alert("AAAAAAAAAAa");
  }

  getUrlExtension(url) {
    // Alert.alert(url.split(/[#?]/)[0].split(".").pop().trim());
    return url.split(/[#?]/)[0].split(".").pop().trim();
  }

  

  render() {

    return (
      <View style={styles.container}>
          <SubHeader
          title="Leave documents"
          showBack={true}
          backScreen="Leaves"
          showBell={false}
          navigation={this.props.navigation}
        />
      
       <Pdf
          trustAllCerts={false}
                    source={this.state.fileURL}
                    onLoadComplete={(numberOfPages,filePath) => {
                      // c)
                        // console.log`);
                        // Number of pages: ${numberOfPages}
                    }}
                    onPageChanged={(page,numberOfPages) => {
                        // console.log("Current page: ${page});
                    }}
                    onError={(error) => {
                      
                        console.log(error);
                    }}
                    onPressLink={(uri) => {
                        // console.log(Link pressed: ${uri});
                    }}
                    style={styles.pdf}/>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  pdf: {
    flex:1,
    width:Dimensions.get('window').width,
    height:Dimensions.get('window').height,
},
  item: {
    borderRadius: 15,
    margin: 10,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#f1f1f1',
    borderWidth: 0.5,
    shadowColor: 'silver',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    height: hp('5'),
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#000000',
  },
  labelContainer: {
    margin: '1.5%',
  },
  dateContainer: {
    backgroundColor: ThemeColor,
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'white',
  },
  text2: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: 'black',
    fontWeight: 'bold',
  },
  buttonStyle: {
    backgroundColor: SubThemeColor,
    //backgroundColor: "rgba(0, 0, 0, 0.1)",
    width: 200,
    //marginLeft: -100,
    justifyContent: 'flex-start',
  },
  imageStyle: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginHorizontal: 10,
  },
  headerContainer: {
    width: '100%',
    //height: 40,
    flexDirection: 'row',
    borderRadius: 15,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    //paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerTitleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
