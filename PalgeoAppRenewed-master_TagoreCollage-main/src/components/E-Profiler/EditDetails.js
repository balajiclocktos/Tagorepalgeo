import axios from 'axios';
import moment from 'moment';
import {Picker} from '@react-native-picker/picker';
import React, {Component} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {TextInput} from 'react-native';
import {Text, View} from 'react-native';
import {CheckBox} from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  heightPercentageToDP,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Colors} from '../../utils/configs/Colors';
import Const from '../common/Constants';
import Layout from '../common/Layout';
import CustomLabel from '../common/CustomLabel';
import CustomModalTextArea from '../common/CustomModalTextArea';
import {CustomButton} from '../common/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TouchableWithoutFeedback} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {Dimensions} from 'react-native';
import RadioButtonRN from 'radio-buttons-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomLoader from '../Task Allocation/CustomLoader';
import CustomAttachment from '../common/CustomAttachment';
import {PermissionsAndroid} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import {Select} from 'native-base';
import ImageResizer from 'react-native-image-resizer';
const SubThemeColor = Colors.secondary;
const ThemeColor = Colors.button[0];
const screenWidth = Dimensions.get('window').width;
export class StaffDetailsMaster extends Component {
  attachmentRef = null;
  state = {
    formData: [],
    date: moment(),
    currentIndex: 0,
    user_id: '',
    institute_id: '',
    files: [],
    attachments: [],
    error: false,
    errorMsg: 'This is required field',
    body: new FormData(),
    ApiLoader: true,
    isMultiple: this.props.route?.params?.isMultiple || false,
    edit: this.props.route?.params?.edit || false,
    recordId: this.props.route?.params?.recordId || '',
  };
  componentDidMount() {
    this.retrieveUserData();
    this.retrieveData();
  }

