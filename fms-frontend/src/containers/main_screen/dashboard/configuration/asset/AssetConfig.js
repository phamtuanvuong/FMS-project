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
import { AssetService } from '../../../../../services/main_screen/configuration/AssetService';
import '../../../../../layout/Configuration.css';
import SelectCustom from '../../../../../components/SelectCustom';
import { showDialog, hideDialog } from '../../../../../components/Dialog';
import { showConfirm, hideDialogConfirm } from '../../../../../components/MessageBox';
import AssetPopup from './AssetPopup';
import { Notification } from "../../../../../components/Notification";
import { 
    formatDateDataTable, 
    handleHideNav,
    trans
} from '../../../../../components/CommonFunction';
import moment from 'moment';
import removeIcon from '../../../../../assets/bin.png';
import editIcon from '../../../../../assets/edit.png';
import { withTranslation } from 'react-i18next';
import { SettingOutlined } from '@ant-design/icons';

class AssetConfig extends Component {
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
                campusName: null,
                locationCode: null,
                roomName: null,
                assetName: null
            },
        };
        this.Notification = new Notification();
        this.service = new AssetService();
    }

    componentDidMount() {
        this.loadSelect();
        this.loadForm();
        document.querySelector('.container').addEventListener('click', handleHideNav);
    }

    loadForm = async (currentPage = 1) => {
        let filter = { ...this.state.filter };
        filter.paging.currentPage = currentPage;
        if (typeof filter.assetName === 'string') {
            filter.assetName = filter.assetName.trim();
            if (filter.assetName.length === 0) {
                filter.assetName = null;
            }
        }
        this.service.getListAsset(filter).then(res => {
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
        const resCampus = await this.service.getAllCampusNoCondition();
        const resLocation = await this.service.getAllLocationNoCondition();
        const resAreaRoom = await this.service.getAllAreaRoomNoCondition();
        const resCategory = await this.service.getAllCategory();
        if ((resCampus || resAreaRoom || resLocation || resCategory)
            && (resCampus.data.status === STATUS.SUCCESS || resLocation.data.status === STATUS.SUCCESS
                || resAreaRoom.data.status === STATUS.SUCCESS || resCategory.data.status === STATUS.SUCCESS)) {
            let campus = resCampus?.data?.listData;
            let location = resLocation?.data?.listData;
            let areaRoom = resAreaRoom?.data?.listData;
            let category = resCategory?.data?.listData;

            this.setState({
                campus,
                location,
                areaRoom,
                category
            });
        } else {
            this.Notification.error(MESSAGE.ERROR);
        }
    }

  

    onCheckIsActive = async (value, dataRow) => {
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
        console.log(data.startDate, data.endDate, 'check data')

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
        let res = await this.service.deleteAsset(data.id);
        // console.log(res);
        if (res.data.status === STATUS.SUCCESS) {
            hideDialogConfirm();
            this.Notification.success(MESSAGE.DELETE_SUCCESS);
            this.loadForm();
        } else {
            hideDialogConfirm();
            this.Notification.success(MESSAGE.ERROR);
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
        console.log(data.startDate, data.endDate, 'check data modal')

        showDialog(
            this.getAssetForm(action, data),
            action === ACTION.CREATE ? "Create Asset" : "Update Asset",
        )
    }

    getAssetForm = (action, { ...data }) => {
        let campus = [...this.state.campus];
        campus = campus.filter(item => item.inService === true);
        let category = [...this.state.category];
        console.log(data.startDate, data.endDate, 'check date before');

        data.startDate = moment(data.startDate).format('DD/MM/YYYY');
        data.endDate = data.endDate ? moment(data.endDate).format('DD/MM/YYYY') : null;
        console.log(data.startDate, data.endDate);
        return (
            <AssetPopup
                options={{
                    action,
                    data: { ...data },
                    dataNew: data,
                    campus,
                    category,
                    onComplete: async (rowData) => {
                        // console.log(rowData);
                        const res = await this.service.saveAsset(rowData);
                        // console.log(res, 'check apiiii');
                        if (res.data.status === STATUS.SUCCESS) {
                            hideDialog();
                            this.loadForm();
                            if (action === ACTION.UPDATE) {
                                this.Notification.success(MESSAGE.UPDATE_SUCCESS);
                            } else if (action === ACTION.CREATE) {
                                this.Notification.success(MESSAGE.CREATE_SUCCESS);
                            }
                        } else {
                            this.Notification.error(MESSAGE.EROR);
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
        console.log(value, 'check value')
        let data = { ...this.state.filter };
        data[name] = value
        this.setState({ filter: data });
    }

    loadLocationSelect = async (value) => {
        let resListLocation = await this.service.getListLocationNoCondition({
            "paging": {
                "currentPage": 1,
                "pageSize": 99999999,
                "rowsCount": 0
            },
            "campus": value,
            "locationCode": null
        });

        if (resListLocation.data.status === STATUS.SUCCESS) {
            let location = resListLocation.data.listData;
            this.setState({
                location
            });
        } else {
            this.Notification.error(MESSAGE.EROR);
        }
    }

    loadSelectArea = async (campus, location) => {
        let resListAreaRoom = await this.service.getListAreaRoomNoCondition({
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

    onChangeCampus = (name, value) => {
        let filter = { ...this.state.filter };
        filter[name] = value;
        console.log(value);
        this.setState({
            filter,
            areaRoom: null
        });

        this.loadLocationSelect(value);
        this.loadSelectArea(value, this.state.filter.locationCode || null);
    }

    onChangeLocation = (name, value) => {
        let filter = { ...this.state.filter };
        filter[name] = value;
        console.log(value);
        this.setState({ filter });

        this.loadSelectArea(this.state.filter.campusName || null, value);
    }

    render() {
var   columnTable = [
    {
        title: trans('configuration:no'),
        dataIndex: 'stt',
        key: 'stt',
        width: 40
    },
    {
        title: trans('configuration:assest.campus'),
        dataIndex: 'campusName',
        key: 'campusName',
        width: 80,
    },
    {
        title: trans('configuration:assest.location'),
        dataIndex: 'locationCode',
        key: 'locationCode',
        width: 80,
    },
    {
        title: trans('configuration:assest.room'),
        dataIndex: 'areaName',
        key: 'areaName',
        width: 100,
    },
    {
        title: trans('configuration:assest.category'),
        dataIndex: 'categoryName',
        key: 'categoryName',
        width: 150,
    },
    {
        title: trans('configuration:assest.assetName'),
        dataIndex: 'name',
        key: 'name',
        width: 180,
    },
    {
        title:  trans('configuration:assest.assetCode'),
        dataIndex: 'code',
        key: 'code',
        width: 190,
    },
    {
        title: trans('configuration:assest.unit'),
        dataIndex: 'measureName',
        key: 'measureName',
        width: 80,
    },
    {
        title: trans('configuration:assest.quantity'),
        dataIndex: 'quantity',
        key: 'quantity',
        width: 100,
    },
    {
        title: trans('configuration:assest.createdBy'),
        dataIndex: 'createdBy',
        key: 'createdBy',
        width: 150,
    },
    {
        title:  trans('configuration:assest.startDate'),
        dataIndex: 'startDate',
        key: 'startDate',
        width: 120,
        render: (dataCell) => formatDateDataTable(dataCell)
    },
    {
        title: trans('configuration:assest.endDate'),
        dataIndex: 'endDate',
        key: 'endDate',
        width: 120,
        render: (dataCell) => formatDateDataTable(dataCell)
    },
    {
        title: trans('configuration:inService'),
        dataIndex: 'inService',
        key: 'inService',
        width: 110,
        render: (dataCell, dataRow) => this.renderColumnCheckbox(dataCell, dataRow)
    },
    {
        title: <SettingOutlined/>,
        dataIndex: 'action',
        key: 'action',
        width: 100,
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
                                title={trans('configuration:assest.title')}
                                breadcrumbList={[trans('configuration:assest.configuration'), trans('configuration:assest.asset')]}
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
                                    <Col xs={12} sm={12} md={4} lg={4} xl={2}>
                                        <div className="location-search-title title-input">
                                            {trans('configuration:assest.campus')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="search"
                                                placeholder={trans("common:all")}
                                                onChange={(e, value) => this.onChangeCampus('campusName', e)}
                                                value={this.state.filter.campusName}
                                                options={this.state.campus}
                                                keyValue="name"
                                                clear={true}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={4} lg={4} xl={2}>
                                        <div className="location-search-title title-input">
                                        {trans('configuration:assest.location')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="locationCode"
                                                placeholder={trans("common:all")}
                                                onChange={(e, value) => this.onChangeLocation('locationCode', e)}
                                                value={this.state.filter.locationCode}
                                                options={this.state.location}
                                                keyValue="code"
                                                clear={true}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={4} lg={4} xl={2}>
                                        <div className="location-search-title title-input">
                                        {trans('configuration:assest.room')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="roomName"
                                                placeholder={trans("common:all")}
                                                onChange={(e, value) => this.onChange(value ? value.children : null, 'roomName')}
                                                value={this.state.filter.roomName}
                                                options={this.state.areaRoom}
                                                clear={true}
                                            // keyValue="code"
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={4} lg={4} xl={2}>
                                        <div className="location-search-title title-input">
                                        {trans('configuration:assest.assetName')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <Input
                                                id="assetName"
                                                placeholder=''
                                                value={this.state.filter.assetName}
                                                onChange={e => this.onChange(e.target.value.length === 0 ? null : e.target.value, 'assetName')}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={4} style={{
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

export default withTranslation(['configuration', 'common'])(AssetConfig);
