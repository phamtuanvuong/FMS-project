import React, { Component } from 'react';
import { Col, Label, Row } from "reactstrap";
import 'antd/dist/antd.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import '../../../../layout/Home.css';
import '../../../../layout/CreateTrouble.css';
import { Form, Checkbox, Input, DatePicker } from 'antd';
import HeaderPannel from '../../../../components/HeaderPannel';
import AppContext from '../../../../context/AppContext';
import moment from 'moment';
import {
    onChangeSelectBoxValue,
    onChangeValue,
    focusInvalidInput,
    validateEmpty,
    isUndefindOrEmptyForItemForm,
    handleHideNav,
    trans
} from '../../../../components/CommonFunction';
import SelectCustom from '../../../../components/SelectCustom';
import { LocationService } from '../../../../services/main_screen/configuration/LocationService';
import { AreaRoomService } from '../../../../services/main_screen/configuration/AreaRoomService';
import { MyTroubleService } from '../../../../services/main_screen/trouble/MyTroubleService';
import { Notification } from '../../../../components/Notification';
import UploadImage from '../../../../components/UploadImage';
import Successful from '../../../../components/Successful';
import { mapData } from './mapData';
import { ACTION, MESSAGE, STATUS } from '../../../../constants/Constants';
import { withTranslation } from 'react-i18next';

const { TextArea } = Input;

class CreateTrouble extends Component {

    static contextType = AppContext;

    constructor(props) {
        super(props);
        this.state = {
            emergencyStatus: [
                ''
            ],
            previewVisible: false,
            previewImage: '',
            previewTitle: '',
            requester: '',
            location: [],
            area: [],
            data: {
                fileList: [],
                imgUrls: [],
                // area: null
            },
            errors: {},
            cValue: JSON.parse(localStorage.getItem('cont')),
            areaFilter: {
                paging: { pageSize: 9999, currentPage: 1, rowsCount: 0 },
                locationCode: null,
                campus: null,
                roomCode: null
            },
            success: {
                isSuccess: false,
                reportID: 0
            },
            locationCode: '',
            removedFiles: []
        };
        this.LocationService = new LocationService();
        this.AreaRoomService = new AreaRoomService();
        this.MyTroubleService = new MyTroubleService();
        this.Notification = new Notification();

    }

    componentDidMount() {
        this.loadInit(this.getUrlParameter());
        this.loadLocationData();
        document.querySelector('.container').addEventListener('click', handleHideNav);
    }

    loadInit = async (reportID) => {
        if (reportID !== 'createTrouble') {
            await this.MyTroubleService.getById(reportID).then(res => {
                if (res.status === 200 && res.data?.data) {
                    let updateData = mapData(this.state.data, res.data?.data, this.state.cValue.userInfo);
                    this.setState({
                        data: updateData, locationCode: res.data?.data?.report?.locationCode
                    });
                    this.loadAreaData(res.data?.data?.report?.locationCode);
                }
            });
        }
    }

    getUrlParameter() {
        var url = window.location.href;
        var param = url.slice(url.lastIndexOf('/') + 1);
        return param;
    };

    loadLocationData = async () => {
        await this.LocationService.getAll().then(res => {
            if (res && res.status === 200 && res.data) {
                let location = res?.data?.listData;
                location = location.filter(item => item.numOfFloor !== 0);
                this.setState({ location });
            } else {
                this.Notification.error(MESSAGE.ERROR);
            }
        })
    }

    loadAreaData = async (value) => {
        let filter = { ...this.state.areaFilter };
        filter.locationCode = value;
        await this.AreaRoomService.getListAreaRoom(filter).then(res => {
            if (res && res.status === 200 && res.data) {
                this.setState({ area: res.data.listData });
            }
        })
    }



    handleChangeImage = (fileList) => {
        // console.log('image change');
        let data = { ...this.state.data };
        data.fileList = fileList;
        this.setState({
            data: data
        });
    };

