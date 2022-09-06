import React, { Component } from 'react';
import { Col, Label, Row } from "reactstrap";
import 'antd/dist/antd.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import '../../../../layout/TroubleDetail.css'
import { Radio, Select, Checkbox, Input, Steps, Image, Form, DatePicker, Timeline, Tag } from 'antd';
import locationIcon from '../../../../assets/location.png';
import HeaderPannel from '../../../../components/HeaderPannel';
import moment from 'moment';
import {
    onChangeValue,
    onChangeSelectBoxValue,
    focusInvalidInput,
    validateEmpty,
    isUndefindOrEmptyForItemForm,
    handleHideNav,
    trans
} from '../../../../components/CommonFunction';
import { STATUS, MESSAGE } from '../../../../constants/Constants';
import SelectCustom from '../../../../components/SelectCustom';
import { MyTroubleService } from '../../../../services/main_screen/trouble/MyTroubleService';
import NotFound from '../../../notfound_page/NotFound';
import UploadImage from '../../../../components/UploadImage';
import { WorkflowService } from '../../../../services/main_screen/configuration/WorkflowService';
import { UserService } from '../../../../services/main_screen/configuration/UserService';
import { AssetCategoryService } from '../../../../services/main_screen/configuration/AssetCategoryService';
import { Notification } from '../../../../components/Notification';
import { mapData } from './mapData';
import { Navigate } from 'react-router-dom';
import { initData } from './initData';
import { withTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Step } = Steps;

class TroubleDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            testProps: this.props.location?.data,
            previewVisible: false,
            previewImage: '',
            previewTitle: '',
            previewVisible2: false,
            previewImage2: '',
            previewTitle2: '',
            requester: '',
            campus: '',
            data: {
                fileList: [],
                fileListResolveImage: [],
                emergency: false,
                isResolved: false,
                permission: {
                    reporter: true,
                    manager: false,
                    technician: false
                }

            },
            errors: {},
            workflow: [],
            trouble: {},
            technician: [],
            category: [],
            history: [],
            removedFiles: [],
            cValue: JSON.parse(localStorage.getItem('cont')),
            isNotFound: false,
            redirect: false
        }
        this.MyTroubleService = new MyTroubleService();
        this.WorkflowService = new WorkflowService();
        this.UserService = new UserService();
        this.AssetCategoryService = new AssetCategoryService();
        this.Notification = new Notification();
    }

    componentDidMount = async () => {
        let reportId = this.getUrlParameter();
        await this.loadWorkflow();
        await this.loadTechnicians();
        await this.loadCategory();
        await this.loadForm(reportId);
        let data = { ...this.state.data };
        if (data.report) {
            document.querySelector('.container')?.addEventListener('click', handleHideNav);
        }
    }

    loadForm = async (reportID) => {
        await this.MyTroubleService.getById(reportID).then(res => {
            if (res.status === 200 && res.data.data.report) {
                let updateData = mapData(this.state.data, res.data?.data, this.state.cValue.userInfo);
                let isStatus5 = false;
                if (updateData.status === 5) {
                    isStatus5 = true
                }
                this.setState({ data: updateData, trouble: res.data.data, isStatus5, removedFiles: [] });
            }
            else {
                this.setState({ isNotFound: true });
            }
        });
        await this.loadHistory(reportID);
    }

    loadWorkflow = async () => {
        await this.WorkflowService.getByType("Trouble").then(res => {
            if (res.status === 200) {
                this.setState({ workflow: res.data.listData });
            }
        })
    }

    loadTechnicians = async () => {
        await this.UserService.getByRole("Technician").then(res => {
            if (res && res.status === 200 && res.data?.listData) {
                let technician = res.data?.listData.filter(item => item.isActive !== false);
                this.setState({
                    technician
                });
            }
        })
    }

    loadCategory = async () => {
        await this.AssetCategoryService.getAllCategory().then(res => {
            if (res && res.status === 200 && res.data?.listData) {
                this.setState({
                    category: res.data?.listData
                })
            }
        })
    }

    loadHistory = async (reportID) => {
        await this.MyTroubleService.getHistory(reportID).then(res => {
            this.setState({
                history: res.data?.listData
            })
        })
    }

    onChangeIssueImage = (data) => {
        console.log('data = ', data);
    }

    getUrlParameter() {
        var url = window.location.href;
        var param = url.slice(url.lastIndexOf('/') + 1);
        return param;
    };

    handleClickSubmit = async (e) => {
        e.preventDefault();
        let data = { ...this.state.data };
        let user = { ...this.state.cValue };
        let userInfo = user.userInfo;
        let removedFiles = [...this.state.removedFiles];

        if (data.status === 6) {
            await this._cancelTrouble(data);
            return;
        }
        if (data.status === 2 && userInfo?.username === data.reporter) {
            if (!this.validate(1)) {
                return;
            }
            await this._saveTrouble(data, removedFiles);
        }

        if (data.technician && (userInfo?.role === 2 || userInfo?.role === 3)) {
            if (!data.currentTechnician || (data.technician !== data.currentTechnician)) {
                await this._assignTechnician(data);
            }
        }

        if (data.status >= 3 && data.status !== 6) {
            if (data.status === 5) {
                if (!this.validate(2)) {
                    return;
                }
                // finish workflow
            }
            await this._update(data, userInfo);
        }

        // xử lý sau validate
        this.loadForm(this.getUrlParameter());

    }

    _update = async (data, userInfo) => {
        let updateData = initData(data, userInfo);
        let fileList = data.fileListResolveImage;
        let removedFiles = [...this.state.removedFiles];
        for (var item of fileList) {
            let file = item.originFileObj;
            if (!item.path && !item.url) {
                await this.MyTroubleService.saveImage(file).then(res => {
                    item.path = res?.data?.secure_url;
                    item.id = res?.data?.public_id;
                    // item.saveInCloud = true;
                });
            }
        }

        if (removedFiles.length > 0) {
            for (var item of removedFiles) {
                let resRemoved = await this.MyTroubleService.deleteImage(item);
                console.log(resRemoved, 'check res remove');
            }
        }

        var res = await this.MyTroubleService.update(updateData);
        if (res.status === 200) {
            this.Notification.success('Save sucessfully.');
        }
        else {
            this.Notification.error('Fail');
        }
    }

    _cancelTrouble = async (data) => {
        var res = await this.MyTroubleService.cancelReport(data.id);
        if (res.status === 200) {
            this.Notification.success('Cancel report sucessfully.');
            this.setState({ redirect: true })
        }
        else {
            this.Notification.error('Fail');
        }
    }

    _saveTrouble = async (data, removedFiles) => {
        // debugger
        console.log(removedFiles, 'check remove files');
        // return;
        let fileList = data.fileList;
        for (var item of fileList) {
            let file = item.originFileObj;
            if (!item.path && !item.url) {
                let resImage = await this.MyTroubleService.saveImage(file);
                item.path = resImage?.data?.secure_url;
                item.id = resImage?.data?.public_id;
                console.log(resImage, 'check res save image');
                // item.saveInCloud = true;            
            }
        }

        if (removedFiles.length > 0) {
            for (var item of removedFiles) {
                let resRemoved = await this.MyTroubleService.deleteImage(item);
                console.log(resRemoved, 'check res remove');
            }
        }

        var item =
        {
            report: {
                id: data.id,
                areaID: data.area,
                summary: data.summary,
                emergency: data.emergency ? true : false,
                description: data.description,
                inAreaTime: data.inAreaTime ? moment(data.inAreaTime) : null,
                workflowID: data.technician ? 3 : 2,
                createdBy: this.state.cValue.userInfo.username
            },
            reportImage: data.fileList
        }
        await this.MyTroubleService.create(item).then(res => {
            // debugger
            if (res.status === 200) {
                this.Notification.success(MESSAGE.SAVED_SUCCESS);
            }
            else {
                this.Notification.error(MESSAGE.ERROR);
            }
        });
    }

    _assignTechnician = async (data) => {
        await this.MyTroubleService.changeTechnician({
            createdBy: this.state.cValue?.userInfo?.username, reportID: data.id, technician: data.technician
        }).then(res => {
            if (res?.status == 200) {
                this.Notification.success("Change technician successfully.");
            }
            else {
                this.Notification.error(res?.data?.message);
            }
        })
    }

    validate(type) {
        // var isValid = true;
        var data = { ...this.state.data };
        // debugger
        if (type === 1) {
            const [isValid, errors] = validateEmpty(data, ["summary", "fileList"]);
            if (!isValid) {
                focusInvalidInput(errors);
            }

            this.setState({
                errors
            });
            return isValid;
        }
        else {
            const [isValid, errors] = validateEmpty(data, ["summary", "fileList",
                "status", "technician", "category", "priority", "isResolved"]);
            if (!isValid) {
                focusInvalidInput(errors);
            }

            this.setState({
                errors
            });
            return isValid;
        }


    }

    handleChangeImage = (fileList, fileName) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };
        data[fileName] = fileList;
        console.log(fileList, fileName);
        this.setState({
            data: data,
            errors: {
                ...errors,
                fileList: ''
            }
        });
    };

    handleRemove = async (file, fileName) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };
        let removedFiles = [...this.state.removedFiles];
        console.log(data, file, 'check31927');
        // return;
        if (data.fileList.length === 1 && fileName === 'fileList') {
            this.setState({
                errors: {
                    ...errors,
                    fileList: 'Requires at least one image'
                }
            })
            return false;
        } else {
            removedFiles.push(file.uid);
            console.log(removedFiles, 'checkkkkk 123');
            this.setState({
                removedFiles
            });
        }
        // return;        
    }

    onChangeDate = (value) => {
        let data = { ...this.state.data };
        data.inAreaTime = value ? moment(value, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : null;
        this.setState({ data: data });
    }

    onChangeStatus = (name, value) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };

        data[name] = value?.value;
        if (value.value !== 5) {
            errors.priority = '';
            errors.category = '';
        }

        this.setState({
            data,
            errors
        })

    }

    render() {
        const data = this.state.trouble;
        let dataPermission = this.state.data.permission;
        const priority = [
            { id: 1, name: 'Low' }, { id: 2, name: 'Medium' }, { id: 3, name: 'High' }
        ];

        if (this.state.data.currentStatus && this.state.data.currentStatus === 6) {
            this.state.data.currentStatus = undefined;
            this.Notification.error('Báo cáo này đã bị huỷ/ This report has been cancelled!');
            return <Navigate to='/trouble'></Navigate>
        }
        // let checkDisabled = this.state.data.permission.reporter && this.state.data.currentStatus !== 2;
        return (
            data.report ?
                <>
                    {/* <Col> */}
                    <Form layout="vertical" className="form-display">

                        <div className="container">
                            <Row>
                                <Col
                                    style={{ marginBottom: "10px" }}
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={12}
                                    xl={12}>
                                    <HeaderPannel
                                        // classNameCustom="create-trouble"
                                        title={trans('trouble:detailTrouble.title')}
                                        breadcrumbList={[trans('trouble:detailTrouble.trouble'), trans('trouble:detailTrouble.troubleDetail'), this.state.param]}
                                        buttons={[
                                            {
                                                title: trans('common:update'),
                                                classNameCustom: 'submit',
                                                action: () => this.handleClickSubmit,
                                                disabled: (this.state.data.currentStatus === 5 || (this.state.data.permission.reporter && this.state.data.currentStatus > 2) || (!this.state.data.permission.manager && !this.state.data.permission.technician))
                                            },
                                            {
                                                title: trans('common:update'),
                                                classNameCustom: 'submit',
                                                action: () => this.handleClickSubmit,
                                                disabled: (!this.state.data.permission.reporter || this.state.data.permission.manager || this.state.data.permission.technician)
                                            }
                                        ]}
                                    />
                                </Col>
                                <Col xs={12} sm={12} md={12} lg={12} xl={6} style={{ marginBottom: "10px" }}>
                                    <div className="detail-campus-form border-form padding-pannel">
                                        <Row>
                                            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                <Image
                                                    src={locationIcon}
                                                    preview={false}
                                                    width={20}
                                                ></Image>
                                            </Col>
                                            <Col xs={12} sm={4} md={4} lg={4} xl={4}>
                                                <Label><b>{trans('trouble:detailTrouble.campus')} </b> {data.report.campusName} </Label>
                                            </Col>
                                            <Col xs={12} sm={4} md={4} lg={4} xl={4}>
                                                <Label><b>{trans('trouble:detailTrouble.location')} </b> {data.report.locationCode} </Label>
                                            </Col>
                                            <Col xs={12} sm={4} md={4} lg={4} xl={4}>
                                                <Label><b>{trans('trouble:detailTrouble.roomArea')} </b> {data.report.areaName} </Label>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                                <Col xs={12} sm={12} md={12} lg={12} xl={6} style={{ marginBottom: "10px" }}>
                                    <div className="progress-trouble-container border-form padding-pannel">
                                        <Row style={{ height: '24px' }}>
                                            <Col>
                                                {data.report.sla > 24 ? <Tag style={{ fontSize: '15px' }} color='geekblue'>{trans('trouble:detailTrouble.overTime')}</Tag> : ''}
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <div className="progress-trouble">
                                                    <Steps
                                                        size="small"
                                                        current={data.report.step - 1}
                                                        type='navigation'
                                                        className='site-navigation-steps'
                                                    >
                                                        {
                                                            this.state.workflow ? this.state.workflow.map((item, index) => {
                                                                switch (item.step) {
                                                                    case 1:
                                                                        return (
                                                                            <Step key={index} title={item.stepName} description={data.report.createdBy} />
                                                                        );
                                                                    case 2:
                                                                        return (
                                                                            <Step key={index} title={item.stepName} description={data.shooting?.technician} />
                                                                        );
                                                                    default:
                                                                        if (item.step > 0 && item.step < 5) {
                                                                            return (
                                                                                <Step key={index} title={item.stepName} />
                                                                            )
                                                                        }

                                                                }
                                                            })
                                                                :
                                                                null
                                                        }
                                                    </Steps>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                                <Col xs={12} sm={12} md={12} lg={6} xl={6} style={{ marginBottom: "10px" }}>
                                    <div className="infor-detail-report border-form">
                                        <div className="trouble-report-header header-pannel title">{trans('trouble:detailTrouble.troubleReport')}</div>
                                        <div className="trouble-report-form padding-pannel">
                                            <Row>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <div className="asset-type">
                                                        <Form.Item
                                                            required="true"
                                                            label={trans('trouble:detailTrouble.summary')}
                                                            help={this.state.errors.summary}
                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.summary)}
                                                        >
                                                            <TextArea
                                                                id="summary"
                                                                autoSize={{ minRows: 1, maxRows: 3 }}
                                                                placeholder=""
                                                                maxLength={100}
                                                                showCount
                                                                defaultValue={this.state.data.summary}
                                                                value={this.state.data.summary}
                                                                onChange={e => onChangeValue(this, 'summary', e.target.value)}
                                                                disabled={!this.state.data.permission.reporter}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                                    <div className="area-time">
                                                        <Form.Item
                                                            // required="true"
                                                            label={trans('trouble:detailTrouble.inAreaTime')}
                                                            help={this.state.errors.inAreaTime}
                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.inAreaTime)}
                                                        >
                                                            {
                                                                // this.state.data.permission.reporter ?
                                                                <DatePicker
                                                                    id="inAreaTime"
                                                                    showTime={true}
                                                                    disabledDate={current => (moment(current) > moment().add(1, 'months') || moment(current) < moment().subtract(1, 'day'))}
                                                                    value={this.state.data.inAreaTime ?
                                                                        moment(this.state.data.inAreaTime, 'YYYY-MM-DD HH:mm:ss') : null}
                                                                    onChange={(e, timeString) => this.onChangeDate(timeString)}
                                                                    disabled={!this.state.data.permission.reporter}
                                                                    format='DD/MM/YYYY HH:00:00'
                                                                />
                                                                // :
                                                                // <Input
                                                                //     readOnly={true}
                                                                //     value={this.state.data.inAreaTime ? moment(this.state.data.inAreaTime).format('DD/MM/YYYY HH:mm:ss') : ''}
                                                                // />
                                                            }
                                                        </Form.Item>
                                                    </div>
                                                </Col>
                                                {/* <Col span={6}></Col> */}
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <div className="emergency-status">
                                                        <Form.Item
                                                        >
                                                            {trans('trouble:detailTrouble.emergency')}
                                                            <Checkbox
                                                                checked={this.state.data.emergency}
                                                                onChange={e => onChangeValue(this, 'emergency', e.target.checked)}
                                                                style={{ marginLeft: "15px" }}
                                                                disabled={!this.state.data.permission.reporter}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <div className="more-description">
                                                        <Form.Item
                                                            label={trans('trouble:detailTrouble.description')}
                                                            help={this.state.errors.description}
                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.description)}
                                                        >
                                                            <div className="asset-status-option1">
                                                                <TextArea
                                                                    value={this.state.data.description}
                                                                    onChange={e => onChangeValue(this, 'description', e.target.value)}
                                                                    autoSize={{ minRows: 4, maxRows: 7 }}
                                                                    maxLength={400}
                                                                    showCount
                                                                    disabled={!this.state.data.permission.reporter}
                                                                />
                                                            </div>
                                                        </Form.Item>
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <div className="issue-image">
                                                        <Form.Item
                                                            id="fileList"
                                                            label={trans('trouble:detailTrouble.imageDescription')}
                                                            required={true}
                                                            help={this.state.errors.fileList}
                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.fileList)}
                                                        >
                                                            <div className="issue-image-upload">
                                                                <UploadImage
                                                                    fileList={this.state.data.fileList}
                                                                    handleChangeImage={this.handleChangeImage}
                                                                    handleRemove={this.handleRemove}
                                                                    fileName='fileList'
                                                                    maxCount={8}
                                                                    disabled={!this.state.data.permission.reporter}
                                                                />
                                                            </div>
                                                        </Form.Item>
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ height: '20px' }}></Col>
                                            </Row>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} sm={12} md={12} lg={6} xl={6} style={{ marginBottom: "10px" }}>
                                    <div className="infor-trouble-resolve border-form" style={{ height: "100%" }}>
                                        <div className="trouble-resolve-header header-pannel title">{trans('trouble:detailTrouble.troubleShooting')}</div>
                                        <div className="trouble-resolve-form padding-pannel">
                                            <Row>
                                                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                                    <Form.Item
                                                        required="true"
                                                        label={trans('trouble:detailTrouble.changeStatus')}
                                                        help={this.state.errors.status}
                                                        validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.status)}
                                                    >
                                                        <Select
                                                            mode={"combobox"}
                                                            onChange={(e, value) => this.onChangeStatus('status', value)}
                                                            placeholder={trans('trouble:detailTrouble.changeStatusPlaceholder')}
                                                            style={{ width: '100%' }}
                                                            value={this.state.data.status}
                                                            disabled={!(this.state.data.permission.technician || this.state.data.permission.manager) || this.state.data.currentStatus === 5}
                                                        >
                                                            {
                                                                this.state.workflow ? this.state.workflow.map((item, index) => {
                                                                    if (item.step >= data.report.step) {
                                                                        if (data.report.step === 1) {
                                                                            if (item.step === 5 || item.step === data.report.step) {
                                                                                return <Select.Option key={index} value={item.id}> {item.stepName}</Select.Option>
                                                                            }
                                                                        } else {
                                                                            if (dataPermission.manager) {
                                                                                if (item.step === 3 || item.step === 4) {
                                                                                    // console.log(item, data.report.step);
                                                                                    return <Select.Option disabled={true} key={index} value={item.id}> {item.stepName}</Select.Option>
                                                                                }
                                                                            }
                                                                            return <Select.Option key={index} value={item.id}> {item.stepName}</Select.Option>
                                                                        }
                                                                    }
                                                                })
                                                                    : null
                                                            }
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                                    <Form.Item
                                                        required="true"
                                                        label={trans('trouble:detailTrouble.assignTech')}
                                                        help={this.state.errors.technician}
                                                        validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.technician)}
                                                    >
                                                        <SelectCustom
                                                            id="technician"
                                                            onChange={(e, value) => onChangeSelectBoxValue(this, 'technician', value)}
                                                            // defaultValue="Student1212"
                                                            placeholder={trans('trouble:detailTrouble.assignTechPlaceholder')}
                                                            value={this.state.data.technician}
                                                            defaultValue={this.state.data.technician}
                                                            options={this.state.technician}
                                                            keyValue={'userName'}
                                                            label={'userName'}
                                                            disabled={!this.state.data.permission.manager || this.state.data.currentStatus === 5}
                                                        />

                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                                    <Form.Item
                                                        required={this.state.data.status === 5}
                                                        label={trans('trouble:detailTrouble.category')}
                                                        help={this.state.errors.category}
                                                        validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.category)}
                                                    >
                                                        <SelectCustom
                                                            id="category"
                                                            onChange={(e, value) => onChangeValue(this, 'category', e)}
                                                            // defaultValue="Student1212"
                                                            placeholder={trans('trouble:detailTrouble.categoryPlaceholder')}
                                                            value={this.state.data.category}
                                                            // defaultValue={this.state.data.category > 0 ? this.state.data.category : null}
                                                            options={this.state.category}
                                                            keyValue="id"
                                                            disabled={!(this.state.data.permission.technician || this.state.data.permission.manager) || this.state.data.currentStatus === 5}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                                                    <Form.Item
                                                        required={this.state.data.status === 5}
                                                        label={trans('trouble:detailTrouble.priority')}
                                                        help={this.state.errors.priority}
                                                        validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.priority)}
                                                    >
                                                        <SelectCustom
                                                            id="priority"
                                                            onChange={(e, value) => onChangeValue(this, 'priority', e)}
                                                            // defaultValue="Student1212"
                                                            placeholder={trans('trouble:detailTrouble.priorityPlaceholder')}
                                                            value={this.state.data.priority}
                                                            // defaultValue={this.state.data.priority > 0 ? this.state.data.priority : null}
                                                            options={priority}
                                                            keyValue="id"
                                                            disabled={!(this.state.data.permission.technician || this.state.data.permission.manager) || this.state.data.currentStatus === 5}
                                                        // label='name'                                                        
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <Form.Item
                                                        style={{ display: 'flex', }}
                                                        required="true"
                                                        help={this.state.errors.isResolved}
                                                        validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.isResolved)}

                                                    >
                                                        <Radio.Group
                                                            onChange={e => onChangeValue(this, 'isResolved', e.target.value)}
                                                            defaultValue={false}
                                                            value={this.state.data.isResolved}>

                                                            <Radio value={true}
                                                                disabled={!this.state.data.permission.technician || this.state.data.currentStatus === 5}
                                                            >{trans('trouble:detailTrouble.resolve')}</Radio>
                                                            <Radio value={false}
                                                                disabled={!this.state.data.permission.technician || this.state.data.currentStatus === 5}
                                                            >{trans('trouble:detailTrouble.none')}</Radio>
                                                        </Radio.Group>
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <Form.Item
                                                        label={trans('trouble:detailTrouble.issueReview')}
                                                        help={this.state.errors.issueReview}
                                                        validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.issueReview)}
                                                    >
                                                        <TextArea
                                                            value={this.state.data.issueReview}
                                                            onChange={e => onChangeValue(this, 'issueReview', e.target.value)}
                                                            autoSize={{ minRows: 2, maxRows: 5 }}
                                                            maxLength={400}
                                                            showCount
                                                            defaultValue={this.state.data.issueReview}
                                                            disabled={!this.state.data.permission.technician || this.state.data.currentStatus === 5}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <Form.Item
                                                        label={trans('trouble:detailTrouble.solution')}
                                                        help={this.state.errors.solution}
                                                        validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.solution)}
                                                    >
                                                        <TextArea
                                                            value={this.state.data.solution}
                                                            onChange={e => onChangeValue(this, 'solution', e.target.value)}
                                                            autoSize={{ minRows: 3, maxRows: 8 }}
                                                            // row={3}
                                                            disabled={!this.state.data.permission.technician || this.state.isStatus5}
                                                            defaultValue={this.state.data.solution}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <div className="resolve-image">
                                                        <Form.Item
                                                            id="fileListResolveImage"
                                                            label={trans('trouble:detailTrouble.imageDescription')}
                                                            help={this.state.errors.fileListResolveImage}
                                                            validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.fileListResolveImage)}
                                                        >
                                                            <div className="issue-image-upload">
                                                                <UploadImage
                                                                    fileList={this.state.data.fileListResolveImage}
                                                                    handleChangeImage={this.handleChangeImage}
                                                                    handleRemove={this.handleRemove}
                                                                    fileName='fileListResolveImage'
                                                                    disabled={!(this.state.data.permission.technician
                                                                        && this.state.data.currentStatus < 5 && this.state.data.currentStatus >= 3)}
                                                                />
                                                            </div>
                                                        </Form.Item>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <div className="infor-detail-report border-form">
                                            <div className="trouble-report-header header-pannel title">{trans('trouble:detailTrouble.historyOfChange')}</div>
                                            <div className="trouble-report-form padding-pannel">
                                                <Timeline id="history">
                                                    {
                                                        this.state.history ? this.state.history.map((item, key) => {
                                                            return (
                                                                <Timeline.Item key={key}>
                                                                    <p>[{moment(item.created).format('DD/MM/YYYY HH:mm:ss')}]
                                                                        &nbsp;<b>{item.changeContent}</b></p>

                                                                    {item.changeDetail}
                                                                </Timeline.Item>
                                                            )
                                                        })
                                                            : null
                                                    }
                                                </Timeline>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Form>

                    {/* </Col> */}
                    {
                        this.state.redirect ?
                            <Navigate to='/trouble'></Navigate>
                            : null
                    }
                </>
                :
                (this.state.isNotFound ?
                    <NotFound />
                    : null
                )
        );
    }

};

export default withTranslation(['trouble', 'common'])(TroubleDetail);
