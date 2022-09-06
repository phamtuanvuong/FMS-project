import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../../layout/Common.css';
import {
    Radio, Form, Image, Upload, Button, Input, message
} from 'antd';
import 'antd/dist/antd.min.css';
import '../../../../../layout/Configuration.css';
import { Notification } from '../../../../../components/Notification';
import fileUploadIcon from '../../../../../assets/xls-upload.png';
import previewIcon from '../../../../../assets/preview-icon.png';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import removeIcon from '../../../../../assets/multiply.png';
import { LocationService } from '../../../../../services/main_screen/configuration/LocationService';
import {
    trans,
    isUndefindOrEmptyForItemForm,
    stringNullOrEmpty
} from '../../../../../components/CommonFunction';
import { withTranslation } from 'react-i18next';

const { Dragger } = Upload;
const { TextArea } = Input;

class LocationImport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            fileList: [],
            typeUpdate: 1,
            errors: {}
        };
        this.Notification = new Notification();
        this.service = new LocationService();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.options !== this.props.options) {
            let options = nextProps.options;
            this.setState({
                data: [],
                typeUpdate: 1,
                fileList: [],
                errors: {},
                location: options.location,
                campus: options.campus
            });
        }
    }

    componentDidMount() {
        let options = this.props.options;
        console.log(options);
        this.setState({
            data: [],
            typeUpdate: 1,
            fileList: [],
            errors: {},
            location: options.location,
            campus: options.campus
        })
    }

    onCancel = () => {
        console.log(this.state.data)
        this.props.options.onCancel(this.state.data);
    }

    onSubmit = () => {
        if (!this.validate()) {
            return;
        }
        console.log(this.state.data)
        let data = [...this.state.data];
        let userInfo = JSON.parse(localStorage.getItem('cont'))?.userInfo;
        let campus = [...this.state.campus];

        data.forEach(elm => {
            elm.campusID = campus.filter(item => item.name === elm.campusName.trim())[0].id;
            elm.campusName = elm.campusName.trim();
            elm.code = elm.code.trim();
            elm.name = elm.name.trim();
            elm.fullName = elm.fullName.trim();
        });
        console.log(data);
        // return;

        let dataSubmit = {
            listData: data,
            currentUser: userInfo.username,
            // componentId: this.props?.options?.data?.componentId,
            // typeUpdate: this.state.typeUpdate
        }
        this.props.options.onComplete(dataSubmit);
    }

    validate = () => {
        let data = [...this.state.data];
        let errors = { ...this.state.errors };
        let campus = [...this.state.campus];
        let location = [...this.state.location];
        let isValid = true;
        let locationDuplicate = [];

        data.forEach((elm, index) => {
            if (stringNullOrEmpty(elm.campusName)) {
                isValid = false;
                errors['campusName' + index] = trans('common:error.empty');
            } else {
                errors['campusName' + index] = '';
            }
            if (stringNullOrEmpty(elm.code)) {
                isValid = false;
                errors['code' + index] = trans('common:error.empty');
            } else {
                errors['code' + index] = '';
            }
            if (stringNullOrEmpty(elm.name)) {
                isValid = false;
                errors['name' + index] = trans('common:error.empty');
            } else {
                errors['name' + index] = '';
            }
            if (stringNullOrEmpty(elm.fullName)) {
                isValid = false;
                errors['fullName' + index] = trans('common:error.empty');
            } else {
                errors['fullName' + index] = '';
            }
            if (!stringNullOrEmpty(elm.campusName)) {
                let isExist = campus.filter(item => item.name.trim().toLowerCase() === elm.campusName.trim().toLowerCase()).length === 0;
                if (isExist) {
                    isValid = false;
                    errors['campusName' + index] = trans('configuration:campus.notExistCampus');
                } else {
                    errors['campusName' + index] = '';
                }
            }
            if (!stringNullOrEmpty(elm.code)) {
                let isExist = location.filter(item => item.code.trim().toLowerCase() === elm.code.trim().toLowerCase()).length > 0;
                if (isExist) {
                    isValid = false;
                    errors['code' + index] = trans('configuration:location.locationErr');
                } else {
                    if(locationDuplicate.indexOf(elm.code.trim().toLowerCase()) !== -1) {
                        console.log(locationDuplicate);
                        isValid = false;
                        errors['code' + index] = trans('configuration:location.errorDuplicate');
                    } else {
                        locationDuplicate.push(elm.code.trim().toLowerCase());
                        errors['code' + index] = '';
                    }
                }            
            }
        });
        console.log(errors, 'check errors');
        this.setState({ errors })

        return isValid;
    }

    onDownloadTemplate = async () => {
        var filename = 'LocationTemplate.xlsx';
        await this.service.getTemplateImport().then(res => {
            if (res) {
                const downloadUrl = window.URL.createObjectURL(res.data);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        });
    }

    onImport = async (file) => {
        console.log(file);

        if (file.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            this.setState({
                fileList: [file.file]
            });
            var item = file.fileList[0].originFileObj;
            await this.service.importExcel(item).then(res => {
                if (res && res.status === 200) {
                    this.setState({ data: res?.data?.listData });
                } else {
                    this.setState({
                        fileList: []
                    });
                    this.Notification.error("Sai file mẫu, không thể đọc dữ liệu/ Incorect template, can't load data");
                }
            });
        } else {
            this.setState({ data: [], fileList: [file.file] });
        }
    }

    onItemChangeValue = (index, name, value) => {
        let updateData = [...this.state.data];
        let errors = { ...this.state.errors };

        updateData[index][name] = value;
        errors[name + index] = '';
        this.setState({
            data: updateData,
            errors
        });
    }

    onRemoveItem = (index) => {
        let data = [...this.state.data];
        let errors = { ...this.state.errors };

        errors['campusName' + index] = errors['campusName' + (index + 1)];
        errors['fullName' + index] = errors['fullName' + (index + 1)];
        errors['name' + index] = errors['name' + (index + 1)];
        errors['code' + index] = errors['code' + (index + 1)];

        data.splice(index, 1);
        this.setState({ data, errors });
    }

    render() {
        let context = this;
        console.log(this.state.data);
        return (
            <>
                <Form layout="vertical">
                    <Row>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >
                            <Dragger
                                // {...props}
                                name="file"
                                multiple={false}
                                beforeUpload={(file) => {
                                    const isPNG = file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                                    console.log(isPNG)
                                    let isValidFile = true;
                                    if (isPNG) {
                                        // message.error(`${file.name} is not a xlsx file`);
                                        this.Notification.error(`${file.name} is not a .xlsx file/ ${file.name} không phải tệp excel`);
                                        isValidFile = false;
                                    }
                                    this.setState({
                                        isValidFile
                                    })
                                    return isPNG;
                                }}
                                accept='.xlsx'
                                maxCount={1}
                                style={{ display: 'flex' }}
                                onChange={this.onImport}
                                fileList={this.state.fileList}
                            >
                                <Image
                                    src={fileUploadIcon}
                                    preview={false}
                                    width={20}
                                    onClick={this.handleSubmitNewItem}
                                ></Image>
                                <span style={{ fontSize: '15px' }}> {trans("configuration:importFromExcel")}</span>
                            </Dragger>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            style={{ fontSize: '16px', fontStyle: 'italic' }}
                        >
                            {trans("configuration:location.note")}
                            <Button type='link' style={{ fontSize: '16px', fontStyle: 'italic', marginLeft: '-12px' }}
                                onClick={(e) => this.onDownloadTemplate()}
                            > {trans("configuration:location.here")}</Button>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >
                            <div className="preview-label" style={{ cursor: 'pointer' }}>
                                <Image
                                    src={previewIcon}
                                    preview={false}
                                    width={25}
                                    onClick={this.handleSubmitNewItem}
                                ></Image>
                                <span style={{ fontSize: '15px', color: '#1547FA' }}> {trans("configuration:location.preview")}</span>
                            </div>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            style={this.state.data.length !== 0 ? { height: '300px', overflow: 'auto' } : null}
                        >
                            {
                                this.state.data ?
                                    this.state.data.map(function (item, index) {
                                        return (
                                            <Row key={index}>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <b>{(index < 10 ? ('0' + (index + 1)) : (index + 1)) + '. '}</b>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={2}>
                                                    <Form.Item
                                                        required
                                                        label={trans("configuration:location.campus")}
                                                        help={context.state.errors['campusName' + index]}
                                                        validateStatus={isUndefindOrEmptyForItemForm(context.state.errors['campusName' + index])}
                                                    >
                                                        <TextArea
                                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                                            value={item.campusName}
                                                            onChange={e => context.onItemChangeValue(index, 'campusName', e.target.value)}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={2}>
                                                    <Form.Item
                                                        required
                                                        label={trans("configuration:location.locationCode")}
                                                        help={context.state.errors['code' + index]}
                                                        validateStatus={isUndefindOrEmptyForItemForm(context.state.errors['code' + index])}
                                                    >
                                                        <TextArea
                                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                                            value={item.code}
                                                            onChange={e => context.onItemChangeValue(index, 'code', e.target.value)}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={2}>
                                                    <Form.Item
                                                        required
                                                        label={trans("configuration:location.locationName")}
                                                        help={context.state.errors['name' + index]}
                                                        validateStatus={isUndefindOrEmptyForItemForm(context.state.errors['name' + index])}
                                                    >
                                                        <TextArea
                                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                                            value={item.name}
                                                            onChange={e => context.onItemChangeValue(index, 'name', e.target.value)}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={4}>
                                                    <Form.Item
                                                        required
                                                        label={trans("configuration:location.locationFullName")}
                                                        help={context.state.errors['fullName' + index]}
                                                        validateStatus={isUndefindOrEmptyForItemForm(context.state.errors['fullName' + index])}
                                                    >
                                                        <TextArea
                                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                                            value={item.fullName}
                                                            onChange={e => context.onItemChangeValue(index, 'fullName', e.target.value)}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={1}>
                                                    <Form.Item
                                                        label={trans('configuration:inService')}
                                                    >
                                                        <Checkbox
                                                            checked={item.inService}
                                                            style={{ marginLeft: '10px' }}
                                                            onChange={e => context.onItemChangeValue(index, 'inService', e.target.checked)}
                                                        />
                                                    </Form.Item>

                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={1}>
                                                    <Form.Item
                                                        label={trans('configuration:remove')}
                                                    >
                                                        <Button type='link'
                                                            onClick={e => context.onRemoveItem(index)}
                                                        >
                                                            <Image src={removeIcon} preview={false} width={20} />
                                                        </Button>
                                                    </Form.Item>

                                                </Col>
                                            </Row>
                                        )
                                    }) : null
                            }
                        </Col>
                    </Row>
                    <Row style={{ display: 'flex', justifyContent: 'flex-end' }}
                        noGutters
                        className="modal-footer-custom"
                    >
                        <Col
                            xs={6}
                            sm={3}
                            md={2}
                            lg={2}
                            xl={1}
                            style={{ display: 'flex', justifyContent: 'flex-end' }}
                        >
                            <div className="button button-submit" onClick={this.onSubmit}>
                                {trans("common:button.submit")}
                            </div>
                        </Col>
                        <Col
                            xs={6}
                            sm={3}
                            md={2}
                            lg={2}
                            xl={1}
                            style={{ display: 'flex', justifyContent: 'flex-end', marginLeft: '10px' }}
                        >
                            <div className="button" onClick={this.onCancel}>
                                {trans("common:button.cancel")}
                            </div>
                        </Col>
                    </Row>
                </Form>
            </>
        );
    }

};

export default withTranslation(['configuration', 'common'])(LocationImport);