    handleRemove = async (file) => {
        // debugger;
        // var res = await this.MyTroubleService.deleteImage(file.id ? file.id : file.uid);
        // if (res.status === 200) {
        //     this.Notification.success("Delete image sucessfully.");
        // }
        // else {
        //     this.Notification.error(MESSAGE.ERROR);
        // }

        let removedFiles = [...this.state.removedFiles];

        removedFiles.push(file.uid);
        console.log(removedFiles, 'checkkkkk 123');
        this.setState({
            removedFiles
        });
    }

    handleClickSubmit = (e) => {
        e.preventDefault();
        if (!this.validate()) {
            return;
        }
        this._saveTrouble(2);
    }

    _saveTrouble = async (workflowID) => {
        let data = { ...this.state.data };
        let fileList = data.fileList;
        let removedFiles = [...this.state.removedFiles];

        for (var item of fileList) {
            let file = item.originFileObj;
            if (!item.path && !item.url) {
                let resImage = await this.MyTroubleService.saveImage(file);
                item.path = resImage?.data?.secure_url;
                item.id = resImage?.data?.public_id;
            }
        }

        if (removedFiles.length > 0) {
            for (var item of removedFiles) {
                let resRemoved = await this.MyTroubleService.deleteImage(item);
                console.log(resRemoved, 'check res remove');
            }
        }

        data.id = data.id ? data.id : (this.getUrlParameter() !== 'createTrouble' ? this.getUrlParameter() : 0);
        console.log(data, 'checkkkk');
        let dataSubmit = {
            report: {
                id: data.id,
                areaID: data.areaID,
                summary: data.summary || '',
                emergency: data.emergency ? true : false,
                description: data.description,
                inAreaTime: data.inAreaTime ? moment(data.inAreaTime) : null,
                workflowID: workflowID,
                createdBy: this.state.cValue.userInfo ? this.state.cValue.userInfo.username : "Anonymous"
            },
            reportImage: data.fileList
        }
        console.log(dataSubmit, 'checkkkk');

        let resCreate = await this.MyTroubleService.create({ ...dataSubmit });
        if (resCreate && resCreate.status === 200) {
            data.id = resCreate.data?.data?.report?.id;
            // if (workflowID !== 2) {
            //     this.Notification.success(MESSAGE.SAVED_SUCCESS);
            // }
            this.setState({
                data: data,
                success: {
                    isSuccess: true,
                    reportID: data.id
                },
                workflowID
            });
        }
        else {
            this.Notification.error(MESSAGE.ERROR);
        }

        // }, 500);
    }

    handleClickSaveDraft = async (e) => {
        e.preventDefault();
        if (!this.validateSaveDraft()) {
            return;
        }
        await this._saveTrouble(1);
    }

    validate() {
        // var isValid = true;
        var data = { ...this.state.data };
        const [isValid, errors] = validateEmpty(data, ["location", "areaID", "summary", "fileList"]);
        if (!isValid) {
            focusInvalidInput(errors);
        }

        this.setState({
            errors
        });
        return isValid;
    }

    validateSaveDraft() {
        // var isValid = true;
        var data = { ...this.state.data };
        const [isValid, errors] = validateEmpty(data, ["location", "areaID"]);
        if (!isValid) {
            focusInvalidInput(errors);
        }

        this.setState({
            errors
        });
        return isValid;
    }

