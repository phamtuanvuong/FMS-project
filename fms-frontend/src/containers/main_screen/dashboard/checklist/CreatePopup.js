import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Common.css';
import {
    Input, Form, Radio, Descriptions, DatePicker
} from 'antd';
import 'antd/dist/antd.min.css';
import { ACTION } from '../../../../constants/Constants';
import {
    onChangeValue,
    isUndefindOrEmptyForItemForm,
    focusInvalidInput,
    validateEmpty,
    trans
} from '../../../../components/CommonFunction';
import { Notification } from "../../../../components/Notification";
import SelectCustom from '../../../../components/SelectCustom';
import { LocationService } from '../../../../services/main_screen/configuration/LocationService';
import { CampusService } from '../../../../services/main_screen/configuration/CampusService';
import { ChecklistService } from '../../../../services/main_screen/checklist/ChecklistService';
import moment from "moment";
import { withTranslation } from 'react-i18next';

const types = [{ id: 1, name: 'Weekly' }, { id: 2, name: 'Daily' }];

class CreatePopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            errors: {},
            cValue: JSON.parse(localStorage.getItem('cont')),
            locations: [],
            campuses: [],
            types: [],
            basicInfo: {}
        };
        this.Notification = new Notification();
        this.service = new ChecklistService();
        this.LocationService = new LocationService();
        this.CampusService = new CampusService();
    }

    componentDidMount() {
        this.loadAllTemplate();
        let options = this.props.options;
        this.setState({
            data: {},
            errors: {},
            action: options.action,
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.options !== this.props.options) {
            let options = nextProps.options;
            this.setState({
                data: {},
                errors: {},
                action: options.action,
            });
        }
    }

    loadAllTemplate = async () => {
        // let user = { ...this.state.cValue.userInfo };
        await this.service.getAllTemp('').then(res => {
            this.setState({ temps: res?.data?.listData });
        })
    }

    loadBasicInfo = async (id) => {
        // let user = { ...this.state.cValue.userInfo };
        await this.service.getTemplateBasicInfo(id).then(res => {
            console.log(res);
            this.setState({ basicInfo: res?.data?.data });
        })
    }

    componentDidUpdate(prevProps) {
        let options = this.props.options;
        if (options?.data !== prevProps.options?.data) {
            if (options.action === ACTION.CREATE) {
                this.setState({
                    data: {},
                    errors: {},
                    basicInfo: {}
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
        var requireds = ["tempId", "fromDate", "toDate"];
        const [isValid, errors] = validateEmpty(data, requireds);
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
        var data = { ...this.state.data };
        var tempData = { ...this.state.basicInfo };
        tempData.from = data.fromDate;
        tempData.to = data.toDate;

        this.props.options.onComplete(tempData);

    }

    onChangeFilter(name, value) {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };
        data[name] = value ? moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
        errors[name] = '';
        this.setState({
            data,
            errors
        });
    }

    disabledFromDate = (current) => {
        // Can not select days before today and today
        // console.log('data = ', current);
        if (this.state.data.toDate) {
            return moment(current, 'DD/MM/YYYY') > moment(this.state.data.toDate, 'YYYY-MM-DD').endOf('day');
        }
        return '';
    };

    disabledToDate = (current) => {
        // Can not select days before today and today
        // console.log('data = ', current);
        if (this.state.data.fromDate) {
            return moment(current, 'DD/MM/YYYY') < moment(this.state.data.fromDate, 'YYYY-MM-DD');
        }
        return '';
    };

    render() {
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
                            <Form.Item
                                style={{ display: 'flex', }}
                                label={trans('checklist:createChecklistPopup.checklistTemplate')}
                                required={true}
                                help={this.state.errors.tempId}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.tempId)}
                            >
                                <SelectCustom
                                    id="id"
                                    onChange={(e, value) => {
                                        onChangeValue(this, 'tempId', value);
                                        console.log(e)
                                        this.loadBasicInfo(e || 0);
                                    }}
                                    // defaultValue="Student1212"
                                    placeholder={trans('checklist:createChecklistPopup.checklistTemplatePlaceholder')}
                                    value={this.state.data.tempId}
                                    options={this.state.temps}
                                    lable='name'
                                    keyValue='id'
                                    clear={true}
                                />
                            </Form.Item>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={12}
                        >
                            {
                                this.state.basicInfo.template ?
                                    <Descriptions title={<span>{trans('checklist:createChecklistPopup.name')}:  {this.state.basicInfo?.template?.name}</span>} bordered>
                                        <Descriptions.Item label={trans('checklist:createChecklistPopup.type')}>
                                            {this.state.basicInfo.template.typeID == 1 ? 'Weekly' : 'Daily'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={trans('checklist:createChecklistPopup.effectCampus')}>
                                            {this.state.basicInfo.template.effectCampus}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={trans('checklist:createChecklistPopup.effectLocation')}>
                                            {this.state.basicInfo.template.effectLocation}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={trans('checklist:createChecklistPopup.components')}>
                                            {
                                                this.state.basicInfo?.componentList ?
                                                    this.state.basicInfo?.componentList.map((elm, index) => {
                                                        return (
                                                            <p key={index}>{elm.name}</p>
                                                        );
                                                    })
                                                    :
                                                    null
                                            }
                                        </Descriptions.Item>
                                    </Descriptions>
                                    :
                                    null
                            }
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={6}
                            xl={6}
                        >
                            <Form.Item
                                style={{ display: 'flex' }}
                                required="true"
                                label={trans('checklist:createChecklistPopup.from')}
                                help={this.state.errors.fromDate}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.fromDate)}
                            >
                                <DatePicker disabledDate={this.disabledFromDate}
                                    onChange={(e, timeString) => this.onChangeFilter('fromDate', timeString)}
                                    value={this.state.data.fromDate ? moment(this.state.data.fromDate, 'YYYY-MM-DD') : null}
                                    format='DD/MM/YYYY'
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
                                style={{ display: 'flex' }}
                                required="true"
                                label={trans('checklist:createChecklistPopup.to')}
                                help={this.state.errors.toDate}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.toDate)}
                            >
                                {console.log(this.state.data.toDate)}
                                <DatePicker disabledDate={this.disabledToDate}
                                    onChange={(e, timeString) => this.onChangeFilter('toDate', timeString)}
                                    format='DD/MM/YYYY'
                                    value={this.state.data.toDate ? moment(this.state.data.toDate, 'YYYY-MM-DD') : null}
                                />

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
                                {trans('common:submit')}
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
                                {trans('common:cancel')}
                            </div>
                        </Col>
                    </Row>
                </Form>
            </>
        );
    }

};

export default withTranslation(['checklist', 'common'])(CreatePopup);
