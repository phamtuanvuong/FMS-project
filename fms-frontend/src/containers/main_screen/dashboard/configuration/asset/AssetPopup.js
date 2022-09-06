import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../../layout/Common.css';
import {
    Input, Form, DatePicker, InputNumber
} from 'antd';
import 'antd/dist/antd.min.css';
import { ACTION, MESSAGE, STATUS } from '../../../../../constants/Constants';
import { AssetService } from '../../../../../services/main_screen/configuration/AssetService';
import '../../../../../layout/Configuration.css';
import {
    onChangeValue,
    isUndefindOrEmptyForItemForm,
    focusInvalidInput,
    validateEmpty,
    trans
} from '../../../../../components/CommonFunction';
import { Notification } from "../../../../../components/Notification";
import SelectCustom from '../../../../../components/SelectCustom';
import '../../../../../layout/customModal.css';
import moment from 'moment';
import { withTranslation } from 'react-i18next';

class AssetPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            errors: {},
            noticeLocation: trans("configuration:assest.noticeLocation"),
            noticeAreaRoom: trans("configuration:assest.noticeAreaRoom"),
            unit: [
                {
                    id: 1,
                    name: "Máng"
                },
                {
                    id: 2,
                    name: "Cái"
                }
            ],
            cValue: JSON.parse(localStorage.getItem('cont')),
        };
        this.Notification = new Notification();
        this.service = new AssetService();
    }

    componentDidMount = async () => {
        let options = this.props.options;

        if (options.action === ACTION.UPDATE) {
            this.setState({
                data: options.data,
                noticeLocation: "",
                noticeAreaRoom: "",
            });
            this.loadSelectLocation(options.data.campusName);
            this.loadSelectArea(options.data.campusName, options.data.locationCode);
        } else if (options.action === ACTION.CREATE) {
            this.setState({
                location: null,
                areaRoom: null,
                noticeLocation: trans("configuration:assest.noticeLocation"),
            noticeAreaRoom: trans("configuration:assest.noticeAreaRoom")
            });
        }
        var res = await this.service.getMeasureUnits();
        this.setState({
            campus: options.campus,
            category: options.category,
            errors: {},
            action: options.action,
            unit: res.data?.listData
        })
    }

    componentDidUpdate(prevProps) {
        let options = this.props.options;

        if (options.data !== prevProps.options?.data) {
            // options.campus.shift();
            // options.location.shift();
            if (options.action === ACTION.UPDATE) {
                this.setState({
                    data: options.data,
                    action: options.action,
                    location: null,
                    campus: options.campus,
                    category: options.category,
                    errors: {},
                    noticeLocation: "",
                    noticeAreaRoom: "",
                    areaRoom: null
                });
                this.loadSelectLocation(options.data.campusName);
                this.loadSelectArea(options.data.campusName, options.data.locationCode);
            } else if (options.action === ACTION.CREATE) {
                this.setState({
                    data: {},
                    errors: {},
                    location: null,
                    campus: options.campus,
                    action: options.action,
                    category: options.category,
                    areaRoom: null,
                    noticeLocation: trans("configuration:assest.noticeLocation"),
            noticeAreaRoom: trans("configuration:assest.noticeAreaRoom")
                });
            }
        }
    }

    onCancel = () => {
        this.props.options.onCancel(this.state.data);
    }

    validate() {
        // var isValid = true;
        var data = { ...this.state.data };
        const [isValid, errors] = validateEmpty(data, ["campusName", "locationCode", "areaID", "name",
            "code", "categoryID", "measureUnitID", "quantity", "startDate"]);
        if (!isValid) {
            focusInvalidInput(errors);
        }

        this.setState({
            errors
        });
        return isValid;
    }

    onSubmit = async () => {
        if (!this.validate()) {
            return;
        }

        let data = { ...this.state.data };
        let startDate = moment(data.startDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        let endDate = moment(data.endDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        if (endDate === "Invalid date") {
            endDate = null;
        }

        data.startDate = startDate;
        data.endDate = endDate;

        let userInfo = this.context.userInfo ? this.context.userInfo : this.state.cValue.userInfo;


        for (let item in data) {
            if (typeof data[item] === "string") {
                data[item] = data[item].trim();
            }
        }
        if (this.state.action === ACTION.CREATE) {
            data.created = moment().format('YYYY-MM-DD');
            data.createdBy = userInfo.username;
        } else if (this.state.action === ACTION.UPDATE) {
            data.updated = moment().format('YYYY-MM-DD');
            data.updatedBy = userInfo.username;
        }

        this.props.options.onComplete(data);
    }

    loadSelectLocation = async (value) => {
        let resListLocation = await this.service.getListLocation({
            "paging": {
                "currentPage": 1,
                "pageSize": 99999999,
                "rowsCount": 0
            },
            "campus": value,
            "locationCode": null
        });

        if (resListLocation.data && resListLocation.data.status === STATUS.SUCCESS) {
            let location = resListLocation.data.listData;
            this.setState({
                location
            })
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    loadSelectArea = async (campus, location) => {
        let resListAreaRoom = await this.service.getListAreaRoom({
            "paging": {
                "currentPage": 1,
                "pageSize": 99999999,
                "rowsCount": 0
            },
            "campus": campus,
            "locationCode": location,
            "roomCode": null
        });

        if (resListAreaRoom.data.status === STATUS.SUCCESS) {
            let areaRoom = resListAreaRoom.data.listData;
            this.setState({
                areaRoom
            });
        } else {
            this.Notification.error(MESSAGE.EROR);
        }
    }

    onChangeValueCampus = async (name, value) => {
        let data = this.state.data;
        let errors = this.state.errors;

        let noticeLocation = '';
        if(!value) {
            noticeLocation = trans("configuration:assest.noticeLocation")
        }
        this.setState({
            data: {
                ...data,
                [name]: value,
                locationCode: null,
                areaID: null,
            },
            errors: {
                ...errors,
                [name]: '',
                locationCode: '',
                areaID: '',
            },
            noticeLocation
        });
        this.loadSelectLocation(value || '');
    }

    onChangeValueLocation = async (name, value) => {
        let data = this.state.data;
        let errors = this.state.errors;
        let campusName = this.state.data.campusName || "";

        let noticeAreaRoom = '';
        if(!value) {
            noticeAreaRoom = trans("configuration:assest.noticeAreaRoom")
        }
        this.setState({
            data: {
                ...data,
                [name]: value,
                areaID: null
            },
            errors: {
                ...errors,
                [name]: '',
                areaID: ''
            },
            noticeAreaRoom
        });
        this.loadSelectArea(campusName, value || '');
    }

    disabledFromDate = (current) => {
        // Can not select days before today and today
        // console.log('data = ', current);
        if (this.state.data.endDate) {
            return moment(current, 'DD/MM/YYYY') >= moment(this.state.data.endDate, 'DD/MM/YYYY');
        }
        return '';
    };

    disabledToDate = (current) => {
        // Can not select days before today and today
        // console.log('data = ', current);
        if (this.state.data.startDate) {
            return moment(current, 'DD/MM/YYYY') <= moment(this.state.data.startDate, 'DD/MM/YYYY');
        }
        return '';
    };

    render() {
        // console.log('render')
        return (
            <>
                <Form layout="vertical">
                    <Row>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                label={trans("configuration:assest.campus")}
                                required={true}
                                help={this.state.errors.campusName}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.campusName)}
                            >
                                <SelectCustom
                                    id="campusName"
                                    placeholder={trans("configuration:assest.selectCampus")}
                                    onChange={(e, value) => this.onChangeValueCampus('campusName', e)}
                                    value={this.state.data.campusName}
                                    options={this.state.campus}
                                    keyValue={'name'}
                                />
                            </Form.Item>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                label={trans("configuration:assest.location")}
                                required={true}
                                help={this.state.errors.locationCode || this.state.noticeLocation}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.locationCode)}
                            >
                                <SelectCustom
                                    id="locationCode"
                                    placeholder={trans("configuration:assest.selectLocation")}
                                    onChange={(e, value) => this.onChangeValueLocation('locationCode', e)}
                                    value={this.state.data.locationCode}
                                    options={this.state.location}
                                    lable="code"
                                    keyValue="code"
                                />
                            </Form.Item>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                label={trans("configuration:assest.room")}
                                required={true}
                                help={this.state.errors.areaID || this.state.noticeAreaRoom}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.areaID)}
                            >
                                <SelectCustom
                                    id="areaID"
                                    placeholder={trans("configuration:assest.selectAreaRoom")}
                                    onChange={(e) => onChangeValue(this, 'areaID', e)}
                                    value={this.state.data.areaID}
                                    options={this.state.areaRoom}
                                />
                            </Form.Item>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >
                            <Form.Item
                                label={trans("configuration:assest.assetName")}
                                required={true}
                                help={this.state.errors.name}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.name)}
                            >
                                <Input
                                    id="name"
                                    placeholder=''
                                    maxLength={100}
                                    showCount
                                    value={this.state.data?.name}
                                    onChange={e => onChangeValue(this, 'name', e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                label={trans("configuration:assest.assetCode")}
                                required={true}
                                help={this.state.errors.code}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.code)}
                            >
                                <Input
                                    id="code"
                                    placeholder=''
                                    maxLength={30}
                                    showCount
                                    value={this.state.data?.code}
                                    onChange={e => onChangeValue(this, 'code', e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                label={trans("configuration:assest.category")}
                                required={true}
                                help={this.state.errors.categoryID}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.categoryID)}
                            >
                                <SelectCustom
                                    id="categoryID"
                                    placeholder={trans("configuration:assest.selectCategory")}
                                    onChange={(e) => onChangeValue(this, 'categoryID', e)}
                                    value={this.state.data.categoryID}
                                    options={this.state.category}
                                />
                            </Form.Item>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                label={trans("configuration:assest.unit")}
                                required={true}
                                help={this.state.errors.measureUnitID}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.measureUnitID)}
                            >
                                <SelectCustom
                                    id="measureName"
                                    placeholder={trans("configuration:assest.selectUnit")}
                                    onChange={(e) => onChangeValue(this, 'measureUnitID', e)}
                                    value={this.state.data.measureUnitID}
                                    options={this.state.unit}
                                    keyValue="id"
                                />
                            </Form.Item>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                label={trans("configuration:assest.quantity")}
                                required={true}
                                help={this.state.errors.quantity}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.quantity)}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    id="quantity"
                                    min={1}
                                    max={10000000}
                                    placeholder=''
                                    value={this.state.data.quantity}
                                    onChange={(e) => onChangeValue(this, 'quantity', e)} />
                            </Form.Item>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                label={trans("configuration:assest.startDate")}
                                required={true}
                                help={this.state.errors.startDate}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.startDate)}
                            >
                                <DatePicker
                                placeholder=''
                                    id="startDate"
                                    disabledDate={this.disabledFromDate}
                                    value={this.state.data.startDate ? moment(this.state.data.startDate, 'DD/MM/YYYY') : null}
                                    onChange={(e, timeString) => onChangeValue(this, 'startDate', timeString)} format='DD/MM/YYYY' />
                            </Form.Item>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                label={trans("configuration:assest.endDate")}
                                help={this.state.errors.endDate}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.endDate)}
                            >
                                <DatePicker
                                placeholder=''
                                    disabledDate={this.disabledToDate}
                                    value={this.state.data.endDate ? moment(this.state.data.endDate, 'DD/MM/YYYY') : null}
                                    onChange={(e, timeString) => onChangeValue(this, 'endDate', timeString)} format='DD/MM/YYYY' />
                            </Form.Item>
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

export default withTranslation(['configuration', 'common'])(AssetPopup);
