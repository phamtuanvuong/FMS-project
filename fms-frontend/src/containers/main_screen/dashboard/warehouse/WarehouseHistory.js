import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import '../../../../layout/MyTrouble.css';
import '../../../../layout/Common.css';
import {
    Input, DatePicker, Table, Image, Tag, Pagination, Button
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../components/HeaderPannel';
import { ACTION, MESSAGE, STATUS } from '../../../../constants/Constants';
import SelectCustom from '../../../../components/SelectCustom';
import moment from "moment";
import {
    handleHideNav,
    formatDateDataTable,
    trans
} from '../../../../components/CommonFunction';
import informationIcon from '../../../../assets/available.png'
import { WarehouseService } from '../../../../services/main_screen/warehouse/WarehouseService';
import { AssetCategoryService } from '../../../../services/main_screen/configuration/AssetCategoryService';
import { hideDialogConfirm, showConfirm } from '../../../../components/MessageBox';
import { Notification } from '../../../../components/Notification';
import { withTranslation } from 'react-i18next';
import { SettingOutlined } from '@ant-design/icons';

class WarehouseHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTableAssetHistory: [],
            data: {},
            categorys: [],
            filter: {
                paging: {
                    currentPage: 1,
                    pageSize: 10,
                    rowsCount: 0
                },
                categoryName: null,
                assetName: null,
                fromDate: null,
                toDate: null
            },
            exportFilter: {},
            cValue: JSON.parse(localStorage.getItem('cont')),
        };
        this.service = new WarehouseService();
        this.CategoryService = new AssetCategoryService();
        this.Notification = new Notification();
    }

    componentDidMount() {
        document.querySelector('.container').addEventListener('click', handleHideNav);
        this.loadForm();
    }

    loadForm = async () => {
        this.loadCategory();
        this.loadData();
    }

    loadData = async () => {
        let filter = { ...this.state.filter };
        if (typeof filter.assetName === 'string') {
            filter.assetName = filter.assetName.trim();  
            if (filter.assetName.length === 0) {
                filter.assetName = null;
            }
        }
        let res = await this.service.getListHistory(filter);
            if (res?.status === 200 && res?.data) {
                filter.paging = res?.data.paging;
                if (filter.paging.currentPage !== 1 && (filter.paging.currentPage * filter.paging.pageSize - 10) >= filter.paging.rowsCount) {
                    filter.paging.currentPage = 1;
                    await this.setState({ filter });
                    this.loadForm();
                }
                this.setState({ dataTableAssetHistory: res?.data?.listData, filter: filter, exportFilter: filter })
            } else {
                this.Notification.error(MESSAGE.ERROR)
            }
    }

    loadCategory = async () => {
        await this.CategoryService.getAllCategory().then(res => { this.setState({ categorys: res?.data?.listData }) });
    }

    renderActionColumn = (review, data) => {
        if (data.isReady === false) {
            return (
                <Button type="link" style={{ padding: 0 }}
                    title="Available now"
                    onClick={() => this._openPopConfirm(data)
                    }
                >
                    <Image src={informationIcon} preview={false} width={30} ></Image>
                </Button >
            );
        }
        return null;
    }

    _openPopConfirm = (data) => {
        showConfirm
            (
                trans('warehouse:history.notiAvilable'),
                () => this.onChangeReady(data?.importID),
                trans('common:notify')
            );
    }

    onChangeReady = async (importID) => {
        await this.service.changeReady({
            ID: importID, currentUser: this.state.cValue?.userInfo?.username
        }).then(res => {
            if (res?.status === 200) {
                hideDialogConfirm();
                this.loadData();
                this.Notification.success("Change successfully.");
            }
            else {
                hideDialogConfirm();
                this.Notification.error(res?.data?.message);
            }
        })
    }

    onExport = async () => {
        let filter = { ...this.state.exportFilter };
        var filename = 'WarehouseReport.xlsx';
        await this.service.exportHistory(filter).then(res => {
            if (res) {
                const downloadUrl = window.URL.createObjectURL(res.data);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        });
    }

    onChangeFilter(name, value) {
        console.log(name, value);
        let filter = { ...this.state.filter };
        filter[name] = value;
        this.setState({ filter: filter });
    }

    onChangeDateFilter(name, value) {
        let filter = { ...this.state.filter };
        filter[name] = value ? moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
        this.setState({ filter: filter });
    }

    disabledFromDate = (current) => {
        // Can not select days before today and today
        // console.log('data = ', current);
        if (this.state.filter.to) {
            return moment(current, 'DD/MM/YYYY') > moment(this.state.filter.to, 'YYYY-MM-DD').endOf('day');
        }
        return '';
    };

    disabledToDate = (current) => {
        // Can not select days before today and today
        // console.log('data = ', current);
        if (this.state.filter.from) {
            return moment(current, 'DD/MM/YYYY') < moment(this.state.filter.from, 'YYYY-MM-DD');
        }
        return '';
    };

    render() {
        const columnAssetHistory = [
            {
                title: '#',
                dataIndex: 'index',
                key: 'index',
                width: 40,
                render: function (text, record, index) {
                    return <div key={index}>
                        {++index}
                    </div>
                }
            },
            {
                title: trans('warehouse:history.date'),
                dataIndex: 'date',
                key: 'date',
                width: 100,
                render: (value) => formatDateDataTable(value)
            },
            {
                title: trans('warehouse:history.type'),
                dataIndex: 'type',
                key: 'type',
                width: 100,
                className: 'columnStatus',
                render: function (value) {
                    var color = 'black';
                    switch (value) {
                        case 'Import':
                            color = '#177A56';
                            break;
                        case 'Export':
                            color = '#BA1C30'
                            break;
                    }
                    return (
                        <Tag color={color} style={{ textAlign: 'center' }}>
                            {value}
                        </Tag>
                    )
                }
            },
            {
                title: trans('warehouse:history.category'),
                dataIndex: 'categoryName',
                key: 'categoryName',
                width: 120,
            },
            {
                title: trans('warehouse:history.assetCode'),
                dataIndex: 'assetCode',
                key: 'assetCode',
                width: 120,
            },
            {
                title: trans('warehouse:history.assetName'),
                dataIndex: 'name',
                key: 'name',
                width: 150,
            },

            {
                title: trans('warehouse:history.reason'),
                dataIndex: 'reason',
                key: 'reason',
                width: 150
            },

            {
                title: trans('warehouse:history.quantity'),
                dataIndex: 'quantity',
                key: 'quantity',
                width: 80,
            },
            {
                title: trans('warehouse:history.createdBy'),
                dataIndex: 'createdBy',
                key: 'createdBy',
                width: 120,
            },
            {
                title: trans('warehouse:history.receiver'),
                dataIndex: 'receiver',
                key: 'receiver',
                width: 120,
            },
            {
                title: <SettingOutlined />,
                dataIndex: 'action',
                key: 'action',
                width: 100,
                render: (review, record, index) => this.renderActionColumn(review, record, index)
            },
            {
                title: trans('warehouse:history.note'),
                dataIndex: 'isReady',
                key: 'isReady',
                width: 160,
                render: (value) => {
                    return (
                        <>
                            {
                                value === false ?
                                    <Tag color={'red'}>{trans('warehouse:history.notReady')}</Tag>
                                    :
                                    null
                            }

                        </>
                    )
                }
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
                                classNameCustom="checklist-report"
                                title={trans('warehouse:history.title')}
                                breadcrumbList={[trans('warehouse:warehouse'), trans('warehouse:history.breadcum')]}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <div className="daily-checklist-container border-form padding-pannel">
                                <Row >
                                    <Col xs={12} sm={12} md={6} lg={3} xl={2}>
                                        <div>
                                            {trans('warehouse:history.category')}
                                        </div>
                                        <div>
                                            <SelectCustom
                                                id="category"
                                                onChange={(e, value) => this.onChangeFilter('categoryName', e)}
                                                placeholder={trans('common:all')}
                                                value={this.state.filter.categoryName}
                                                options={this.state.categorys}
                                                keyValue="name"
                                                clear={true}
                                            >
                                            </SelectCustom>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={3} xl={2}>
                                        <div className="location-search-title">
                                            {trans('warehouse:history.assetName')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <Input
                                                id="assetName"
                                                placeholder=''
                                                value={this.state.filter.assetName}
                                                onChange={e => this.onChangeFilter('assetName', e.target.value)}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={3} xl={2}>
                                        <div className="location-search-title">
                                            {trans('warehouse:history.from')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <DatePicker
                                                disabledDate={this.disabledFromDate}
                                                placeholder=""
                                                onChange={(e, timeString) => this.onChangeDateFilter('from', timeString)}
                                                format='DD/MM/YYYY' />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={3} xl={2}>
                                        <div className="location-search-title">
                                            {trans('warehouse:history.to')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <DatePicker
                                                placeholder=""
                                                disabledDate={this.disabledToDate}
                                                onChange={(e, timeString) => this.onChangeDateFilter('to', timeString)}
                                                format='DD/MM/YYYY' />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={4} style={{
                                        marginTop: '19px',
                                        display: 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <div className="button button-submit daily-checklist-searchbtn" onClick={this.loadForm}>
                                            {trans('common:button.search')}
                                        </div>
                                        <div className="button button-submit daily-checklist-searchbtn" onClick={this.onExport}>
                                            {trans('common:button.export')}
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginTop: "15px" }}>
                                        <Table
                                            columns={columnAssetHistory}
                                            dataSource={this.state.dataTableAssetHistory}
                                            pagination={false}
                                            scroll={{
                                                y: 380,
                                            }}
                                            size="middle"
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

};


export default withTranslation(['warehouse', 'common'])(WarehouseHistory);