    onSelectLocationChange = async (value) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };
        await this.setState({
            data: {
                ...data,
                location: value,
                areaID: null
            },
            errors: {
                ...errors,
                location: '',
                areaID: '',
            }
        });
        console.log(this.state.data);

        this.loadAreaData(value);
    }

    onChangeDate = (value) => {
        let data = { ...this.state.data };
        data.inAreaTime = value ? moment(value, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null;
        this.setState({ data: data });
    }

    render() {
        let userInfo = this.context.userInfo ? this.context.userInfo : this.state.cValue.userInfo;

        return (
            this.state.success.isSuccess ?
                <>
                    <Successful
                        options={{
                            reportID: this.state.success.reportID,
                            workflowID: this.state.workflowID,
                            onCreateAnother: () => {
                                this.setState({
                                    success: {
                                        isSuccess: false,
                                    },
                                    data: {
                                        fileList: [],
                                        imgUrls: []
                                    }
                                })
                            },
                            onCancel: () => {
                                this.setState({
                                    success: {
                                        isSuccess: false,
                                    }
                                });
                                this.loadInit(this.getUrlParameter());
                                this.loadLocationData();
                            }
                        }}
                    />
                </>
                :
                <>
                    <div className="container">
                        <Row>
                            <Col
                                style={{ marginBottom: "10px" }}
                            >
                                <HeaderPannel
                                    classNameCustom="create-trouble"
                                    title={trans('trouble:createTrouble.title')}
                                    breadcrumbList={[trans('trouble:createTrouble.trouble'), trans('trouble:createTrouble.title')]}
                                    buttons={[
                                        {
                                            title: trans('common:submit'),
                                            classNameCustom: 'submit',
                                            action: (e) => this.handleClickSubmit
                                        },
                                        {
                                            title: trans('common:saveDraft'),
                                            classNameCustom: 'other',
                                            action: (e) => this.handleClickSaveDraft
                                        },
                                    ]}
                                />
                            </Col>
                            <Form layout="vertical">
                                <div className="infor-user-create padding-pannel" style={{ paddingTop: '15px' }}>
                                    <Row>
                                        <Col xs={12} xl={12}>
                                            <Label><b>{trans('trouble:createTrouble.reporter')} &emsp;</b> {userInfo?.username ? userInfo?.username : 'Anonymous'} </Label>
                                        </Col>
                                        <Col xs={12} sm={12} xl={2}>
                                            <Label><b>{trans('trouble:createTrouble.campus')} &emsp;</b> <b>{userInfo?.campus?.name}</b></Label>
                                        </Col>
                                        <Col xs={12} sm={6} md={5} lg={5} xl={4} >
                                            <Form.Item
                                                help={this.state.errors.location}
                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.location)}
                                            >
                                                <SelectCustom
                                                    id="location"
                                                    onChange={(e, value) => this.onSelectLocationChange(e)}
                                                    value={this.state.data.location}
                                                    placeholder={trans('trouble:createTrouble.selectLocation')}
                                                    options={this.state.location}
                                                    keyValue='code'
                                                    label='name'
                                                    clear={true}
                                                />
                                            </Form.Item>
                                        </Col>
                                        {/* <Col xs={12} md={1} lg={1} xl={1}></Col> */}
                                        <Col xs={12} sm={6} md={{ size: 5, offset: 1 }} xl={{ size: 4, offset: 1 }}>
                                            <Form.Item
                                                help={this.state.errors.areaID}
                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.areaID)}
                                            >
                                                <SelectCustom
                                                    id="areaID"
                                                    onChange={(e) => onChangeValue(this, 'areaID', e)}
                                                    placeholder={trans('trouble:createTrouble.selectArea')}
                                                    value={this.state.data.areaID}
                                                    options={this.state.area}
                                                    keyValue='id'
                                                    clear={true}
                                                >
                                                </SelectCustom>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} sm={1}>
                                            <div className="scan-qrcode-icon show">
                                            </div>
                                        </Col>

                                    </Row>
                                </div>

                                <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginTop: '10px' }}>
                                    <div className="infor-create-report">
                                        <div className="detail-report-header header-pannel title">{trans('trouble:createTrouble.troubleReport')}</div>
                                        <div className="detail-report-form padding-pannel">
                                            <Row>
                                                <Col xs={12} sm={12} md={6} lg={6} xl={8}>
                                                    <div className="summary">
                                                        <Form.Item
                                                            required="true"
                                                            label={trans('trouble:createTrouble.summary')}
                                                            help={this.state.errors.summary}
                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.summary)}
                                                        >
                                                            <TextArea
                                                                id="summary"
                                                                autoSize={{ minRows: 1, maxRows: 1 }}
                                                                placeholder=''
                                                                maxLength={100}
                                                                showCount
                                                                value={this.state.data.summary}
                                                                onChange={e => onChangeValue(this, 'summary', e.target.value)}
                                                            />
                                                            <div className="small-description decription-input">
                                                                {trans('trouble:createTrouble.summaryDescription')}
                                                                {/* Hãy ghi khái quát sự cố đang xảy ra. Ví dụ: Bóng đèn trong khu vực nhà vệ sinh bị cháy */}
                                                            </div>
                                                        </Form.Item>

                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={12} md={6} lg={6} xl={4}>
                                                    <div className="area-time">
                                                        <Form.Item
                                                            // required="true"
                                                            label={trans('trouble:createTrouble.inAreaTime')}
                                                            help={this.state.errors.inAreaTime}
                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.inAreaTime)}
                                                        >
                                                            <DatePicker
                                                                id="inAreaTime"
                                                                showTime={true}
                                                                placeholder=''
                                                                disabledDate={current => (moment(current) > moment().add(1, 'months') || moment(current) < moment().subtract(1, 'day'))}
                                                                value={this.state.data.inAreaTime ? moment(this.state.data.inAreaTime) : null}
                                                                onChange={(e, timeString) => this.onChangeDate(timeString)}
                                                                format='DD/MM/YYYY HH:00:00'
                                                            />
                                                            <div className="small-description decription-input">
                                                                {trans('trouble:createTrouble.inAreaTimeDescription')}
                                                                {/* Thời gian bạn ở phòng để bên Kỹ thuật có thể đến xử lý */}
                                                            </div>
                                                        </Form.Item>
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <div className="emergency-status">
                                                        <Form.Item>
                                                            {trans('trouble:createTrouble.emergency')}
                                                            <Checkbox
                                                                checked={this.state.data.emergency}
                                                                onChange={e => onChangeValue(this, 'emergency', e.target.checked)}
                                                                style={{ marginLeft: "15px" }}
                                                            />
                                                            <div className="small-description decription-input">
                                                                {trans('trouble:createTrouble.emergencyDescription')}
                                                                {/* Nếu xảy ra tình trạng cháy (nổ), mất điện nghiêm trọng, hãy tick vào ô này để được xử lý sớm */}
                                                            </div>
                                                        </Form.Item>
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <div className="more-description">
                                                        <Form.Item
                                                            label={trans('trouble:createTrouble.description')}
                                                            help={this.state.errors.description}
                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.description)}
                                                        >
                                                            <div className="asset-status-option1">
                                                                <TextArea
                                                                    value={this.state.data.description}
                                                                    onChange={e => onChangeValue(this, 'description', e.target.value)}
                                                                    autoSize={{ minRows: 4, maxRows: 6 }}
                                                                    maxLength={400}
                                                                    showCount
                                                                />
                                                            </div>
                                                            <div className="small-description decription-input">
                                                                {trans('trouble:createTrouble.descriptionDescription')}
                                                                {/* Cung cấp thêm một số mô tả để đội Kỹ thuật có thể đưa ra dự đoán, giải pháp sự cố tốt hơn */}
                                                            </div>
                                                        </Form.Item>
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <div className="issue-image">
                                                        <Form.Item
                                                            id="fileList"
                                                            label={trans('trouble:createTrouble.imageDescription')}
                                                            required={true}
                                                            help={this.state.errors.fileList}
                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.fileList)}
                                                        >
                                                            <div className="issue-image-upload">
                                                                <UploadImage
                                                                    fileList={this.state.data.fileList}
                                                                    handleChangeImage={this.handleChangeImage}
                                                                    handleRemove={this.handleRemove}
                                                                />
                                                            </div>
                                                        </Form.Item>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                </Col>
                            </Form>
                        </Row>
                    </div>
                </>
        );
    }

};

export default withTranslation(['trouble', 'common'])(CreateTrouble);
