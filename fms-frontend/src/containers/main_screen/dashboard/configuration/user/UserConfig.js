import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../../layout/Common.css';
import {
    Checkbox, Table, Button, Pagination, Input
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../../components/HeaderPannel';
import { ACTION, STATUS, MESSAGE } from '../../../../../constants/Constants';
import { UserService } from '../../../../../services/main_screen/configuration/UserService';
import '../../../../../layout/Configuration.css';
import SelectCustom from '../../../../../components/SelectCustom';
import { showDialog, hideDialog } from '../../../../../components/Dialog';
import { showConfirm, hideDialogConfirm } from '../../../../../components/MessageBox';
import UserPopup from './UserPopup';
import { Notification } from "../../../../../components/Notification";
import removeIcon from '../../../../../assets/bin.png';
import editIcon from '../../../../../assets/edit.png';
import {
    handleHideNav,
    trans
} from '../../../../../components/CommonFunction';
import { withTranslation } from 'react-i18next';
import { SettingOutlined } from '@ant-design/icons';

class UserConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columnTable: this.columnTable,
            dataTable: [],
            data: {},
            dataCreate: {},
            errors: {},
            filter: {
                paging: {
                    pageSize: 10,
                    currentPage: 1,
                    rowsCount: 0
                },
                role: null,
                campus: null,
                username: null
            },
        };
        this.Notification = new Notification();
        this.service = new UserService();
    }

    componentDidMount() {
        this.loadSelect();
        this.loadForm();
        document.querySelector('.container').addEventListener('click', handleHideNav);
    }

    loadForm = async (currentPage = 1) => {
        let filter = { ...this.state.filter };
        filter.paging.currentPage = currentPage;
        if (typeof filter.username === 'string') {
            filter.username = filter.username.trim();            
        }
        this.service.getListUser(filter).then(res => {
            if (res && res.status === 200) {
                if (res.data) {
                    filter.paging.rowsCount = res.data.paging.rowsCount;
                    let data = res.data.listData;
                    let stt = 1;
                    for (let item of data) {
                        item.stt = stt;
                        stt++;
                    }
                    this.setState({
                        dataTable: data,
                        filter: filter
                    });
                }
            } else {
                this.Notification.error(MESSAGE.ERROR);
            }
        });
    }

    loadSelect = async () => {
        const resCampus = await this.service.getAllCampusNoCondition();
        const resRole = await this.service.getAllRole();
        if ((resCampus || resRole) && (resCampus.data.status === STATUS.SUCCESS || resRole.data.status === STATUS.SUCCESS)) {
            let campus = resCampus?.data?.listData;
            let role = resRole?.data?.listData;
            this.setState({
                campus,
                role
            });
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

  

    onCheckIsActive = async (value, dataRow) => {
        let resIsActive = await this.service.changeIsActive({
            userName: dataRow.userName,
            isActive: value
        });
        if (resIsActive && resIsActive.data.status === STATUS.SUCCESS) {
            let filter = { ...this.state.filter };
            this.Notification.success("Change in service successfully.")
            this.loadForm(filter.paging.currentPage);
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    renderColumnCheckbox(dataCell, dataRow) {
        return <div style={{ textAlign: 'center' }}>
            <Checkbox checked={dataCell} onChange={e => this.onCheckIsActive(e.target.checked, dataRow)}></Checkbox>
        </div >
    }

    renderActionColumn(review, data) {
        return <div style={{ textAlign: 'center', justifyContent: 'space-around', display: 'flex' }}>
            <div style={{ textAlign: 'center', cursor: 'pointer' }}
                onClick={() => this.onOpenModalCreate(ACTION.UPDATE, data)}
            >
                <img src={editIcon} alt="" width="20px" />
            </div>
            <div style={{ textAlign: 'center', cursor: 'pointer' }}
                onClick={() => this.onClickAction(data, ACTION.DELETE)}
            >
                <img src={removeIcon} alt="" width="20px" />
            </div>
        </div>;
    }

    onClickAction = (data, action) => {
        if (action === ACTION.DELETE) {
            showConfirm(
                "Are you sure to delete?",
                () => this.onDelete(data),
                "Notification"
            )
        }
    }

    onDelete = async (data) => {
        // console.log('delete')
        let res = await this.service.deleteUser(data.userName);
        console.log(res);
        if (res && res.data && res.data.status === STATUS.SUCCESS) {
            hideDialogConfirm();
            this.Notification.success(MESSAGE.DELETE_SUCCESS);
            this.loadForm();
        } else {
            hideDialogConfirm();
            // this.Notification.error(MESSAGE.ERROR);
            this.Notification.error("Technician still remaining task in trouble. Can't delete!");
        }
    }

    onCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            visible: false
        });
    };

    handleCreate = () => {
        this.onOpenModalCreate(ACTION.CREATE, {});
    }

    onShowSizeChange = (current, pageSize) => {
        let filter = { ...this.state.filter };
        filter.paging.currentPage = 1;
        filter.paging.pageSize = pageSize;
        this.setState({ filter: filter });

        setTimeout(() => {
            this.loadForm();
        }, 100);

    };

    onPageChange = (page, pageSize) => {
        let filter = { ...this.state.filter };
        filter.paging.currentPage = page;
        this.setState({ filter: filter });
        setTimeout(() => {
            this.loadForm(page);
        }, 100);

    };

    onOpenModalCreate = (action, data) => {
        showDialog(
            this.getUserForm(action, data),
            action === ACTION.CREATE ? "Add User" : "Update User",
        )
    }

    getUserForm = (action, data) => {
        let campus = [...this.state.campus];
        campus = campus.filter(item => item.inService === true);
        let role = [...this.state.role];
        return (
            <UserPopup
                options={{
                    action,
                    data: { ...data },
                    dataNew: data,
                    campus,
                    role,
                    onComplete: async (rowData) => {
                        const res = await this.service.saveUser(rowData);
                        if (res.data.status === STATUS.SUCCESS) {
                            hideDialog();
                            this.loadForm();
                            if (action === ACTION.UPDATE) {
                                this.Notification.success(MESSAGE.UPDATE_SUCCESS);
                            } else if (action === ACTION.CREATE) {
                                this.Notification.success(MESSAGE.CREATE_SUCCESS);
                            }
                        } else {
                            this.Notification.error(MESSAGE.ERROR);
                        }
                    },
                    onCancel: (rowData) => {
                        // console.log('ádasdas')
                        hideDialog(true, rowData);
                    }
                }}
            />
        )
    }

    onChange = (value, name) => {
        let data = { ...this.state.filter };
        data[name] = value
        this.setState({ filter: data });
    }

    render() {
       var columnTable = [
            {
                title: trans('configuration:no'),
                dataIndex: 'stt',
                key: 'stt',
                width: 40
            },
            {
                title: trans('configuration:user.campus'),
                dataIndex: 'campusName',
                key: 'campusName',
                width: 100,
            },
            {
                title: trans('configuration:user.userName'),
                dataIndex: 'userName',
                key: 'userName',
                width: 150,
            },
            {
                title: trans('configuration:user.email'),
                dataIndex: 'email',
                key: 'email',
                width: 150,
            },
            {
                title: trans('configuration:user.fullName'),
                dataIndex: 'fullName',
                key: 'fullName',
                width: 200,
            },
            {
                title:  trans('configuration:user.role'),
                dataIndex: 'roleName',
                key: 'roleName',
                width: 100,
            },
            {
                title: trans('configuration:user.active'),
                dataIndex: 'isActive',
                key: 'isActive',
                width: 80,
                render: (dataCell, dataRow) => this.renderColumnCheckbox(dataCell, dataRow)
            },
            {
                title: <SettingOutlined/>,
                dataIndex: 'action',
                key: 'action',
                width: 90,
                render: (review, record) => this.renderActionColumn(review, record)
            }
        ];
        return (
            <>
                <div className="container">
                    <Row>
                        <Col
                            style={{ marginBottom: "10px" }}
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >
                            <HeaderPannel
                                // classNameCustom="checklist-report"
                                title={trans("configuration:user.title")}

                                breadcrumbList={[trans("configuration:user.configuration"), trans("configuration:user.user")]}
                                buttons={[
                                    {
                                        title: trans("common:button.create"),
                                        classNameCustom: 'submit',
                                        action: () => this.handleCreate
                                    },
                                ]}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <div className="daily-checklist-container border-form padding-pannel">
                                <Row >
                                    <Col xs={12} sm={12} md={4} lg={4} xl={3}>
                                        <div className="location-search-title title-input">
                                        {trans("configuration:user.userName")}
                                        </div>
                                        <div className="location-search-combobox">
                                            <Input
                                                id="username"
                                                placeholder=''
                                                value={this.state.filter.username}
                                                onChange={e => this.onChange(e.target.value.length === 0 ? null : e.target.value, 'username')}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={4} lg={4} xl={3}>
                                        <div className="location-search-title title-input">
                                        {trans("configuration:user.campus")}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="campus"
                                                placeholder={trans("common:all")}
                                                onChange={(e, value) => this.onChange(value ? value.children : null, 'campus')}
                                                value={this.state.filter.campus}
                                                options={this.state.campus}
                                                clear={true}
                                            // keyValue="code"
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={4} lg={4} xl={3}>
                                        <div className="location-search-title title-input">
                                        {trans("configuration:user.role")}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="role"
                                                placeholder={trans("common:all")}
                                                onChange={(e, value) => this.onChange(value ? value.children : null, 'role')}
                                                value={this.state.filter.role}
                                                options={this.state.role}
                                                clear={true}
                                            // keyValue="code"
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={3} style={{
                                        marginTop: '24px',
                                        display: 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <Button
                                            className="button-submit button"
                                            onClick={() => { this.loadForm() }}
                                        >
                                            {trans("common:button.search")}
                                        </Button>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginTop: "15px" }}>
                                        <Table
                                            columns={columnTable}
                                            dataSource={this.state.dataTable}
                                            pagination={false}
                                            size="small"
                                            scroll={{
                                                y: 340,
                                            }}
                                        />

                                        <div className="page-div">
                                            <Pagination
                                                showSizeChanger
                                                onShowSizeChange={this.onShowSizeChange}
                                                showTotal={(total, range) => { return (<span>{range[0]} - {range[1]} {trans('common:of')} {total} {trans('common:items')}</span>) }}
                                                onChange={this.onPageChange}
                                                defaultCurrent={1}
                                                total={this.state.filter.paging.rowsCount}
                                                current={this.state.filter.paging.currentPage}
                                                pageSizeOptions={['1', '10', '20', '30', '40']}
                                                defaultPageSize={15}
                                                pageSize={this.state.filter.paging.pageSize}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>

                </div>
            </>
        );
    }

};

export default withTranslation(['configuration', 'common'])(UserConfig);
