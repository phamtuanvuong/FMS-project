import React, { Component } from 'react';
import { Col, Label, Row } from "reactstrap";
import 'antd/dist/antd.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import '../../../../layout/Home.css';
import '../../layout/CreateTrouble.css';
import { Form, Checkbox, Input, DatePicker, Image, Select } from 'antd';
import {
    SolutionOutlined
} from '@ant-design/icons';
import logoutIcon from '../../assets/logout.png';
import vietnam from '../../assets/vietnam.png';
import usaFlag from '../../assets/usaFlag.png';
import logoFms from '../../assets/LogoDashboard.png';
import qrIcon from '../../assets/Qrcode-icon.png';
import HeaderPannel from '../../components/HeaderPannel';
import AppContext from '../../context/AppContext';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
    onChangeValue,
    focusInvalidInput,
    validateEmpty,
    isUndefindOrEmptyForItemForm,
    trans
} from '../../components/CommonFunction';
import SelectCustom from '../../components/SelectCustom';
import { LocationService } from '../../services/main_screen/configuration/LocationService';
import { AreaRoomService } from '../../services/main_screen/configuration/AreaRoomService';
import { MyTroubleService } from '../../services/main_screen/trouble/MyTroubleService';
import { Notification } from '../../components/Notification';
import UploadImage from '../../components/UploadImage';
import SuccessfulWithoutLogin from './SuccessfulWithoutLogin';
import { ACTION, STATUS, MESSAGE } from '../../constants/Constants';
import { showDialog, hideDialog } from '../../components/Dialog';
import QRScanner from './QRScanner';
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
                imgUrls: []
            },
            delay: 100,
            result: 'No result',
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
            removedFiles: [],
        };
        this.LocationService = new LocationService();
        this.AreaRoomService = new AreaRoomService();
        this.service = new MyTroubleService();
        this.Notification = new Notification();

    }

    componentDidMount() {
        // this.loadLocationData();
        // this.loadAreaData();
        this.loadCampusSelect();
        let param = this.getUrlParameter().split('/');
        let data = { ...this.state.data };
        if (param[0] && param[0] !== '' && param[1] && param[2]) {
            this.setState({
                data: {
                    ...data,
                    campus: param[0],
                    location: param[1],
                    area: param[2]
                }
            });
            this.loadLocationData(param[0]);
            this.loadAreaData(param[1], param[2]);

        }
        console.log(param, 'check ');
    }


    getUrlParameter() {
        var url = window.location.href;
        var param = url.slice(url.lastIndexOf('createTroubleWithoutLogin') + 26);
        return param;
    };

    loadLocationData = async (campus) => {
        console.log(campus);
        let resLocation = await this.LocationService.getLocationByCampus([campus]);
        if (resLocation && resLocation.status === STATUS.SUCCESS && resLocation.data) {
            let location = resLocation?.data?.listData;
            location = location.filter(item => item.numOfFloor !== 0);
            this.setState({ location });
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    loadCampusSelect = async () => {
        const resCampus = await this.service.getAllCampus();
        // console.log(resCampus);
        if (resCampus && resCampus.data.status === STATUS.SUCCESS) {
            let campus = resCampus?.data?.listData;
            this.setState({
                campus
            });
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    loadAreaData = async (location, areaName) => {
        let resArea = await this.AreaRoomService.getAreaRoomByLocations([location]);
        if (resArea?.status === 200 && resArea.data) {
            console.log(resArea.data.listData);
            let data = { ...this.state.data };
            let area = resArea.data.listData.filter(item => item.name === areaName);
            console.log(area);
            let areaData = null;
            if (area.length > 0) {
                areaData = area[0].id;
            }
            this.setState({
                area: resArea.data.listData,
                data: {
                    ...data,
                    area: areaData
                }
            });
        }
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

        let userInfo = JSON.parse(localStorage.getItem('cont'))?.userInfo;
        console.log(data);
        // return;
        for (var item of fileList) {
            let file = item.originFileObj;
            if (!item.path && !item.url) {
                let resImage = await this.service.saveImage(file);
                item.path = resImage?.data?.secure_url;
                item.id = resImage?.data?.public_id;
            }
        }

        // if (removedFiles.length > 0) {
        //     for (var item of removedFiles) {
        //         let resRemoved = await this.service.deleteImage(item);
        //         console.log(resRemoved, 'check res remove');
        //     }
        // }

        console.log(data.fileList, 'check list image')
        let dataSubmit = {
            report: {
                id: 0,
                areaID: data.area,
                summary: data.summary,
                emergency: data.emergency ? true : false,
                description: data.description,
                inAreaTime: data.inAreaTime ? moment(data.inAreaTime) : null,
                workflowID: workflowID,
                createdBy: userInfo ? userInfo.username : "Anonymous"
            },
            reportImage: data.fileList
        }
        let resCreate = await this.service.create(dataSubmit);
        if (resCreate && resCreate.status === 200) {
            console.log(resCreate.data)
            data.id = resCreate.data?.data?.report?.id;
            if (workflowID !== 2) {
                this.Notification.success("Save successfully.");
            }
            console.log(data.id, 'chceck id ress')
            this.setState({
                data: data,
                success: {
                    isSuccess: true,
                    reportID: data.id
                }
            });
        } else {
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
        const [isValid, errors] = validateEmpty(data, ["campus", "location", "area", "summary", "fileList"]);
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
        console.log(value);
        await this.setState({
            data: {
                ...data,
                location: value,
                area: null
            },
            errors: {
                ...errors,
                location: '',
                area: '',
            }
        });
        this.loadAreaData(value, '');
    }

    onSelectCampus = async (value) => {
        console.log(value);
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };

        await this.setState({
            data: {
                ...data,
                campus: value,
                location: null,
                area: null
            },
            area: null,
            errors: {
                ...errors,
                campus: '',
                location: '',
                area: '',
            }
        });
        // setTimeout(() => {
        this.loadLocationData(value);
        // }, 100);
    }

    onChangeDate = (value) => {
        let data = { ...this.state.data };
        data.inAreaTime = value ? moment(value, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null;
        this.setState({ data: data });
    }

    onOpenModalQRScanner = () => {
        showDialog(
            this.getQRScannerForm(),
            "QR Scanner",
            "20%"
        )
    }

    getQRScannerForm = () => {
        return (
            <QRScanner
                options={{
                    onComplete: async (rowData) => {
                        console.log(rowData);
                    },
                    onCancel: (rowData) => {
                        // console.log('ádasdas')
                        hideDialog(true, rowData);
                    }
                }}
            />
        )
    }

    render() {
        const previewStyle = {
            height: 240,
            width: 320,
        }
        const { t, i18n } = this.props;
        return (

            <>
                <div className='header'>
                    <div className='right-header'>
                        <div className='logo-fms'><Image src={logoFms} preview={false} /></div>
                        <div className='title-header-without-login'>Facilities Management System</div>
                    </div>
                    <div className='left-header-without-login'>
                        {/* <div className='fptuni-container'>
                            <div className='fptuni-logo'>
                                <div className='fptuni-image'></div>
                                <div className='fptuni-title'>Fpt University</div>
                            </div>
                        </div> */}
                        <div className='fptuni-container'>
                                            {/* <div className='fptuni-logo'>
                                                <div className='fptuni-image'></div>
                                                <div className='fptuni-title'>Fpt University</div>
                                            </div> */}
                                            {/* <span style={{color: 'white'}}>Lang</span> */}
                                            <Select className="select-lan" defaultValue={"vn"} onChange={(e) => i18n.changeLanguage(e)} showArrow={false}>
                                                <Select.Option value="vn">
                                                    <Image src={vietnam} preview={false} width={20} />
                                                </Select.Option>
                                                <Select.Option value="en">
                                                    <Image src={usaFlag} preview={false} width={20} />
                                                </Select.Option>
                                            </Select>
                                        </div>
                        <div className='welcome-title button' style={{ backgroundColor: '#FFCA27', borderColor: '#000', borderRight: '1px solid #000' }}>
                            <span className='welcome-word'><Link to='/login' style={{ color: '#000' }}>Login</Link></span>
                        </div>
                    </div>
                </div>
                {this.state.success.isSuccess ?
                    <>
                        <SuccessfulWithoutLogin
                            options={{
                                reportID: this.state.success.reportID,
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
                                }

                            }}
                        />
                    </>
                    :
                    <>
                        <div className="container-without-login" >
                            <Row className="content-without-login">
                                <Col
                                    style={{ marginBottom: "10px" }}
                                >
                                    <HeaderPannel
                                        classNameCustom="create-trouble"
                                        title={trans('trouble:createWithoutLogin.title')}
                                        breadcrumbList={[trans('trouble:createWithoutLogin.breadcum')]}
                                        buttons={[
                                            {
                                                title: trans('common:button.submit'),
                                                classNameCustom: 'submit',
                                                action: (e) => this.handleClickSubmit
                                            }
                                        ]}
                                    />
                                </Col>
                                <Form layout="vertical">
                                    <div className="infor-user-create padding-pannel" style={{ paddingTop: '15px' }}>
                                        <Row>
                                            <Col xs={12} xl={12}>
                                                <Label><b>{trans('trouble:createTrouble.reporter')} &emsp;</b> Anonymous </Label>
                                            </Col>
                                            <Col xs={12} sm={12} md={4} lg={4} xl={3} >
                                                <Form.Item
                                                    required
                                                    label={trans('trouble:createTrouble.campus')}
                                                    help={this.state.errors.campus}
                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.campus)}
                                                >
                                                    <SelectCustom
                                                        id="campus"
                                                        onChange={(e, value) => this.onSelectCampus(e)}
                                                        value={this.state.data.campus}
                                                        placeholder={trans('trouble:createWithoutLogin.selectCampus')}
                                                        options={this.state.campus}
                                                        keyValue='name'
                                                        label='name'
                                                        clear={true}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} sm={6} md={4} lg={4} xl={{ size: 3, offset: 1 }}>
                                                <Form.Item
                                                    required
                                                    label={trans('trouble:createWithoutLogin.location')}
                                                    help={this.state.errors.location}
                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.location)}
                                                >
                                                    <SelectCustom
                                                        id="locationSelect"
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
                                            <Col xs={12} sm={6} md={{ size: 4, offset: 0 }} xl={{ size: 3, offset: 1 }}>
                                                <Form.Item
                                                    required
                                                    label={trans('trouble:createWithoutLogin.roomArea')}
                                                    help={this.state.errors.area}
                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.area)}
                                                // initialValues={this.state.data.area}
                                                >
                                                    <SelectCustom
                                                        id="area"
                                                        onChange={(e) => onChangeValue(this, 'area', e)}
                                                        // defaultValue="Student1212"
                                                        placeholder={trans('trouble:createTrouble.selectArea')}
                                                        value={this.state.data.area}
                                                        options={this.state.area}
                                                        clear={true}
                                                        keyValue={'id'}
                                                    >
                                                    </SelectCustom>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} sm={12} md={12} lg={12} xl={1} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <div className="show" onClick={this.onOpenModalQRScanner}>
                                                    <Image
                                                        style={{ cursor: 'pointer', marginTop: '30px' }}
                                                        src={qrIcon}
                                                        preview={false}
                                                        width={30}
                                                        className="image-qrcode"
                                                    ></Image>
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
                                                                    placeholder=""
                                                                    maxLength={100}
                                                                    showCount
                                                                    value={this.state.data.summary}
                                                                    onChange={e => onChangeValue(this, 'summary', e.target.value)}
                                                                />
                                                                <div className="small-description decription-input">
                                                                    {trans('trouble:createTrouble.summaryDescription')}
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
                                                                    value={this.state.data.inAreaTime ? moment(this.state.data.inAreaTime) : null}
                                                                    onChange={(e, timeString) => this.onChangeDate(timeString)}
                                                                    format='DD/MM/YYYY HH:00:00'
                                                                    disabledDate={current => (moment(current) > moment().add(1, 'months') || moment(current) < moment().subtract(1, 'day'))}
                                                                />
                                                                <div className="small-description decription-input">
                                                                    {trans('trouble:createTrouble.inAreaTimeDescription')}
                                                                </div>
                                                            </Form.Item>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                        <div className="emergency-status">
                                                            <Form.Item
                                                            >
                                                                {trans('trouble:createTrouble.emergency')}
                                                                <Checkbox
                                                                    checked={this.state.data.emergency}
                                                                    onChange={e => onChangeValue(this, 'emergency', e.target.checked)}
                                                                    style={{ marginLeft: "15px" }}
                                                                />
                                                                <div className="small-description decription-input">
                                                                    {trans('trouble:createTrouble.emergencyDescription')}
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
                                                                        defaultValue={this.state.data.description}
                                                                    />
                                                                </div>
                                                                <div className="small-description decription-input">
                                                                {trans('trouble:createTrouble.descriptionDescription')}
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
                        <div className='footer-without-login'>
                            <div className='guideline-direction'>
                                <div className='guideline-icon'>
                                    <SolutionOutlined />
                                </div>
                                {/* <div className='guideline-link'>
                                <Link to='guideline'>Guideline</Link>
                            </div> */}
                            </div>
                            <div className='infor-project'>
                                <span><b>FPT University</b> © <b>2022</b>, SWP490_G7</span>
                            </div>
                        </div>
                    </>
                }
            </>

        );
    }
};

export default withTranslation(['trouble', 'common'])(CreateTrouble);
