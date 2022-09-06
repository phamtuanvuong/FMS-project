import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../../layout/Common.css';
import {
    Table, Button, Pagination, Input
} from 'antd';
import 'antd/dist/antd.min.css';
import HeaderPannel from '../../../../../components/HeaderPannel';
import { ACTION, STATUS, MESSAGE } from '../../../../../constants/Constants';
import { AssetCategoryService } from '../../../../../services/main_screen/configuration/AssetCategoryService';
import '../../../../../layout/Configuration.css';
import SelectCustom from '../../../../../components/SelectCustom';
import { showDialog, hideDialog } from '../../../../../components/Dialog';
import { showConfirm, hideDialogConfirm } from '../../../../../components/MessageBox';
import AssetCategoryPopup from './AssetCategoryPopup';
import { Notification } from "../../../../../components/Notification";
import removeIcon from '../../../../../assets/bin.png';
import editIcon from '../../../../../assets/edit.png';
import {
    handleHideNav,
    trans
} from '../../../../../components/CommonFunction';
import { withTranslation } from 'react-i18next';
import { SettingOutlined } from '@ant-design/icons';

class AssetCategoryConfig extends Component {
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
                categoryL1Name: null,
                categoryL2Name: null
            },
        };
        this.Notification = new Notification();
        this.service = new AssetCategoryService();
    }

    componentDidMount() {
        this.loadSelect();
        this.loadForm();
        document.querySelector('.container').addEventListener('click', handleHideNav);
    }

    loadForm = async (currentPage = 1) => {
        let filter = { ...this.state.filter };
        // console.log(filter);
        filter.paging.currentPage = currentPage;
        console.log(filter.categoryL1Name)
        if (typeof filter.categoryL1Name === 'string') {
            filter.categoryL1Name = filter.categoryL1Name.trim();
            if (filter.categoryL1Name.length === 0) {
                filter.categoryL1Name = null;
            }
        }
        this.service.getListCategory(filter).then(res => {
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
        const resCategoryParent = await this.service.getAllCategory();

        if (resCategoryParent && resCategoryParent.data.status === STATUS.SUCCESS) {
            let categoryParent = resCategoryParent?.data?.listData;
            let arrayCategory = [];
            for (let i = 0; i < categoryParent.length; i++) {
                if (categoryParent[i].parentCategory === 0) {
                    arrayCategory.push(
                        {
                            id: categoryParent[i].id,
                            name: categoryParent[i].name
                        }
                    )
                }
            }
            this.setState({
                categoryParent: arrayCategory
            });
        }
        //  else {
        //     this.Notification.error(MESSAGE.ERROR);
        // }
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
        let res = await this.service.deleteCategory(data.id);
        // console.log(res);
        if (res.data.status === STATUS.SUCCESS) {
            hideDialogConfirm();
            this.Notification.success(MESSAGE.DELETE_SUCCESS);
            this.loadForm();
            this.loadSelect();
        } else {
            hideDialogConfirm();
            this.Notification.success(MESSAGE.ERROR);
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
            this.getCategoryForm(action, data),
            action === ACTION.CREATE ? trans("configuration:assetCategory.addCategory"): trans("configuration:assetCategory.updateCategory"),
        )
    }

    getCategoryForm = (action, data) => {
        let categoryParent = [...this.state.categoryParent];
        console.log(categoryParent);
        console.log(data);
        
        if (data.parentCategory === 0) {
            data.parentCategory = null;
        }

        if(data.name && categoryParent) {
            categoryParent = categoryParent.filter(item => item.name !== data.name);
        }

        return (
            <AssetCategoryPopup
                options={{
                    action,
                    data: { ...data },
                    dataNew: data,
                    categoryParent,
                    onComplete: async (rowData) => {
                        // console.log(rowData);
                        if (rowData.parentCategory === null) {
                            rowData.parentCategory = 0;
                        }
                        const res = await this.service.saveCategory(rowData);
                        // console.log(res, 'check apiiii');
                        if (res.data.status === STATUS.SUCCESS) {
                            hideDialog();
                            this.loadForm();
                            this.loadSelect();
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
                title: trans('configuration:assetCategory.assetCategoryName'),
                dataIndex: 'name',
                key: 'name',
                width: 190,
            },
            {
                title: trans('configuration:assetCategory.parentCategory'),
                dataIndex: 'parentName',
                key: 'parentName',
                width: 190,
            },
            {
                title: <SettingOutlined/>,
                dataIndex: 'action',
                key: 'action',
                width: 80,
                render: (review, record) => this.renderActionColumn(review, record)
            },
            {
                title: trans('configuration:note'),
                dataIndex: 'note',
                key: 'note',
                width: 120,
            },
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
                                title={trans('configuration:assetCategory.title')}
                                breadcrumbList={[trans('configuration:assetCategory.configuration'), trans('configuration:assetCategory.assetCategory')]}
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
                                        {trans('configuration:assetCategory.assetName')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <Input
                                                id="categoryL1Name"
                                                placeholder=''
                                                value={this.state.filter.categoryL1Name}
                                                onChange={e =>
                                                    this.onChange(e.target.value.length === 0 ? null : e.target.value, 'categoryL1Name')}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={4} lg={4} xl={3}>
                                        <div className="location-search-title title-input">
                                        {trans('configuration:assetCategory.parentCategory')}
                                        </div>
                                        <div className="location-search-combobox">
                                            <SelectCustom
                                                id="search"
                                                placeholder={trans("common:all")}
                                                onChange={(e, value) => this.onChange(value ? value.children : null, 'categoryL2Name')}
                                                value={this.state.filter.categoryL2Name}
                                                options={this.state.categoryParent}
                                                lable="name"
                                                keyValue="id"
                                                clear={true}
                                            />
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={4} lg={4} xl={6} style={{
                                        marginTop: '24px',
                                        display: 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <Button
                                            className="button-submit button"
                                            onClick={() => { 
                                                this.loadForm();
                                                this.loadSelect();
                                            }}
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

export default withTranslation(['configuration', 'common'])(AssetCategoryConfig);
