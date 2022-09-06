import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Common.css';
import {
    Input, Form, Radio
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
import { withTranslation } from 'react-i18next';

const types = [{ id: 1, name: 'Weekly' }, { id: 2, name: 'Daily' }];

class CreateTemplatePopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                name: null,
                campus: 1,
                campusSelect: [],
                location: 1,
                locationSelect: []
            },
            errors: {},
            cValue: JSON.parse(localStorage.getItem('cont')),
            locations: [],
            campuses: [],
            types: []
        };
        this.Notification = new Notification();
        this.service = new ChecklistService();
        this.LocationService = new LocationService();
        this.CampusService = new CampusService();
    }

    componentDidMount() {
        this.loadCampus();
        this.loadLocation();
        let options = this.props.options;
        this.loadTemp(options.data);
        this.setState({
            errors: {},
            action: options.action,
        });
    }

    loadLocation = async () => {
        let updateData = { ...this.state.data };
        if (updateData.campus === 2 && updateData.campusSelect.length > 0) {
            var arr = [];
            updateData.campusSelect.forEach(elm => {
                arr.push(elm.value ? elm.value : elm);
            })
            updateData.campusSelect = arr;
            var res = await this.LocationService.getListByCampus({ campus: updateData.campusSelect });
            this.setState({ locations: res?.data?.listData, data: updateData });
        }
        else {
            var res = await this.LocationService.getAll();
            this.setState({ locations: res?.data?.listData });
        }
    }

    loadCampus = async () => {
        await this.CampusService.getAll().then(res => {
            this.setState({ campuses: res?.data?.listData });
        })
    }

    loadTemp = async (data) => {
        if (data?.tempId) {
            await this.service.getTemplate(data?.tempId).then(res => {
                if (res && res.status === 200 && res.data?.data) {
                    let updateData = res.data?.data;

                    this.setState({
                        data: {
                            id: updateData.id,
                            name: updateData.name,
                            typeID: updateData.typeID,
                            campus: updateData.effectCampus === 'All' ? 1 : 2,
                            campusSelect: updateData.effectCampus === 'All' ? [] : updateData.effectCampuses,
                            location: updateData.effectLocation === 'All' ? 1 : 2,
                            locationSelect: updateData.effectLocation === 'All' ? [] : updateData.effectLocations
                        }
                    });
                    setTimeout(() => {
                        this.loadLocation();
                    }, 300);

                }

            })
        }
    }

    componentDidUpdate(prevProps) {
        let options = this.props.options;
        if (options?.data !== prevProps.options?.data) {
            // options.campus.shift();
            // options.location.shift();
            if (options.action === ACTION.UPDATE || options.action === ACTION.VIEW) {
                this.setState({
                    action: options.action,
                    errors: {}
                });
                this.loadTemp(options.data)
            } else if (options.action === ACTION.CREATE) {
                this.setState({
                    data: {
                        name: null,
                        campus: 1,
                        campusSelect: [],
                        location: 1,
                        locationSelect: []
                    },
                    errors: {},
                    action: options.action
                })

            }
        }
    }

    onCancel = () => {
        this.props.options.onCancel(this.state.data);
    }

    validate() {
        // var isValid = true;
        var data = { ...this.state.data };
        var requireds = ["name", "typeID"];
        if (data.campus === 2) {
            requireds.push("campusSelect");
        }
        if (data.location === 2) {
            requireds.push("locationSelect");
        }
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
        var arr = [];
        if (data.campusSelect) {
            data.campusSelect.forEach(elm => {
                arr.push(elm.value ? elm.value : elm);
            });
        }

        var loc = [];
        if (data.locationSelect) {
            data.locationSelect.forEach(elm => {
                loc.push(elm.value ? elm.value : elm);
            });
        }

        let params = {
            effectCampuses: arr,
            effectLocations: loc,
            typeID: data.typeID,
            name: data.name,
            id: data.id ? data.id : 0
        }
        this.props.options.onComplete(params);

    }

    handleFocusCheckRadio(name, value) {
        let data = { ...this.state.data };
        if (this.state.data[name] === value) {
            return;
        } else {
            this.setState({
                data: {
                    ...data,
                    [name]: value
                }
            });
        }
    }

    onChangeValueCustom = (name, refName, value) => {
        const data = { ...this.state.data };
        const errors = { ...this.state.errors };
        data[name] = value;
        data[refName] = [];
        errors[refName] = '';

        this.setState({
            data,
            errors
        })
    }

    render() {
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
                                label={trans('checklist:createTemplate.templateName')}
                                required={true}
                                help={this.state.errors.name}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.name)}
                            >
                                <Input
                                    id="name"
                                    placeholder='Nhập tên mẫu'
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
                                label={trans('checklist:createTemplate.checklistType')}
                                required={true}
                                help={this.state.errors.typeID}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.typeID)}
                            >
                                <SelectCustom
                                    id="typeID"
                                    placeholder={trans('checklist:createTemplate.checklistTypePlaceholder')}
                                    onChange={(e) => onChangeValue(this, 'typeID', e)}
                                    value={this.state.data.typeID}
                                    options={types}
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
                                style={{ display: 'flex' }}
                                required="true"
                                label={trans('checklist:createTemplate.effectCampus')}
                                help={this.state.errors.effectArea}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.effectArea)}
                            >
                                <Radio.Group onChange={e => {
                                    this.onChangeValueCustom('campus', 'campusSelect', e.target.value);
                                    setTimeout(() => {
                                        this.loadLocation();
                                    }, 200);
                                }}
                                    value={this.state.data.campus}>
                                    <Radio value={1}>{trans('checklist:createTemplate.allCampus')}</Radio>
                                    <Radio value={2}>{trans('checklist:createTemplate.onlyCampus')}</Radio>
                                </Radio.Group>

                                <Form.Item
                                    style={{ display: 'flex', }}
                                    help={this.state.errors.campusSelect}
                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.campusSelect)}
                                >
                                    <SelectCustom
                                        id="campusSelect"
                                        onChange={(e, value) => {
                                            onChangeValue(this, 'campusSelect', value);
                                            setTimeout(() => {
                                                this.loadLocation();
                                            }, 200);
                                        }}
                                        placeholder={trans('checklist:createTemplate.campusPlaceholder')}
                                        mode="tags"
                                        value={this.state.data.campusSelect}
                                        options={this.state.campuses}
                                        keyValue='name'
                                        onFocus={() => this.handleFocusCheckRadio('campus', 2)}
                                    />
                                </Form.Item>

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
                                label={trans('checklist:createTemplate.effectLocation')}
                                help={this.state.errors.effectArea}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.effectArea)}
                            >
                                <Radio.Group onChange={e => {
                                    this.onChangeValueCustom('location', 'locationSelect', e.target.value);
                                }}
                                    value={this.state.data.location}>
                                    <Radio value={1}>{trans('checklist:createTemplate.allLocation')}</Radio>
                                    <Radio value={2}>{trans('checklist:createTemplate.onlyLocation')}</Radio>
                                </Radio.Group>

                                <Form.Item
                                    style={{ display: 'flex', }}
                                    help={this.state.errors.locationSelect}
                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.locationSelect)}
                                >
                                    <SelectCustom
                                        id="buildingSelect"
                                        onChange={(e, value) => {
                                            onChangeValue(this, 'locationSelect', value);
                                        }}
                                        placeholder={trans('checklist:createTemplate.locationPlaceholder')}
                                        mode="tags"
                                        value={this.state.data.locationSelect}
                                        options={this.state.locations}
                                        keyValue='code'
                                        lable='code'
                                        onFocus={() => this.handleFocusCheckRadio('location', 2)}
                                    />
                                </Form.Item>

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
                            {
                                this.state.action === ACTION.VIEW ? null :
                                    <div className="button button-submit" onClick={this.onSubmit}>
                                        {trans('common:button.submit')}
                                    </div>
                            }

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
                                {trans('common:button.cancel')}
                            </div>
                        </Col>
                    </Row>
                </Form>
            </>
        );
    }

};

export default withTranslation(['checklist', 'common'])(CreateTemplatePopup);
