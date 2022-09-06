import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../../layout/Common.css';
import {
    Input, Form
} from 'antd';
import 'antd/dist/antd.min.css';
import { ACTION } from '../../../../../constants/Constants';
import { AssetCategoryService } from '../../../../../services/main_screen/configuration/AssetCategoryService';
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

class AssetCategoryPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            errors: {}
        };
        this.Notification = new Notification();
        this.service = new AssetCategoryService();
    }

    componentDidMount() {
        let options = this.props.options;

        if (options.action === ACTION.UPDATE) {
            // console.log(options.data);
            this.setState({
                data: options.data,
            })
        }
        // options.location.shift();
        this.setState({
            errors: {},
            categoryParent: options.categoryParent,
            action: options.action
        })
    }

    componentDidUpdate(prevProps) {
        let options = this.props.options;

        if (options?.data !== prevProps.options?.data) {

            if (options.action === ACTION.UPDATE) {
                
                this.setState({
                    data: options.data,
                    action: options.action,
                    errors: {},
                    categoryParent: options.categoryParent
                })
            } else if (options.action === ACTION.CREATE) {
                this.setState({
                    data: {},
                    errors: {},
                    action: options.action,
                    categoryParent: options.categoryParent
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
        const [isValid, errors] = validateEmpty(data, ["name"]);
        if (!isValid) {
            focusInvalidInput(errors);
        }

        this.setState({
            errors
        });
        console.log(isValid)
        return isValid;
    }

    onSubmit = () => {
        if (!this.validate()) {
            return;
        }

        let userInfo = JSON.parse(localStorage.getItem('cont'))?.userInfo;
        let data = { ...this.state.data };

        for (let item in data) {
            if(typeof data[item] === "string") {
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
        console.log(data, ' check data');

        this.props.options.onComplete(data);
    }

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
                                label={trans("configuration:assetCategory.assetCategoryName")}
                                required={true}
                                help={this.state.errors.name}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.name)}
                            >
                                <Input
                                    id="name"
                                    placeholder=''
                                    maxLength={50}
                                    showCount
                                    value={this.state.data.name}
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
                                label={trans("configuration:assetCategory.parentCategory")}
                                help={this.state.errors.parentCategory}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.parentCategory)}
                            >
                                <SelectCustom
                                    id="parentName"
                                    placeholder={trans("configuration:assetCategory.selectParentCategory")}
                                    onChange={(e, value) => onChangeValue(this, 'parentCategory', e)}
                                    value={this.state.data.parentCategory}
                                    options={this.state.categoryParent}
                                    keyValue='id'
                                    clear={true}
                                // keyValue="code"
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
                                label={trans("configuration:note")}
                                help={this.state.errors.note}
                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.note)}
                            >
                                <Input
                                    id="note"
                                    placeholder=''
                                    maxLength={100}
                                    showCount
                                    value={this.state.data.note}
                                    onChange={e => onChangeValue(this, 'note', e.target.value)}
                                />
                            </Form.Item>
                        </Col>
                        {/* <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >
                            <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Col
                                    xs={12}
                                    sm={12}
                                    md={6}
                                    lg={2}
                                    xl={2}
                                >
                                    <div style={{ padding: "5px", backgroundColor: '#FFB21E', width: "90px", color: 'white', textAlign: 'center', border: '1px solid #FFB21E', height: "32px", cursor: 'pointer' }}
                                        onClick={this.onSubmit}>
                                        Submit
                                    </div>
                                </Col>
                                <Col
                                    xs={12}
                                    sm={12}
                                    md={6}
                                    lg={2}
                                    xl={1}
                                >
                                    <div style={{ padding: "5px", backgroundColor: '#fff', width: "90px", color: 'rgba(0, 0, 0, 0.85)', textAlign: 'center', border: '1px solid #d9d9d9', height: '32px', cursor: 'pointer' }}
                                        onClick={this.onCancel}>
                                        Cancel
                                    </div>
                                </Col>
                            </Row>
                        </Col> */}
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

export default withTranslation(['configuration', 'common'])(AssetCategoryPopup);
