import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../../layout/Common.css';
import {
    Checkbox, Table, Button, Pagination
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../../components/HeaderPannel';
import { ACTION, STATUS, MESSAGE } from '../../../../../constants/Constants';
import { CampusService } from '../../../../../services/main_screen/configuration/CampusService';
import '../../../../../layout/Configuration.css';
import SelectCustom from '../../../../../components/SelectCustom';
import { showDialog, hideDialog } from '../../../../../components/Dialog';
import { showConfirm, hideDialogConfirm } from '../../../../../components/MessageBox';
import InforCampus from './CampusPopup';
import { Notification } from "../../../../../components/Notification";
import removeIcon from '../../../../../assets/bin.png';
import editIcon from '../../../../../assets/edit.png';
import {
    handleHideNav,
    trans
} from '../../../../../components/CommonFunction';
import { withTranslation } from 'react-i18next';
import { SettingOutlined } from '@ant-design/icons';

class CampusConfiguration extends Component {
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
                campusName: null
            },
            // campus: []
        };
        this.Notification = new Notification();
        this.service = new CampusService();
    }

    componentDidMount() {
        this.loadSelect();
        this.loadForm();
        document.querySelector('.container').addEventListener('click', handleHideNav);
    }

    loadForm = async (currentPage = 1) => {
        let filter = { ...this.state.filter };
        filter.paging.currentPage = currentPage;
        this.service.getListNoCondition(filter).then(res => {
            if (res && res.status === 200) {
                if (res.data) {
                    filter.paging.rowsCount = res.data.paging.rowsCount;
                    let data = res.data.listData;
                    let stt = 1;
                    for (let item of data) {
                        item.stt = stt;
                        stt++;
                    }
                    this.setState({ dataTable: data, filter: filter });
                }
            } else {
                this.Notification.error(MESSAGE.ERROR);
            }
        });
    }

    loadSelect = async () => {
        const resCampus = await this.service.getAllNoCondition();
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


 
    onCheckIsActive = async (value, dataRow) => {
        console.log(dataRow)
        let resIsActive = await this.service.changeIsActive({
            id: dataRow.id,
            inService: value
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
            {/* <div style={{ textAlign: 'center', cursor: 'pointer' }}
                onClick={() => this.onClickAction(data, ACTION.DELETE)}
            >
                <img src={removeIcon} alt="" width="20px" />
            </div> */}
        </div>;
    }

    onClickAction = (data, action) => {
        if (action === ACTION.DELETE) {
            showConfirm(
                trans("common:notiTitleDelete"),
                () => this.onDelete(data),
                trans("common:notify")
            )
        }
    }

    onDelete = async (data) => {
        // console.log('delete')
        let res = await this.service.deleteCampus(data.id);
        // console.log(res);
        if (res?.status === STATUS.SUCCESS) {
            hideDialogConfirm();
            this.loadForm();
            this.Notification.success(MESSAGE.DELETE_SUCCESS);
        } else {
            hideDialogConfirm();
            this.Notification.error(MESSAGE.ERROR);
        }
    }

    onCancel = () => {
        this.setState({
            visible: false
        });
    };

    handleCreate = () => {
        this.onOpenModalCreate(ACTION.CREATE, {});
    }

    onOpenModalCreate = (action, data) => {
        showDialog(
            this.getCampusForm(action, data),
            action === ACTION.CREATE ? trans('configuration:campus.createCampus') : trans('configuration:campus.updateCampus'),
        )
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

    getCampusForm = (action, data) => {
        return (
            <InforCampus
                options={{
                    action,
                    data: { ...data },
                    dataNew: data,
                    onComplete: async (rowData) => {
                        console.log(rowData);
                        const res = await this.service.saveCampus(rowData, action);
                        // console.log(res, 'check apiiii');
                        if (res.status === STATUS.SUCCESS) {
                            hideDialog();
                            this.loadForm();
                            if (action === ACTION.UPDATE) {
                                this.Notification.success(MESSAGE.UPDATE_SUCCESS);
                            } else if (action === ACTION.CREATE) {
                                this.Notification.success(MESSAGE.CREATE_SUCCESS);
                            }
                            this.loadSelect();
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

    onChange = value => {
        let data = { ...this.state.filter };
        data.campusName = value
        this.setState({ filter: data });
    }

    render() {
        var columnTable = [
            {
                title: trans('configuration:no'),
                dataIndex: 'stt',
                key: 'stt',
                width: 45
            },
            {
                title: trans('configuration:campus.campus'),
                dataIndex: 'name',
                key: 'name',
                width: 150,
            },
            {
                title: trans('configuration:campus.address'),
                dataIndex: 'address',
                key: 'address',
                width: 380,
            },
            {
                title: trans('configuration:campus.telephone'),
                dataIndex: 'telephone',
                key: 'telephone',
                width: 150,
            },
            {
                title: trans('configuration:inService'),
                dataIndex: 'inService',
                key: 'inService',
                width: 100,
                render: (dataCell, dataRow) => this.renderColumnCheckbox(dataCell, dataRow)
            },
            {
                title: <SettingOutlined/>,
                dataIndex: 'action',
                key: 'action',
                width: 70,
                render: (review, record, index) => this.renderActionColumn(review, record)
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
                                title={trans("configuration:campus.title")}
                                breadcrumbList={[trans("configuration:campus.configuration"),trans("configuration:campus.campus")]}
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
                                    <Col xs={12} sm={7} md={5} lg={4} xl={3}>
                                        <div className="location-search-title title-input">
                                        {trans("configuration:campus.campusName")}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="campusName"
                                                placeholder={trans("common:all")}
                                                onChange={(e, value) => this.onChange(value ? value.children : null)}
                                                value={this.state.filter.campusName}
                                                options={this.state.campus}
                                                clear={true}
                                            // keyValue="code"
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={5} md={7} lg={8} xl={9} style={{
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
                                            scroll={{
                                                y: 340,
                                            }}
                                            size="small"
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

export default withTranslation(['configuration', 'common'])(CampusConfiguration);
