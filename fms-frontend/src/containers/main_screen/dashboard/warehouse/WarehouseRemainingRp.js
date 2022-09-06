import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import '../../../../layout/MyTrouble.css';
import '../../../../layout/Common.css';
import {
    Input, Table, Image, Pagination, Tag, Button
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../components/HeaderPannel';
import { Link, Navigate } from 'react-router-dom';
import SelectCustom from '../../../../components/SelectCustom';
import {
    handleHideNav,
    trans
} from '../../../../components/CommonFunction';
import backwardIcon from '../../../../assets/export.png';
import forwardIcon from '../../../../assets/import.png';
import { WarehouseService } from '../../../../services/main_screen/warehouse/WarehouseService';
import { Notification } from '../../../../components/Notification';
import { AssetCategoryService } from '../../../../services/main_screen/configuration/AssetCategoryService';
import { withTranslation } from 'react-i18next';
import { SettingOutlined } from '@ant-design/icons';
import { ACTION, MESSAGE, STATUS } from '../../../../constants/Constants';

class WarehouseRemainingRp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTableAssetRemainingRp: [],
            data: {},
            categorys: [],
            filter: {
                paging: {
                    currentPage: 1,
                    pageSize: 10,
                    rowsCount: 0
                },
                categoryName: null,
                assetName: null
            },
        };
        this.service = new WarehouseService();
        this.Notification = new Notification();
        this.CategoryService = new AssetCategoryService();
    }

    componentDidMount() {
        // this.loadForm();
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
        let res = await this.service.getListRemaining(filter);
        if (res?.status === 200 && res?.data) {
            filter.paging = res?.data.paging;
            if (filter.paging.currentPage !== 1 && (filter.paging.currentPage * filter.paging.pageSize - 10) >= filter.paging.rowsCount) {
                filter.paging.currentPage = 1;
                await this.setState({ filter });
                this.loadForm();
            }
            this.setState({ dataTableAssetRemainingRp: res?.data?.listData, filter: filter })
        } else {
            this.Notification.error(MESSAGE.ERROR)
        }
    }

    loadCategory = async () => {
        await this.CategoryService.getAllCategory().then(res => { this.setState({ categorys: res?.data?.listData }) });
    }

    renderActionColumn(review, data, index, roleUserInfo) {
        console.log(roleUserInfo);
        return (
            roleUserInfo === 3 ?
                <div style={{ textAlign: 'center', justifyContent: 'space-around', display: 'flex' }} key={index}>

                    <Button
                        type='link'
                        title='Import'
                        onClick={() => {
                            localStorage.setItem('importParams', JSON.stringify({ tab: '1', data: data }));
                            this.setState({ redir: true });
                        }}
                    >
                        <Image src={forwardIcon} preview={false} width={20} />
                    </Button>

                    {
                        data.remainingQuantity !== 0 ?
                            <Button
                                type='link'
                                title='Export'
                                onClick={() => {
                                    localStorage.setItem('importParams', JSON.stringify({ tab: '2', data: data }));
                                    this.setState({ redir: true });
                                }}
                            >
                                <Image src={backwardIcon} preview={false} width={20} />
                            </Button> : null
                    }


                </div> : null
        );
    }

    onChangeFilter(name, value) {
        let filter = { ...this.state.filter };
        filter[name] = value;
        this.setState({ filter: filter });
    }

    render() {
        let roleUserInfo = JSON.parse(localStorage.getItem('cont')).userInfo.role;
        const columnAssetRemainingRp = [
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
                title: trans('warehouse:remainingRp.assetCategory'),
                dataIndex: 'categoryName',
                key: 'categoryName',
                width: 250,
            },
            {
                title: trans('warehouse:remainingRp.assetCode'),
                dataIndex: 'assetCode',
                key: 'assetCode',
                width: 150,
            },
            {
                title: trans('warehouse:remainingRp.assetName'),
                dataIndex: 'name',
                key: 'name',
                width: 150,
            },
            {
                title: trans('warehouse:remainingRp.remaining'),
                dataIndex: 'remainingQuantity',
                key: 'remainingQuantity',
                width: 150,
            },
            {
                title: <SettingOutlined />,
                dataIndex: 'action',
                key: 'action',
                width: roleUserInfo === 3 ? 70 : 0,
                render: (review, record, index) => this.renderActionColumn(review, record, index, roleUserInfo)
            },
            {
                title: trans('warehouse:remainingRp.note'),
                dataIndex: 'note',
                key: 'note',
                width: 150,
                render: (value, data) => {
                    return (
                        <div>
                            {
                                value ? <Tag color={'yellow'}>{trans('warehouse:remainingRp.needSupply')}</Tag> : null
                            }
                            {
                                data.remainingQuantity === 0 ? <Tag color={'#BA1C30'}>{trans('warehouse:remainingRp.outOfStock')}</Tag> : null
                            }
                        </div>
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
                                title={trans('warehouse:remainingRp.title')}
                                breadcrumbList={[trans('warehouse:warehouse'), trans('warehouse:remainingRp.breadcum')]}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <div className="daily-checklist-container border-form padding-pannel">
                                <Row >
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2}>
                                        <div>
                                            {trans('warehouse:remainingRp.assetCategory')}
                                        </div>
                                        <div>
                                            <SelectCustom
                                                id="category"
                                                onChange={(e, value) => this.onChangeFilter('categoryName', e)}
                                                placeholder={trans('common:all')}
                                                // defaultValue=""
                                                value={this.state.filter.categoryName}
                                                options={this.state.categorys}
                                                keyValue="name"
                                                clear={true}
                                            >
                                            </SelectCustom>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2}>
                                        <div className="location-search-title">
                                            {trans('warehouse:remainingRp.assetName')}
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
                                    <Col xs={12} sm={12} md={12} lg={4} xl={8} style={{
                                        marginTop: '19px',
                                        display: 'flex', justifyContent: 'flex-end'
                                    }}>
                                        <div className="button button-submit daily-checklist-searchbtn" onClick={this.loadForm}>
                                            {trans('common:button.search')}
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginTop: "15px" }}>
                                        <Table
                                            columns={columnAssetRemainingRp}
                                            dataSource={this.state.dataTableAssetRemainingRp}
                                            pagination={false}
                                            scroll={{
                                                y: 380,
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
                {
                    this.state.redir ? <Navigate to='/warehouseAsset' replace={true}></Navigate> : null
                }
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

export default withTranslation(['warehouse', 'common'])(WarehouseRemainingRp);