  retrieveUserData = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const institute_id = await AsyncStorage.getItem('institute_id');
      const bearer_token = await AsyncStorage.getItem('bearer_token');
      this.setState({user_id, institute_id, bearer_token});
    } catch (e) {
      alert('Error retrieving user data. Please logout and login again');
    }
  };

  retrieveData = async () => {
    const {formId, recordId, edit} = this.props?.route?.params;
    //console.log(edit);
    const url = !edit
      ? `${Const}api/Master/GetFormControlsByFormId/${formId}`
      : `${Const}api/Master/GetFormControlsByFormIdByRecordId/${formId}/${recordId}`;

    try {
      const response = await axios.get(url);
      const {data} = response;
      this.setState({ApiLoader: false});
      //console.log('data ==>', JSON.stringify(data, null, 4));
      if (data?.length > 0) {
        let files = [];
        const newData = data.map(e => {
          if (e.controlType === 'file upload' && edit) {
            if (e.value !== '') {
              //console.log(typeof JSON.parse(e.value));
              // if (typeof JSON.parse(e.value) === 'object') {
              //   JSON.parse(e.value).forEach((ee) => files.push(ee.name));
              //   this.setState({files}, () => console.log('files==', files));
              // }
              const filess = e.value;
              files = filess.split(',');
              this.setState({files});
            }
          }
          if (e.controlType === 'checkbox' && edit) {
          }
          return {
            ...e,
            //date: moment().format('YYYY-MM-DD'),

            value:
              e.value && edit
                ? e.controlType === 'file upload'
                  ? e.value
                  : e.controlType === 'checkbox'
                  ? e.value === 'True'
                    ? true
                    : false
                  : e.value
                : e.controlType === 'checkbox'
                ? false
                : e.controlType === 'datepicker'
                ? moment().format('YYYY-MM-DD')
                : '',
            //checked: false,
          };
        });
        this.setState({formData: newData});
      }
    } catch (e) {
      this.setState({ApiLoader: false});
      alert('Error retreiving form data: ' + e.message);
    }
  };

  showDatePicker = index => {
    const {formData} = this.state;
    //formData[index].showDateModal = !formData[index].showDateModal;
    this.setState({formData: [...formData], show: false});
  };

  setDate = (index, date) => {
    const {formData} = this.state;
    //formData[index].date = moment(date).format('YYYY-MM-DD');
    formData[index].value = moment(date).format('YYYY-MM-DD');
    //formData[index].showDateModal = false;
    this.setState({formData: [...formData], show: false});
  };

  setText = (index, text) => {
    const {formData} = this.state;
    formData[index].value = text;

    this.setState({formData: [...formData]});
  };

  setCheckBox = index => {
    const {formData} = this.state;
    // formData[index].checked = !formData[index].checked;
    formData[index].value = !formData[index].value;
    this.setState({formData: [...formData]});
  };

  onValueChange = (index, value) => {
    const {formData} = this.state;
    formData[index].value = value;
    this.setState({formData: [...formData]});
  };
  setRadio = (index, value) => {
    const {formData} = this.state;
    formData[index].value = value.label;
    this.setState({formData: [...formData]});
  };
  convertArrayToObject = (array, key) => {
    const filteredArray = array.filter(a => a.controlType !== 'file upload');
    const initialValue = {};
    return filteredArray.reduce((obj, item) => {
      return {
        ...obj,
        [item[key]]: item.value,
      };
    }, initialValue);
  };

  checkForRequiredValues = formData => {
    let check = true;
    const data = formData.filter(e => e.required);
    // console.log('last data==', data);
    data.forEach(e => {
      if (e.value === '' && e.value !== false) {
        // console.log(e.value);
        check = false;
      }
    });
    return check;
  };

  saveAttachments = async () => {
    let body = this.state.body;
    const file = this.state.formData.find(e => e.controlType === 'file upload');
    //let files = this.state.attachments;
    if (file) {
      body.append('FileControlTypeId', file.key || '');
      this.setState({body});
    }
  };

  saveData = async () => {
    //console.log('Start_time==', new Date().toTimeString());
    const check = this.checkForRequiredValues(this.state.formData);
    if (check) {
      this.setState({error: false});
    }
    if (!check) {
      this.setState({error: true});
      return alert('Please fill required fields before saving.');
    }
    this.setState({loader: true});
    const url = Const + 'api/Master/SaveFormInstitueStaffMapping';
    let {body} = this.state;
    const obj = this.convertArrayToObject(this.state.formData, 'key');

    let {attachments} = this.state;
    //console.log('attachments', attachments);
    // attachments = [...attachments, ...files];
    const payload = JSON.stringify(obj);

    body.append('InstituteId', this.state.institute_id);
    body.append('Payload', payload);
    body.append('RecordId', this.state.recordId);
    body.append('StaffCode', this.state.user_id);
    // file && body.append('FileControlTypeId', file.key || '');
    attachments.length > 0 &&
      attachments.forEach(e => {
        body.append('Files', {uri: e.uri, type: e.type, name: e.name});
      });
    try {
      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + this.state.bearer_token,
        },
      });
      //console.log('End_time==', new Date().toTimeString());
      const {data} = response;
      //console.log('data', JSON.stringify(body, null, 2));
      this.setState({loader: false});
      if (data.status) {
        alert(data.message);
        return this.props.navigation.goBack();
      }

      alert(data.message);
    } catch (e) {
      //console.log('eeee', e);
      this.setState({loader: false});
      alert('Error saving data. Please try again');
    }
  };

  attachDocs = async index => {
    //const {isMultiple} = this.state;
    // console.log('I am pressed', isMultiple);
    let results = [];
    try {
      // if (!isMultiple) {
      //   results = await DocumentPicker.pick({
      //     type: [DocumentPicker.types.allFiles],
      //   });
      // } else {
      results = await DocumentPicker.pickMultiple({
        // includeBase64: true,
        type: [
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.images,
          DocumentPicker.types.pdf,
          DocumentPicker.types.plainText,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
          DocumentPicker.types.zip,
        ],
      });
      // }
      let files = [];
      const {formData} = this.state;
      //console.log('res', results);
      results.forEach(e => files.push(e.name));
      formData[index].name = files.join(',');
      let resultss = [];
      if (formData[index].value?.split(',').length > 0) {
        resultss = [formData[index].value, ...files];
      } else {
        resultss = files;
      }
      formData[index].value = resultss.join(',');
      this.setState({
        formData: [...formData],
        files: [...this.state.files, ...files],
        attachments: [...this.state.attachments, ...results],
      });
      //console.log('files', formData);

      //files = tempArr.map((tt) => tt.fileName)
    } catch (e) {
      console.log(e);
    }
  };

  openCamera = async (index, camera) => {
    //console.log('I ran', this.attachmentRef);
    const options1 = {quality: 0, base64: false};
    try {
      const image1 = await camera.takePictureAsync(options1);

      let fileExtension = image1.uri.slice(-3);
      ImageResizer.createResizedImage(
        image1.uri,
        300,
        300,
        'PNG',
        0,
        0,
        undefined,
      )
        .then(async response => {
          const capturedImage = {
            ...response,
            name: 'Attachment_' + new Date().getTime() + '.' + fileExtension,
            type: 'image/' + fileExtension,
          };
          const {formData} = this.state;
          let results = [];
          if (formData[index].value?.split(',').length > 0) {
            results = [formData[index].value, capturedImage.name];
          } else {
            results.push(capturedImage.name);
          }
          //console.log('resCamera', results);
          formData[index].value = results.join(',');
          // const name = 'Attachment_' + new Date().getTime() + '.' + fileExtension;
          this.setState({
            formData: [...formData],
            files: [...this.state.files, capturedImage.name],
            attachments: [...this.state.attachments, capturedImage],
          });
        })
        .catch(e => alert(e.message));
      //console.log(fileExtension, image1.uri);

      //console.log('Attachment = ', Attachment),
    } catch (e) {
      console.log('Error in capturing: ', e);
    }
  };

  Handler = (elem, ind, index) => {
    //console.log('index', index);
    const {formData, attachments} = this.state;
    const results = formData[index].value.split(',');
    const filtered = results.filter(rr => rr !== elem);
    const filteredAttachments = attachments.filter(rr => rr.name !== elem);
    formData[index].value = filtered.join(',');
    const newFiles = this.state.files.filter((e, i) => i !== ind);
    this.setState({
      files: [...newFiles],
      formData: [...formData],
      attachments: [...filteredAttachments],
    });
  };

  download = async () => {
    const {recordId} = this.props.route.params;
    const url = `${Const}api/Master/DownloadFile/${recordId}`;
    try {
      const response = await axios.get(url);
      //console.log('response', response.data);
    } catch (e) {
      console.log('error download', e);
    }
  };

  getInitialValue = (options, value) => {
    const keys = options.map(e => e.key);
    const index = keys.indexOf(value);
    // console.log('index==', index);
    if (index != -1) {
      return index + 1;
    }
    return null;
  };

  render() {
    const {formData, currentIndex, loader, ApiLoader} = this.state;
    const {name} = this.props.route.params;
    //console.log('reocrd', this.state.recordId);
    return (
      <Layout
        headerTitle={name}
        normal
        scroll
        backScreen={'MyPersonalInfo'}
        navigation={this.props.navigation}>
        {this.state.show && (
          <DateTimePickerModal
            mode={'date'}
            date={new Date(formData[currentIndex].value)}
            onConfirm={date => this.setDate(currentIndex, date)}
            onCancel={() => this.showDatePicker(currentIndex)}
            style={{backgroundColor: SubThemeColor}}
            isVisible={this.state.show}
          />
        )}
        {loader && <CustomLoader loaderText={'Saving data...'} />}

        {formData?.length > 0 &&
          formData.map(
            (
              {
                key,
                label,
                controlType,
                options,
                required,

                value,
                checked,
              },
              index,
            ) => {
              return (
                <View key={key}>
                  <CustomLabel
                    labelStyle={{textTransform: 'capitalize', fontSize: 15}}
                    title={label}
                    containerStyle={{
                      margin: 1,
                      marginTop: 10,
                      flexDirection: 'row',
                    }}
                    required={required}
                  />
                  {controlType === 'dropdown' && (
                    <Select
                      mode="dropdown"
                      style={{width: screenWidth - 20, alignSelf: 'center'}}
                      selectedValue={value}
                      onValueChange={value => this.onValueChange(index, value)}>
                      <Select.Item label="Select" value="" key="" />
                      {options.map((item, ind) => {
                        return (
                          <Select.Item
                            label={item.value}
                            value={item.value}
                            key={item.key}
                          />
                        );
                      })}
                    </Select>
                  )}
                  {controlType === 'radio button' && (
                    <RadioButtonRN
                      style={{flexDirection: 'row', width: '80%'}}
                      boxStyle={{flex: 1, alignItems: 'center', marginLeft: 5}}
                      textStyle={{
                        fontSize: 14,
                        fontFamily: 'Poppins-Regular',
                        paddingLeft: 5,
                        textTransform: 'capitalize',
                      }}
                      box={false}
                      data={options.map(e => {
                        return {label: e.key};
                      })}
                      //initial={null}
                      initial={this.getInitialValue(options, value)}
                      selectedBtn={e => this.setRadio(index, e)}
                      icon={
                        <Icon
                          name="check-circle"
                          size={25}
                          color={Colors.button[0]}
                        />
                      }
                    />
                  )}
                  {controlType === 'datepicker' && (
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({currentIndex: index}, () => {
                          this.setState({show: true});
                        });
                      }}
                      style={{width: wp('35')}}>
                      <CustomLabel
                        containerStyle={{
                          backgroundColor: Colors.secondary,
                          padding: 8,
                        }}
                        labelStyle={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 14,
                          color: Colors.button[0],
                        }}
                        title={value}
                      />
                    </TouchableOpacity>
                  )}
                  {controlType === 'textbox' && (
                    <CustomModalTextArea
                      value={value}
                      onChangeText={text => this.setText(index, text)}
                    />
                  )}
                  {controlType === 'checkbox' && (
                    <CheckBox
                      title={label}
                      checked={value}
                      onPress={() => this.setCheckBox(index)}
                      containerStyle={{
                        backgroundColor: 'transparent',
                        padding: 0,
                        borderWidth: 0,
                      }}
                      checkedColor={Colors.button[0]}
                    />
                  )}
                  {controlType === 'file upload' && (
                    <View
                      style={
                        {
                          // marginTop: '4%',
                          // marginLeft: '2%',
                          // marginRight: '2%',
                        }
                      }>
                      {/* {value?.length > 0 && (
                        <TouchableOpacity onPress={() => this.download()}>
                          <CustomLabel
                            title={'Attachments'}
                            labelStyle={{
                              color: Colors.maroon,
                              textDecorationLine: 'underline',
                            }}
                          />

                          {value.map((e) => (
                            <Row>
                              <CustomLabel title={e.name} />
                              <Icon
                                name="remove"
                                size={25}
                                color={Colors.header}
                                onPress = {}
                              />
                            </Row>
                          ))}
                        </TouchableOpacity>
                      )} */}
                      <CustomAttachment
                        text={this.state.files.join(',')}
                        openCamera={camera => this.openCamera(index, camera)}
                        onPress={() => this.attachDocs(index)}
                        onDelete={(elem, ind) => this.Handler(elem, ind, index)}
                        backgroundColor={SubThemeColor}
                        placeholderTextColor={ThemeColor}
                        files={this.state.files}
                      />
                      {/* <TouchableWithoutFeedback
                        onPress={() => this.attachDocs(index)}>
                        <View>
                          <Item regular disabled style={styles.item}>
                            <Input
                              placeholder="Choose File"
                              style={styles.input}
                              value={this.state.files.join(',')}
                              disabled
                            />
                          </Item>
                        </View>
                      </TouchableWithoutFeedback> */}
                    </View>
                  )}
                  {this.state.error && required && (
                    <CustomLabel
                      title={this.state.errorMsg}
                      labelStyle={{color: Colors.header, fontStyle: 'italic'}}
                    />
                  )}
                </View>
              );
            },
          )}
        {formData?.length > 0 && (
          <CustomButton
            marginTop={10}
            justifyContent={'flex-end'}
            color={Colors.button[0]}
            title={'Save'}
            onPress={() => this.saveAttachments().then(() => this.saveData())}
          />
        )}
        {ApiLoader && <CustomLoader loaderText="Loading..." />}
        {formData.length === 0 && !ApiLoader && (
          <CustomLabel labelStyle={{textAlign: 'center'}} title={'No data'} />
        )}
      </Layout>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    backgroundColor: '#ffffff',
    paddingLeft: '5%',
    borderRadius: 10,
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
  },
  item: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    height: heightPercentageToDP('7'),
    borderColor: '#f1f1f1',
    borderWidth: 1.5,
  },
});

export default StaffDetailsMaster;
