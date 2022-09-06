import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Home.css';
import '../../../../layout/MyTrouble.css';
import '../../../../layout/Common.css';
import {
    Input, Table, Image, Button, Pagination
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../components/HeaderPannel';
import SelectCustom from '../../../../components/SelectCustom';
import { Notification } from '../../../../components/Notification';
import {
    onChangeValue,
    stringNullOrEmpty,
    handleHideNav,
    trans
} from '../../../../components/CommonFunction';
import doneIcon from '../../../../assets/done-icon.png';
import { WarehouseService } from '../../../../services/main_screen/warehouse/WarehouseService';
import { AssetCategoryService } from '../../../../services/main_screen/configuration/AssetCategoryService';
import { withTranslation } from 'react-i18next';
import { SettingOutlined } from '@ant-design/icons';
import { ACTION, MESSAGE, STATUS } from '../../../../constants/Constants';
import { InputNumber } from 'antd';

class WarehouseRemainingStandard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataTableAssetRemainingStandard: [],
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
            errors: {},
            cValue: JSON.parse(localStorage.getItem('cont'))
        };
        this.service = new WarehouseService();
        this.CategoryService = new AssetCategoryService();
        this.Notification = new Notification();
    }

    componentDidMount() {
        this.loadForm();
        document.querySelector('.container').addEventListener('click', handleHideNav);
    }
    loadForm = async () => {
        this.loadCategory();
        this.loadData();
    }

    loadData = async () => {
        let filter = { ...this.state.filter };
        console.log(filter);
        if (typeof filter.assetName === 'string') {
            filter.assetName = filter.assetName.trim();
            if (filter.assetName.length === 0) {
                filter.assetName = null;
            }
        }
        let res = await this.service.getListConfig(filter);
        if (res?.status === 200 && res?.data) {
            filter.paging = res?.data.paging;
            if (filter.paging.currentPage !== 1 && (filter.paging.currentPage * filter.paging.pageSize - 10) >= filter.paging.rowsCount) {
                filter.paging.currentPage = 1;
                await this.setState({ filter });
                this.loadForm();
            }
            this.setState({ dataTableAssetRemainingStandard: res?.data?.listData, filter: filter })
        } else {
            this.Notification.error(MESSAGE.ERROR)
        }
    }

    loadCategory = async () => {
        await this.CategoryService.getAllCategory().then(res => { this.setState({ categorys: res?.data?.listData }) });
    }

    renderActionColumn(review, data, index) {
        return <div style={{ textAlign: 'center', justifyContent: 'space-around', display: 'flex' }} key={index}>
            <>
                <Button type='link' onClick={() => this.handleSubmit(index)}>
                    <Image
                        src={doneIcon}
                        preview={false}
                        width={20}
                    ></Image>
                </Button>
            </>
        </div>;
    }

    handleSubmit = async (index) => {
        if (!this.validateCustom(index)) {
            return;
        }
        var data = [...this.state.dataTableAssetRemainingStandard];
        let apiData = data[index];
        apiData.updatedBy = this.state.cValue?.userInfo?.username;
        await this.service.updateStandard(apiData).then(res => {
            if (res?.status === 200) {
                this.Notification.success(MESSAGE.SAVED_SUCCESS);
                setTimeout(() => {
                    this.loadForm();
                }, 200);

            } else {
                this.Notification.error(MESSAGE.ERROR)
            }
        })
    }

    validateCustom(index) {
        var isValid = true;
        var data = [...this.state.dataTableAssetRemainingStandard];
        if (stringNullOrEmpty(data[index].minQuantity) || String(data[index].minQuantity).trim() === ""
            || data[index].minQuantity.length === 0) {
            this.Notification.error("Can't be empty/ không thể để trống");
            isValid &= false;
        }
        if (isValid) {
            if (!Number(data[index].minQuantity)) {
                this.Notification.error("Quantity is number./ số lượng cần nhập là số");
                isValid &= false;
            }
            let quan = Number(data[index].minQuantity);
            if (quan < 0) {
                this.Notification.error('Quantity is positive number./ vui lòng nhập số dương');
                isValid &= false;
            }
        }
        return isValid;
    }

    onChangeValueCustom = (name, value) => {
        // console.log(value)
        let filter = { ...this.state.filter };
        let errors = { ...this.state.errors };
        filter[name] = value;
        errors[name] = '';

        this.setState({
            filter,
            errors
        });
    }

    render() {
        const columnAssetRemainingStandard = [
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
                title: trans('warehouse:standardConfig.assetCategory'),
                dataIndex: 'categoryName',
                key: 'assetCategory',
                width: 250,
            },
            {
                title: trans('warehouse:standardConfig.assetCode'),
                dataIndex: 'assetCode',
                key: 'assetCode',
                width: 150,
            },
            {
                title: trans('warehouse:standardConfig.assetName'),
                dataIndex: 'name',
                key: 'name',
                width: 150,
            },
            {
                title: trans('warehouse:standardConfig.minQuantity'),
                dataIndex: 'minQuantity',
                key: 'minQuantity',
                width: 150,
                render: (review, record, index) => {
                    return (
                        <>
                            <InputNumber
                                style={{ width: '100%' }}
                                id="quantityImport"
                                value={review}
                                onChange={(e) => {
                                    let standard = [...this.state.dataTableAssetRemainingStandard];
                                    standard[index].minQuantity = e;
                                    this.setState({
                                        dataTableAssetRemainingStandard: standard
                                    });
                                }}
                            />
                        </>
                    )
                }
            },
            {
                title: <SettingOutlined />,
                dataIndex: 'action',
                key: 'action',
                width: 70,
                render: (review, record, index) => this.renderActionColumn(review, record, index)
            },
            {
                title: trans('warehouse:standardConfig.note'),
                dataIndex: 'note',
                key: 'note',
                width: 150
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
                                title={trans('warehouse:standardConfig.title')}
                                breadcrumbList={[trans('warehouse:warehouse'), trans('warehouse:standardConfig.title')]}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                            <div className="daily-checklist-container border-form padding-pannel">
                                <Row >
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2}>
                                        <div>
                                            {trans('warehouse:standardConfig.assetCategory')}
                                        </div>
                                        <div>
                                            <SelectCustom
                                                id="categoryName"
                                                onChange={(e, value) => this.onChangeValueCustom('categoryName', e)}
                                                placeholder={trans('common:all')}
                                                value={this.state.filter.categoryName}
                                                options={this.state.categorys}
                                                clear={true}
                                                keyValue="name"
                                            >
                                            </SelectCustom>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={4} xl={2}>
                                        <div className="location-search-title">
                                            {trans('warehouse:standardConfig.assetName')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <Input
                                                id="assetName"
                                                placeholder=''
                                                value={this.state.filter.assetName}
                                                onChange={e => this.onChangeValueCustom('assetName', e.target.value ? e.target.value : null)}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={4} xl={8} style={{
                                        marginTop: '19px',
                                        display: 'flex', justifyContent: 'flex-end'
                                    }}>
                                        <div className="button button-submit daily-checklist-searchbtn" onClick={this.loadData}>
                                            {trans('common:button.search')}
                                        </div>
                                    </Col>

                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginTop: "15px" }}>
                                        <Table
                                            columns={columnAssetRemainingStandard}
                                            dataSource={this.state.dataTableAssetRemainingStandard}
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

export default withTranslation(['warehouse', 'common'])(WarehouseRemainingStandard);
