import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
// import '../../../../layout/Home.css';
import '../../../../layout/CreateTrouble.css';
import { Form, Image, Tabs, Checkbox, Input, Upload, DatePicker, InputNumber, Button, Table, Tag, Select, List } from 'antd';
import HeaderPannel from '../../../../components/HeaderPannel';
import moment from 'moment';
import {
    onChangeValue,
    focusInvalidInput,
    validateEmpty,
    isUndefindOrEmptyForItemForm,
    handleHideNav,
    formatDateDataTable,
    trans
} from '../../../../components/CommonFunction';
import SelectCustom from '../../../../components/SelectCustom';
import '../../../../layout/CustomizeChecklist.css';
import fileUploadIcon from '../../../../assets/xls-upload.png';
import checkboxHeader from '../../../../assets/create.png';
import 'antd/dist/antd.min.css';
import { WarehouseService } from '../../../../services/main_screen/warehouse/WarehouseService';
import { AssetCategoryService } from '../../../../services/main_screen/configuration/AssetCategoryService';
import { AssetService } from '../../../../services/main_screen/configuration/AssetService';
import removeIcon from '../../../../assets/multiply.png';
import { Notification } from '../../../../components/Notification';
import warningIcon from '../../../../assets/warning.png';
import previewIcon from '../../../../assets/preview-icon.png';
import { URLWEB } from '../../../../constants/Constants';
import doneIcon from '../../../../assets/checked.png';
import { withTranslation } from 'react-i18next';
import { ACTION, MESSAGE, STATUS } from '../../../../constants/Constants';
import { SettingOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { TabPane } = Tabs;
const { Option } = Select;

class WarehouseAsset extends Component {

    constructor(props) {
        super(props);
        this.state = {
            previewVisible: false,
            previewImage: '',
            previewTitle: '',
            requester: '',
            data: {
                assetCodeExport: null,
                assetCodeImport: null,
                assetNameImport: null,
                measureUnit: null,
                category: null,
                disabledAdd: false
            },
            reason: [],
            previewImport: [],
            previewAddImport: [],
            previewExport: [],
            previewAddExport: [],
            errors: {},
            tabActive: '1',
            subTabActive: '1',
            cValue: JSON.parse(localStorage.getItem('cont')),
            measureUnits: [],
            categorys: [],
            fileListImport: [],
            fileListExport: [],
            assets: [],
            typeRefer: URLWEB.deployPath + '/detailTrouble/'
        }
        this.service = new WarehouseService();
        this.AssetCategoryService = new AssetCategoryService();
        this.AssetService = new AssetService();
        this.Notification = new Notification();
    }

    componentDidMount() {
        document.querySelector('.container').addEventListener('click', handleHideNav);
        this.loadAsset();
        this.loadMeasure();
        this.loadCategory();
        this.initData();
    }

    initData = async () => {
        let param = JSON.parse(localStorage.getItem('importParams'));
        if (param) {
            let data = { ...this.state.data };
            let tabActive = this.state.tabActive;
            tabActive = param?.tab ? param?.tab : '1';
            var disabled = false;

            if (param?.tab === '1') {
                data.assetCodeImport = param?.data?.assetCode;
                var res = await this.loadAssetData(data.assetCodeImport);
                data.assetNameImport = res?.name;
                data.measureUnit = res?.measureID;
                data.category = res?.categoryID;
                disabled = true;
            }
            else if (param?.tab === '2') {
                data.assetCodeExport = param?.data?.assetCode;
            }
            this.setState({ tabActive: tabActive, data: data, disabledAdd: disabled });
            localStorage.removeItem('importParams');
        }
    }

    loadMeasure = async () => {
        await this.AssetService.getMeasureUnits().then(res => {
            this.setState({ measureUnits: res?.data?.listData });
        })
    }

    loadCategory = async () => {
        await this.AssetCategoryService.getAllCategory().then(res => { this.setState({ categorys: res?.data?.listData }) })
    }

    loadAsset = async () => {
        await this.service.getAllAsset().then(res => {
            if(res && res.status === STATUS.SUCCESS) {
                this.setState({ assets: res?.data?.listData })
            } else {
                this.Notification.error(MESSAGE.ERROR);
            }
        });
    }

    loadAssetData = async (code) => {
        var res = await this.service.getById(code);
        return res.data?.data;
    }

    handleClickSubmit = (e) => {
        let tabActive = this.state.tabActive;
        let subActive = this.state.subTabActive;
        if (tabActive === '1') {
            if (subActive === '1') {
                if (this.state.previewAddImport.length === 0) {
                    this.Notification.error("Don't have any data to save./ Không có bất kì dữ liệu nào để lưu.", "Empty data");
                    return;
                }
                this.onSaveData(this.state.previewAddImport, 'import');
            }
            else if (subActive === '2') {
                if (this.state.previewImport.length === 0) {
                    this.Notification.error("Don't have any data to save./ Không có bất kì dữ liệu nào để lưu.", "Empty data");
                    return;
                }
                var nameList = ['reason', 'categoryID', 'assetCode', 'assetName', 'measureID'];
                if (!this.validateListData('previewImport', nameList)) {
                    this.Notification.error("Check data import again./ Kiểm tra lại dữ liệu đã import.", "Error at import data");
                    return;
                }
                this.onSaveData(this.state.previewImport, 'import');
            }
        }
        else if (tabActive === '2') {
            if (subActive === '1') {
                if (this.state.previewAddExport.length === 0) {
                    this.Notification.error("Don't have any data to save./ Không có bất kì dữ liệu nào để lưu.", "Empty data");
                    return;
                }
                this.onSaveData(this.state.previewAddExport, 'export');
            }
            else if (subActive === '2') {
                if (this.state.previewExport.length === 0) {
                    this.Notification.error("Don't have any data to save./ Không có bất kì dữ liệu nào để lưu.", "Empty data");
                    return;
                }
                var nameList = ['assetCode'];
                if (!this.validateListData('previewExport', nameList)) {
                    this.Notification.error("Check data import again./ Kiểm tra lại dữ liệu đã import.", "Error at import data");
                    return;
                }
                this.onSaveData(this.state.previewExport, 'export');
            }
        }
    }

    onSaveData = async (list, type) => {
        if (type === 'import') {
            let data = {
                currentUser: this.state.cValue?.userInfo?.username,
                importList: list
            };
            var res = await this.service.saveImportData(data);
            if (res?.status === 200) {
                this.Notification.success("Import successfully!");
                if (this.state.subTabActive === '2') {
                    this.setState({ previewImport: [], fileListImport: [] })
                } else {
                    this.setState({ previewAddImport: [] })
                }
            }
            else {
                this.Notification.error(MESSAGE.ERROR)
            }
        } else if (type == 'export') {
            let data = {
                currentUser: this.state.cValue?.userInfo?.username,
                listData: list
            };
            var res = await this.service.saveExportData(data);
            if (res?.status === 200) {
                this.Notification.success("Export successfully!");
                if (this.state.subTabActive === '2') {
                    this.setState({ previewExport: [], fileListExport: [] })
                } else {
                    this.setState({ previewAddExport: [] })
                }
            }
            else {
                this.Notification.error(MESSAGE.ERROR)
            }
        }
    }


    validate = (tabActive) => {
        var data = { ...this.state.data };
        let fileds = [];

        if (tabActive === '1') {
            fileds = ['importDate', 'reasonImport', 'category', 'assetCodeImport', 'assetNameImport', 'measureUnit', 'quantityImport'];
        } else if (tabActive === '2') {
            fileds = ['exportDate', 'receiver', 'reasonExport', 'assetCodeExport', 'quantityExport'];
        }

        const [isValid, errors] = validateEmpty(data, fileds);
        if (!isValid) {
            focusInvalidInput(errors);
        }

        this.setState({
            errors
        });
        return isValid;
    }


    validateListData = (listName, nameList) => {
        let dataState = { ...this.state };
        var isValid = true;
        dataState[listName].forEach(record => {
            nameList.forEach(name => {
                if (this.state.tabActive === '1') {
                    isValid &= record.isValid;
                }

                if (isValid) {
                    isValid &= record[name] !== null && record[name] !== undefined;
                    if (isValid) {
                        if (name !== 'categoryID' && name !== 'measureID') {
                            isValid &= record[name].trim().length > 0;
                        }
                    }
                    if (this.state.tabActive === '2') {
                        isValid &= record.errorQuantity === null || record.errorQuantity.trim().length === 0
                        isValid &= record.quantity > 0
                    }
                }
            });
        })
        return isValid;
    }

    validateRefLink = async () => {
        let ref = this.state.typeRefer;
        let issue = this.state.data.referenceIssue;
        if (issue !== null || issue !== undefined) {
            if (issue.trim().length > 0) {
                let error = { ...this.state.errors };
                let isValidURL = this.state.isValidURL;
                let validate = {
                    references: ref + issue
                };
                await this.service.validateURL(validate).then(res => {
                    if (res?.status === 200) {
                        isValidURL = 'success';
                        error['referenceIssue'] = trans('warehouse:importExport.validURL');
                    } else {
                        isValidURL = 'error';
                        error['referenceIssue'] = trans('warehouse:importExport.errorURL');
                    }
                    this.setState({
                        errors: error, isValidURL: isValidURL
                    })
                });
            }
        }



    }

    onChangeValueCustom = (name, refName, value) => {
        const data = { ...this.state.data };
        const errors = { ...this.state.errors };
        data[name] = value;
        errors[refName] = '';

        this.setState({
            data,
            errors
        })
    }

    disabledFromDate = (current) => {
        if (this.state.data.returnDate) {
            return moment(current, 'DD/MM/YYYY') >= moment(this.state.data.returnDate, 'DD/MM/YYYY');
        }
        return '';
    };

    disabledToDate = (current) => {
        if (this.state.data.borrowedDate) {
            return moment(current, 'DD/MM/YYYY') <= moment(this.state.data.borrowedDate, 'DD/MM/YYYY');
        }
        return '';
    };

    onChangeValueReason = (name, value) => {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };

        data[name] = value;
        errors[name] = '';
        if (value.toLowerCase() === 'bổ sung thêm') {
            this.state.disabledField = true;
        } else {
            this.state.disabledField = false;
        }
        this.setState({ data, errors });
    }

    handleChangeTab = (e) => {
        this.loadAsset();
        this.loadMeasure();
        this.loadCategory();
        this.setState({
            tabActive: e, subTabActive: '1'
        })
    }

    handleChangeTabImport = (e) => {
        if (e === 1) {
            this.setState({
                subTabActive: e, previewImport: [], fileListImport: [], previewExport: [], fileListExport: []
            });
        } else {
            this.setState({
                subTabActive: e, previewAddImport: [], previewAddExport: []
            });
        }

    }

    onImport = async (file) => {
        var item = file.fileList[0].originFileObj;
        if (this.state.tabActive === '1') {
            await this.service.importExcel(item).then(res => {
                if (res && res.status === 200) {
                    this.setState({ previewImport: res?.data?.listData, fileListImport: file.fileList });
                } else {
                    this.Notification.error("Please check import file again!/ Hãy check lại file import!", "Error at import file");
                    this.setState({ previewImport: [], fileListImport: [] });
                }
            });
        } else if (this.state.tabActive === '2') {
            await this.service.importExportExcel(item).then(res => {
                if (res && res.status === 200) {
                    this.setState({ previewExport: res?.data?.listData, fileListExport: file.fileList });
                } else {
                    this.Notification.error("Please check import file again!/ Hãy check lại file import!", "Error at import file");
                    this.setState({ previewExport: [], fileListExport: [] });
                }
            });
        }
    }

    onDownloadTemplate = async () => {
        var filename = 'Template.xlsx';
        if (this.state.tabActive === '1') {
            await this.service.downloadTemplate().then(res => {
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
        else if (this.state.tabActive === '2') {
            await this.service.downloadTemplateExport().then(res => {
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
    }

    onAddItem = async () => {
        let data = { ...this.state.data };
        let err = { ...this.state.errors };
        if (this.state.tabActive === '1') {
            if (!this.validate('1')) {
                return;
            }

            var res = await this.service.getById(this.state.data.assetCodeImport);
            if (res?.status === 200 && res?.data?.data) {
                let updateData = res?.data?.data;
                if (updateData?.categoryID !== data.category || updateData.measureID !== data.measureUnit
                    || updateData.name !== data.assetNameImport) {
                    this.Notification.error("Nội dung này đã tồn tại và đã thay đổi giá trị. Vui lòng kiểm tra lại!", "Lỗi dữ liệu");
                    data.category = updateData.categoryID;
                    data.measureUnit = updateData.measureID;
                    data.assetNameImport = updateData.name;
                    data.measureName = this.state.measureUnits.filter((elm) => elm.id === updateData.measureID)[0]?.name;
                    data.categoryName = this.state.categorys.filter((elm) => elm.id === updateData.categoryID)[0]?.name;
                    data.disabledAdd = true;
                    this.setState({
                        data: data
                    });
                    return;
                }
                data.isExist = true;
            }
            let listAdd = [...this.state.previewAddImport];
            listAdd.push({
                assetCode: data.assetCodeImport,
                assetName: data.assetNameImport,
                importDate: data.importDate,
                categoryID: data.category,
                reason: data.reasonImport,
                measureID: data.measureUnit,
                quantity: data.quantityImport,
                isReady: data.isReady,
                categoryName: data.categoryName,
                measureName: data.measureName,
                isExist: data.isExist ? true : false
            });
            data.measureUnit = null;
            data.reasonImport = null;
            data.category = null;
            data.assetCodeImport = null;
            data.assetNameImport = null;
            data.quantityImport = null;
            data.isExist = null;
            data.isReady = false;
            this.setState({ previewAddImport: listAdd, data: data });
        } else if (this.state.tabActive === '2') {
            if (!this.validate('2')) {
                return;
            }
            if (data.referenceIssue && data.referenceIssue?.trim()?.length > 0) {
                if (this.state.isValidURL !== 'success') {
                    this.Notification.error('Vui lòng nhấp để xác thực URL trước.')
                    return;
                }
            }
            var isValid = true;
            await this.service.getById(data.assetCodeExport).then(res => {
                if (res?.data?.data?.remainingQuantity < data.quantityExport) {
                    err.quantityExport = 'Không đủ số lượng để xuất.';
                    this.setState({ errors: err });
                    isValid = false;
                }
            })
            if (isValid) {
                let listAdd = [...this.state.previewAddExport];
                listAdd.push({
                    receiver: data.receiver,
                    reason: data.reasonExport,
                    assetCode: data.assetCodeExport,
                    quantity: data.quantityExport,
                    references: this.state.typeRefer + data.referenceIssue,
                    exportDate: data.exportDate
                });
                data.receiver = null;
                data.reasonExport = null;
                data.assetCodeExport = null
                data.quantityExport = null;
                data.referenceIssue = null;
                data.isValidURL = '';
                err.referenceIssue = '';

                this.setState({ data: data, previewAddExport: listAdd, errors: err });
            }
        }
    }

    onChangeDate(name, value) {
        let data = { ...this.state.data };
        let errors = { ...this.state.errors };
        var now = new Date();
        if (moment(value, 'DD/MM/YYYY') > moment(now, 'DD/MM/YYYY')) {
            errors[name] = 'Ngày không được lớn hơn ngày hôm nay.';
        }
        else {
            data[name] = value ? moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
            errors[name] = '';
        }
        this.setState({
            data,
            errors
        });
    }

    render() {
        const importCols = [
            {
                title: '#',
                dataIndex: 'index',
                key: 'index',
                width: 60,
                render: function (text, record, index) {
                    return <div>
                        {
                            !record.isExist ?
                                <Tag color={'green'}>{trans('warehouse:importExport.new')}</Tag>
                                : null
                        }
                        {
                            !record.isValid ?
                                <Tag color={'#BA1C30'}>{trans('warehouse:importExport.invalidData')}</Tag>
                                : null
                        }
                        {++index}
                    </div>
                }
            },
            {
                title: trans('warehouse:importExport.importDate'),
                dataIndex: 'importDate',
                key: 'importDate',
                width: 80,
                render: (value) => formatDateDataTable(value)
            },
            {
                title: trans('warehouse:importExport.reason'),
                dataIndex: 'reason',
                key: 'reason',
                width: 110
            },
            {
                title: trans('warehouse:importExport.category'),
                dataIndex: 'categoryName',
                width: 130,
                render: (value, record, index) => {
                    return (
                        <>
                            <SelectCustom
                                id="category"
                                onChange={(e, value) => {
                                    let previewImport = [...this.state.previewImport];
                                    previewImport[index].categoryID = value.value;
                                    this.setState({ previewImport: previewImport });
                                }}
                                placeholder={trans('warehouse:importExport.categoryPlaceholder')}
                                value={record.categoryID}
                                options={this.state.categorys}
                                keyValue='id'
                                disabled={record.isExist}
                            />
                            <div className="small-description decription-input" style={{ color: 'red' }}>{record.categoryError}</div>
                        </>
                    );
                }
            },
            {
                title: trans('warehouse:importExport.assetCode'),
                dataIndex: 'assetCode',
                key: 'assetCode',
                width: 100
            },
            {
                title: trans('warehouse:importExport.assetName'),
                dataIndex: 'assetName',
                key: 'assetName',
                width: 100
            },
            {
                title: trans('warehouse:importExport.measureUnit'),
                dataIndex: 'measureName',
                key: 'measureName',
                width: 100,
                render: (value, record, index) => {
                    return (
                        <>
                            <SelectCustom
                                id="measureUnit"
                                onChange={(e, value) => {
                                    let previewImport = [...this.state.previewImport];
                                    previewImport[index].measureID = value.value;
                                    this.setState({ previewImport: previewImport });
                                }}
                                placeholder={trans('warehouse:importExport.measureUnitPlacholder')}
                                value={record.measureID}
                                options={this.state.measureUnits}
                                keyValue='id'
                                disabled={record.isExist}
                            />
                            <div className="small-description decription-input" style={{ color: 'red' }}>{record.measureError}</div>
                        </>
                    );
                }
            },
            {
                title: trans('warehouse:importExport.quantity'),
                dataIndex: 'quantity',
                key: 'quantity',
                width: 100
            },
            {
                title: trans('warehouse:importExport.readyToUse'),
                dataIndex: 'isReady',
                key: 'isReady',
                width: 100,
                render: (value) => {
                    return (
                        <Checkbox checked={value} />
                    )
                }
            },
            {
                title: <SettingOutlined />,
                dataIndex: 'action',
                key: 'action',
                width: 100,
                render: (review, record, index) => {
                    return (
                        <Button type="link" style={{ padding: 0 }}
                            onClick={e => {
                                let previewImport = [...this.state.previewImport];
                                previewImport.splice(index, 1);
                                this.setState({ previewImport: previewImport });
                            }}
                            title={'Remove'}
                        >
                            <Image src={removeIcon} width={20} preview={false} />
                        </Button>
                    );
                }
            }
        ];

        const importAddCols = [
            {
                title: '#',
                dataIndex: 'index',
                key: 'index',
                width: 60,
                render: function (text, record, index) {
                    return <div>
                        {++index}
                    </div>
                }
            },
            {
                title: trans('warehouse:importExport.importDate'),
                dataIndex: 'importDate',
                key: 'importDate',
                width: 80,
                render: (value) => formatDateDataTable(value)
            },
            {
                title: trans('warehouse:importExport.reason'),
                dataIndex: 'reason',
                key: 'reason',
                width: 110
            },
            {
                title: trans('warehouse:importExport.category'),
                dataIndex: 'categoryName',
                width: 130
            },
            {
                title: trans('warehouse:importExport.assetCode'),
                dataIndex: 'assetCode',
                key: 'assetCode',
                width: 100
            },
            {
                title: trans('warehouse:importExport.assetName'),
                dataIndex: 'assetName',
                key: 'assetName',
                width: 100
            },
            {
                title: trans('warehouse:importExport.measureUnit'),
                dataIndex: 'measureName',
                key: 'measureName',
                width: 100
            },
            {
                title: trans('warehouse:importExport.quantity'),
                dataIndex: 'quantity',
                key: 'quantity',
                width: 100
            },
            {
                title: trans('warehouse:importExport.readyToUse'),
                dataIndex: 'isReady',
                key: 'isReady',
                width: 100,
                render: (value) => {
                    return (
                        <Checkbox checked={value} />
                    )
                }
            },
            {
                title: <SettingOutlined />,
                dataIndex: 'action',
                key: 'action',
                width: 100,
                render: (review, record, index) => {
                    return (
                        <Button type="link" style={{ padding: 0 }}
                            onClick={e => {
                                let previewImport = [...this.state.previewAddImport];
                                previewImport.splice(index, 1);
                                this.setState({ previewAddImport: previewImport });
                            }}
                            title={'Remove'}
                        >
                            <Image src={removeIcon} width={20} preview={false} />
                        </Button>
                    );
                }
            }
        ];

        const selectBefore = (
            <Select value={this.state.typeRefer} className="select-before"
                onChange={(e, value) =>
                    this.setState({ typeRefer: value?.value })
                }
            >
                <Option value={URLWEB.deployPath + '/detailTrouble/'}>{URLWEB.deployPath + '/detailTrouble/'}</Option>
                <Option value={URLWEB.deployPath + '/checklistDetail/'}>{URLWEB.deployPath + '/checklistDetail/'}</Option>
            </Select>
        );

        const exportCols = [
            {
                title: '#',
                dataIndex: 'index',
                key: 'index',
                width: 40,
                render: function (text, record, index) {
                    return <div>
                        {++index}
                    </div>
                }
            },
            {
                title: trans('warehouse:importExport.exportDate'),
                dataIndex: 'exportDate',
                key: 'exportDate',
                width: 80,
                render: (value) => formatDateDataTable(value)
            },

            {
                title: trans('warehouse:importExport.assetCode'),
                dataIndex: 'assetCode',
                key: 'assetCode',
                width: 150,
                render: (value, record, index) => {
                    return (
                        <>
                            <SelectCustom
                                id="assetCode"
                                onChange={async (e, value) => {
                                    let preview = [...this.state.previewExport];
                                    preview[index].errorCode = '';
                                    preview[index].assetCode = value?.value;
                                    await this.service.getById(record.assetCode).then(res => {
                                        if (res?.data?.data?.remainingQuantity < record.quantity) {
                                            preview[index].errorQuantity = <span>{trans('warehouse:importExport.remainingQuantity')}
                                                [{res?.data?.data?.remainingQuantity}] &lt; [{record.quantity}]</span>;
                                        }
                                    });

                                    this.setState({ previewExport: preview });

                                }}
                                placeholder={trans('warehouse:importExport.assetCodePlaceholder')}
                                value={record.assetCode}
                                options={this.state.assets}
                                keyValue='assetCode'
                                subValue='assetCode'
                            />
                            <div className="small-description decription-input" style={{ color: 'red' }}>{record.errorCode}</div>
                        </>
                    );
                }
            },
            {
                title: trans('warehouse:importExport.quantity'),
                dataIndex: 'quantity',
                key: 'quantity',
                width: 70,
                render: (value, record) => {
                    return (
                        <>
                            {value}
                            <div className="small-description decription-input" style={{ color: 'red' }}>{record.errorQuantity}</div>
                        </>
                    )
                }
            },
            {
                title: trans('warehouse:importExport.reason'),
                dataIndex: 'reason',
                key: 'reason',
                width: 150
            },
            {
                title: trans('warehouse:importExport.references'),
                dataIndex: 'references',
                key: 'references',
                width: 150,
                render: (value, record) => {
                    if (record.errorRefer !== "Invalid URL") {
                        return (
                            <a href={value} target='_blank' >{value}</a>
                        )
                    } else {
                        return (
                            <div className="small-description decription-input" style={{ color: 'red' }}>{record.errorRefer}</div>
                        );
                    }
                }
            },
            {
                title: <SettingOutlined />,
                dataIndex: 'action',
                key: 'action',
                width: 100,
                render: (review, record, index) => {
                    return (
                        <Button type="link" style={{ padding: 0 }}
                            onClick={e => {
                                let preview = [...this.state.previewExport];
                                preview.splice(index, 1);
                                this.setState({ previewExport: preview });
                            }}
                            title={'Remove'}
                        >
                            <Image src={removeIcon} width={20} preview={false} />
                        </Button>
                    );
                }
            }
        ];

        const exportAddCols = [
            {
                title: '#',
                dataIndex: 'index',
                key: 'index',
                width: 40,
                render: function (text, record, index) {
                    return <div>
                        {++index}
                    </div>
                }
            },
            {
                title: trans('warehouse:importExport.exportDate'),
                dataIndex: 'exportDate',
                key: 'exportDate',
                width: 80,
                render: (value) => formatDateDataTable(value)
            },

            {
                title: trans('warehouse:importExport.assetCode'),
                dataIndex: 'assetCode',
                key: 'assetCode',
                width: 150
            },
            {
                title: trans('warehouse:importExport.quantity'),
                dataIndex: 'quantity',
                key: 'quantity',
                width: 70
            },
            {
                title: trans('warehouse:importExport.reason'),
                dataIndex: 'reason',
                key: 'reason',
                width: 150
            },
            {
                title: trans('warehouse:importExport.references'),
                dataIndex: 'references',
                key: 'references',
                width: 150
            },
            {
                title: <SettingOutlined />,
                dataIndex: 'action',
                key: 'action',
                width: 100,
                render: (review, record, index) => {
                    return (
                        <Button type="link" style={{ padding: 0 }}
                            onClick={e => {
                                let preview = [...this.state.previewAddExport];
                                preview.splice(index, 1);
                                this.setState({ previewAddExport: preview });
                            }}
                            title={'Remove'}
                        >
                            <Image src={removeIcon} width={20} preview={false} />
                        </Button>
                    );
                }
            }
        ];
        return (
            <>
                <div className="container">
                    <Row>
                        <Col
                            style={{ marginBottom: "10px" }}
                        >
                            <HeaderPannel
                                classNameCustom="create-trouble"
                                title={trans('warehouse:importExport.title')}
                                breadcrumbList={[trans('warehouse:warehouse'), trans('warehouse:importExport.breadcum')]}
                                buttons={[
                                    {
                                        title: trans('common:button.submit'),
                                        classNameCustom: 'submit',
                                        action: () => this.handleClickSubmit
                                    },
                                ]}
                            />
                        </Col>
                        <Form layout="vertical" colon={false}>
                            <Tabs defaultActiveKey="1" onChange={e => this.handleChangeTab(e)} activeKey={this.state.tabActive}>
                                <TabPane tab={<b>{trans('warehouse:importExport.import')}</b>} key="1">
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                        <div className="room-inside-container">
                                            <Row>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <Tabs defaultActiveKey="1" onChange={e => this.handleChangeTabImport(e)} activeKey={this.state.subTabActive}>
                                                        <TabPane tab={<b>{trans('warehouse:importExport.usingForm')}</b>} key="1">
                                                            <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                    <div className="create-checklist">
                                                                        <Row>
                                                                            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                                <div className="create-checklist-title">
                                                                                    <Image
                                                                                        src={checkboxHeader}
                                                                                        preview={false}
                                                                                        width={20}
                                                                                    ></Image> <b>{trans('warehouse:importExport.importTitle')}</b>
                                                                                </div>
                                                                            </Col>
                                                                            <Col xs={12} sm={6} md={6} lg={4} xl={3}>
                                                                                <Form.Item
                                                                                    label={trans('warehouse:importExport.importDate')}
                                                                                    help={this.state.errors.importDate}
                                                                                    required
                                                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.importDate)}
                                                                                >
                                                                                    <DatePicker
                                                                                        onChange={(e, timeString) => this.onChangeDate('importDate', timeString)} format='DD/MM/YYYY' />
                                                                                </Form.Item>
                                                                            </Col>
                                                                            <Col xs={12} sm={6} md={6} lg={4} xl={3}>
                                                                                <Form.Item
                                                                                    required
                                                                                    label={trans('warehouse:importExport.reason')}
                                                                                    help={this.state.errors.reasonImport}
                                                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.reasonImport)}
                                                                                >
                                                                                    <Input
                                                                                        id="reasonImport"
                                                                                        placeholder='Bổ sung mới'
                                                                                        value={this.state.data.reasonImport}
                                                                                        maxLength={100}
                                                                                        onChange={e => onChangeValue(this, 'reasonImport', e.target.value)} />
                                                                                </Form.Item>
                                                                            </Col>
                                                                            <Col xs={12} sm={6} md={6} lg={4} xl={3}>
                                                                                <Form.Item
                                                                                    required
                                                                                    label={trans('warehouse:importExport.category')}
                                                                                    help={this.state.errors.category}
                                                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.category)}
                                                                                >
                                                                                    <SelectCustom
                                                                                        id="category"
                                                                                        onChange={(e, value) => {
                                                                                            let data = { ...this.state.data };
                                                                                            data.category = value.value;
                                                                                            data.categoryName = value.children;
                                                                                            this.setState({ data: data });
                                                                                        }}
                                                                                        disabled={this.state.disabledAdd}
                                                                                        placeholder={trans('warehouse:importExport.categoryPlaceholder')}
                                                                                        value={this.state.data.category}
                                                                                        options={this.state.categorys}
                                                                                        keyValue='id'
                                                                                    />
                                                                                </Form.Item>
                                                                            </Col>
                                                                            <Col xs={12} sm={6} md={6} lg={4} xl={3}>
                                                                                <Form.Item
                                                                                    required
                                                                                    label={trans('warehouse:importExport.assetCode')}
                                                                                    help={this.state.errors.assetCodeImport}
                                                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.assetCodeImport)}
                                                                                >
                                                                                    <Input
                                                                                        id="assetCodeImport"
                                                                                        placeholder='HTC.BD0001'
                                                                                        value={this.state.data.assetCodeImport}
                                                                                        onChange={e => {
                                                                                            onChangeValue(this, 'assetCodeImport', e.target.value);
                                                                                            this.setState({ disabledAdd: false });
                                                                                        }}
                                                                                    />
                                                                                </Form.Item>
                                                                            </Col>
                                                                            <Col xs={12} sm={12} md={12} lg={8} xl={3}>
                                                                                <Form.Item
                                                                                    required
                                                                                    label={trans('warehouse:importExport.assetName')}
                                                                                    help={this.state.errors.assetNameImport}
                                                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.assetNameImport)}
                                                                                >
                                                                                    <Input
                                                                                        id="assetNameImport"
                                                                                        placeholder='Bóng đèn 25W'
                                                                                        maxLength={255}
                                                                                        disabled={this.state.disabledAdd}
                                                                                        value={this.state.data.assetNameImport}
                                                                                        onChange={e => onChangeValue(this, 'assetNameImport', e.target.value)}
                                                                                    />
                                                                                </Form.Item>
                                                                            </Col>
                                                                            <Col xs={12} sm={6} md={6} lg={4} xl={3}>
                                                                                <Form.Item
                                                                                    required
                                                                                    label={trans('warehouse:importExport.measureUnit')}
                                                                                    help={this.state.errors.measureUnit}
                                                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.measureUnit)}
                                                                                >
                                                                                    <SelectCustom
                                                                                        id="measureUnit"
                                                                                        onChange={(e, value) => {
                                                                                            let data = { ...this.state.data };
                                                                                            data.measureUnit = value.value;
                                                                                            data.measureName = value.children;
                                                                                            this.setState({ data: data });
                                                                                        }}
                                                                                        placeholder={trans('warehouse:importExport.measureUnitPlacholder')}
                                                                                        value={this.state.data.measureUnit}
                                                                                        options={this.state.measureUnits}
                                                                                        disabled={this.state.disabledAdd}
                                                                                        keyValue='id'
                                                                                    />
                                                                                </Form.Item>
                                                                            </Col>
                                                                            <Col xs={12} sm={6} md={6} lg={4} xl={3}>
                                                                                <Form.Item
                                                                                    required
                                                                                    label={trans('warehouse:importExport.quantity')}
                                                                                    help={this.state.errors.quantityImport}
                                                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.quantityImport)}
                                                                                >
                                                                                    <InputNumber
                                                                                        style={{ width: '100%' }}
                                                                                        id="quantityImport"
                                                                                        min={1}
                                                                                        max={10000000}
                                                                                        value={this.state.data.quantityImport}
                                                                                        onChange={(e) => onChangeValue(this, 'quantityImport', e)} />
                                                                                </Form.Item>
                                                                            </Col>
                                                                            <Col xs={12} sm={12} md={6} lg={4} xl={3}>
                                                                                <div className="edit-default" style={{ marginTop: '30px' }}>
                                                                                    <Checkbox
                                                                                        checked={this.state.data.isReady}
                                                                                        onChange={e => onChangeValue(this, 'isReady', e.target.checked)}
                                                                                        style={{ marginLeft: "15px" }}
                                                                                    >&nbsp;&nbsp;{trans('warehouse:importExport.readyToUse')}</Checkbox>
                                                                                </div>
                                                                            </Col>
                                                                            <Col xs={12} sm={12} md={12} lg={12} xl={12} className="col-search" style={{
                                                                                height: '43px',
                                                                                paddingTop: '3px',
                                                                                display: 'flex'
                                                                            }}>
                                                                                <div className="button button-submit daily-checklist-searchbtn" onClick={this.onAddItem}>
                                                                                    {trans('warehouse:importExport.add')}
                                                                                </div>
                                                                            </Col>
                                                                        </Row>
                                                                    </div>

                                                                    <Col xs={12} sm={12} md={12} lg={12} xl={12}
                                                                        style={{ marginTop: '20px' }}
                                                                    >
                                                                        <span style={{ color: '#084DFF' }}>
                                                                            <Image src={previewIcon} preview={false} width={18}></Image>  &nbsp;
                                                                            {trans('common:button.preview')}
                                                                        </span>
                                                                        <div className="small-description decription-input">
                                                                            {trans('warehouse:importExport.noteBeforeSubmit')}
                                                                        </div>
                                                                    </Col>
                                                                    <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                        <Table
                                                                            columns={importAddCols}
                                                                            dataSource={this.state.previewAddImport}
                                                                            pagination={false}
                                                                            size="middle"
                                                                            scroll={{
                                                                                y: 340,
                                                                            }}
                                                                        />
                                                                    </Col>
                                                                </Col>
                                                            </Col>
                                                        </TabPane>

                                                        <TabPane tab={<b>{trans('warehouse:importExport.usingImport')}</b>} key="2">
                                                            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                <div className="create-checklist">
                                                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} >
                                                                        <div className="create-checklist-title">
                                                                            <Image
                                                                                src={checkboxHeader}
                                                                                preview={false}
                                                                                width={20}
                                                                            ></Image> <b>{trans('warehouse:importExport.importExcelTitle')}</b>
                                                                        </div>
                                                                    </Col>
                                                                    <Col
                                                                        xs={12}
                                                                        sm={12}
                                                                        md={12}
                                                                        lg={12}
                                                                        xl={12}
                                                                    >
                                                                        <Dragger
                                                                            name="file"
                                                                            multiple={false}
                                                                            beforeUpload={file => false}
                                                                            accept='.xlsx'
                                                                            fileList={this.state.fileListImport}
                                                                            maxCount={1}
                                                                            style={{ display: 'flex', borderRadius: '8px', marginTop: '20px' }}
                                                                            onChange={this.onImport}
                                                                        >
                                                                            <Image
                                                                                src={fileUploadIcon}
                                                                                preview={false}
                                                                                width={20}
                                                                                onClick={this.handleSubmitNewItem}
                                                                            ></Image>
                                                                            <span style={{ fontSize: '15px' }}>{trans('warehouse:importExport.importFromExcel')}</span>
                                                                        </Dragger>
                                                                    </Col>
                                                                    <Col
                                                                        xs={12}
                                                                        sm={12}
                                                                        md={12}
                                                                        lg={12}
                                                                        xl={12}
                                                                    >
                                                                        <span style={{ fontSize: '14px' }}>
                                                                            <Image src={warningIcon} preview={false} width={18}></Image>  &nbsp;
                                                                            {trans('warehouse:importExport.noteUploadFile')}
                                                                            <Button type='link' style={{ fontSize: '14px', fontStyle: 'italic', marginLeft: '-12px' }}
                                                                                onClick={(e) => this.onDownloadTemplate()}
                                                                            > {trans('warehouse:importExport.here')}</Button>
                                                                        </span>
                                                                    </Col>
                                                                </div>

                                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}
                                                                    style={{ marginTop: '20px' }}
                                                                >
                                                                    <span style={{ color: '#084DFF' }}>
                                                                        <Image src={previewIcon} preview={false} width={18}></Image>  &nbsp;
                                                                        {trans('common:button.preview')}
                                                                    </span>
                                                                    <div className="small-description decription-input">
                                                                        {trans('warehouse:importExport.noteBeforeSubmit')}
                                                                    </div>
                                                                </Col>

                                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                    <Table
                                                                        columns={importCols}
                                                                        dataSource={this.state.previewImport}
                                                                        pagination={false}
                                                                        size="middle"
                                                                        scroll={{
                                                                            y: 340,
                                                                        }}
                                                                    />
                                                                </Col>

                                                            </Col>
                                                        </TabPane>
                                                    </Tabs>
                                                </Col>
                                            </Row>

                                        </div>
                                    </Col>
                                </TabPane>

                                <TabPane tab={<b>{trans('warehouse:importExport.export')}</b>} key="2">
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                        <div className="room-inside-container">
                                            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                <Tabs defaultActiveKey="1" onChange={e => this.handleChangeTabImport(e)} activeKey={this.state.subTabActive}>
                                                    <TabPane tab={<b>{trans('warehouse:importExport.usingForm')}</b>} key="1">
                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                                            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                <div className="create-checklist">
                                                                    <Row>
                                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                            <div className="create-checklist-title">
                                                                                <Image
                                                                                    src={checkboxHeader}
                                                                                    preview={false}
                                                                                    width={20}
                                                                                ></Image> <b>{trans('warehouse:importExport.exportTitle')}</b>
                                                                            </div>
                                                                        </Col>
                                                                        <Col xs={12} sm={6} md={6} lg={4} xl={2}>
                                                                            <Form.Item
                                                                                label={trans('warehouse:importExport.exportDate')}
                                                                                help={this.state.errors.exportDate}
                                                                                required
                                                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.exportDate)}
                                                                            >
                                                                                <DatePicker
                                                                                    onChange={(e, timeString) => this.onChangeDate('exportDate', timeString)} format='DD/MM/YYYY' />
                                                                            </Form.Item>
                                                                        </Col>
                                                                        <Col xs={12} sm={6} md={6} lg={4} xl={2}>
                                                                            <Form.Item
                                                                                required
                                                                                label={trans('warehouse:importExport.receiver')}
                                                                                help={this.state.errors.receiver}
                                                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.receiver)}
                                                                            >
                                                                                <Input
                                                                                    id="receiver"
                                                                                    maxLength={255}
                                                                                    onChange={(e) => onChangeValue(this, 'receiver', e.target.value)}
                                                                                    placeholder=''
                                                                                    value={this.state.data.receiver}
                                                                                />
                                                                            </Form.Item>
                                                                        </Col>

                                                                        <Col xs={12} sm={6} md={4} lg={4} xl={4}>
                                                                            <Form.Item
                                                                                required
                                                                                label={trans('warehouse:importExport.assetCode')}
                                                                                help={this.state.errors.assetCodeExport}
                                                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.assetCodeExport)}
                                                                            >
                                                                                <SelectCustom
                                                                                    id="assetCodeExport"
                                                                                    onChange={(e, value) => {
                                                                                        onChangeValue(this, 'assetCodeExport', value?.value);
                                                                                        let err = { ...this.state.errors };
                                                                                        err.quantityExport = '';
                                                                                        this.setState({ errors: err });
                                                                                    }}
                                                                                    placeholder={trans('warehouse:importExport.assetCodePlaceholder')}
                                                                                    value={this.state.data.assetCodeExport}
                                                                                    options={this.state.assets}
                                                                                    keyValue='assetCode'
                                                                                    subValue='assetCode'
                                                                                />
                                                                            </Form.Item>
                                                                        </Col>

                                                                        <Col xs={12} sm={6} md={6} lg={4} xl={2}>
                                                                            <Form.Item
                                                                                required
                                                                                label={trans('warehouse:importExport.quantity')}
                                                                                help={this.state.errors.quantityExport}
                                                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.quantityExport)}
                                                                            >
                                                                                <InputNumber
                                                                                    style={{ width: '100%' }}
                                                                                    id="quantityExport"
                                                                                    min={1} max={10000000}
                                                                                    value={this.state.data.quantityExport}
                                                                                    onChange={(e) => onChangeValue(this, 'quantityExport', e)} />
                                                                            </Form.Item>
                                                                        </Col>
                                                                        <Col xs={12} sm={6} md={6} lg={4} xl={4}>
                                                                            <Form.Item
                                                                                required
                                                                                label={trans('warehouse:importExport.reason')}
                                                                                help={this.state.errors.reasonExport}
                                                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.reasonExport)}
                                                                            >
                                                                                <Input
                                                                                    id="reasonExport"
                                                                                    onChange={(e) => onChangeValue(this, 'reasonExport', e.target.value)}
                                                                                    placeholder=''
                                                                                    value={this.state.data.reasonExport}
                                                                                />
                                                                            </Form.Item>
                                                                        </Col>
                                                                        <Col xs={12} sm={12} md={12} lg={8} xl={6}>
                                                                            <Form.Item
                                                                                label={trans('warehouse:importExport.referenceIssue')}
                                                                                help={this.state.errors.referenceIssue}
                                                                                validateStatus={this.state.isValidURL}
                                                                            >
                                                                                <Input
                                                                                    id="referenceIssue"
                                                                                    addonBefore={selectBefore}
                                                                                    placeholder='id'
                                                                                    value={this.state.data.referenceIssue}
                                                                                    onChange={e => {
                                                                                        onChangeValue(this, 'referenceIssue', e.target.value);
                                                                                        let err = { ... this.state.errors };
                                                                                        let isValidURL = this.state.isValidURL;
                                                                                        isValidURL = 'success';
                                                                                        err['referenceIssue'] = '';
                                                                                        this.setState({ isValidURL: isValidURL, errors: err });
                                                                                    }}
                                                                                />
                                                                            </Form.Item>
                                                                        </Col>

                                                                        <Col xs={12} sm={12} md={12} lg={8} xl={1}>
                                                                            <Form.Item label={trans('warehouse:importExport.checkRef')}>
                                                                                <Button type='link' title='Check reference link'
                                                                                    onClick={(e) => this.validateRefLink()}
                                                                                >
                                                                                    <Image src={doneIcon} preview={false} width={27} />
                                                                                </Button>
                                                                            </Form.Item>
                                                                        </Col>

                                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12} className="col-search" style={{
                                                                            height: '43px',
                                                                            paddingTop: '3px',
                                                                            display: 'flex'
                                                                        }}>
                                                                            <div className="button button-submit daily-checklist-searchbtn" onClick={this.onAddItem}>
                                                                                {trans('warehouse:importExport.add')}
                                                                            </div>
                                                                        </Col>
                                                                    </Row>
                                                                </div>
                                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}
                                                                    style={{ marginTop: '20px' }}
                                                                >
                                                                    <span style={{ color: '#084DFF' }}>
                                                                        <Image src={previewIcon} preview={false} width={18}></Image>  &nbsp;
                                                                        {trans('common:button.preview')}
                                                                    </span>
                                                                    <div className="small-description decription-input">
                                                                        {trans('warehouse:importExport.noteBeforeSubmit')}
                                                                    </div>
                                                                </Col>
                                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                    <Table
                                                                        columns={exportAddCols}
                                                                        dataSource={this.state.previewAddExport}
                                                                        pagination={false}
                                                                        size="middle"
                                                                        scroll={{
                                                                            y: 340,
                                                                        }}
                                                                    />
                                                                </Col>
                                                            </Col>
                                                        </Col>
                                                    </TabPane>


                                                    <TabPane tab={<b>{trans('warehouse:importExport.usingImport')}</b>} key="2">
                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                            <div className="create-checklist">
                                                                <Col xs={12} sm={12} md={12} lg={12} xl={12} >
                                                                    <div className="create-checklist-title">
                                                                        <Image
                                                                            src={checkboxHeader}
                                                                            preview={false}
                                                                            width={20}
                                                                        ></Image> <b>{trans('warehouse:importExport.exportTitle')}</b>
                                                                    </div>
                                                                </Col>
                                                                <Col
                                                                    xs={12}
                                                                    sm={12}
                                                                    md={12}
                                                                    lg={12}
                                                                    xl={12}
                                                                >
                                                                    <Dragger
                                                                        name="file"
                                                                        multiple={false}
                                                                        beforeUpload={file => false}
                                                                        accept='.xlsx'
                                                                        fileList={this.state.fileListExport}
                                                                        maxCount={1}
                                                                        style={{ display: 'flex', borderRadius: '8px', marginTop: '20px' }}
                                                                        onChange={this.onImport}
                                                                    >
                                                                        <Image
                                                                            src={fileUploadIcon}
                                                                            preview={false}
                                                                            width={20}
                                                                            onClick={this.handleSubmitNewItem}
                                                                        ></Image>
                                                                        <span style={{ fontSize: '15px' }}>{trans('warehouse:importExport.importFromExcel')}</span>
                                                                    </Dragger>
                                                                </Col>
                                                                <Col
                                                                    xs={12}
                                                                    sm={12}
                                                                    md={12}
                                                                    lg={12}
                                                                    xl={12}
                                                                >
                                                                    <span style={{ fontSize: '14px' }}>
                                                                        <Image src={warningIcon} preview={false} width={18}></Image>  &nbsp;
                                                                        {trans('warehouse:importExport.noteUploadFile')}
                                                                        <Button type='link' style={{ fontSize: '14px', fontStyle: 'italic', marginLeft: '-12px' }}
                                                                            onClick={(e) => this.onDownloadTemplate()}
                                                                        > {trans('warehouse:importExport.here')}</Button>
                                                                    </span>
                                                                </Col>
                                                            </div>

                                                            <Col xs={12} sm={12} md={12} lg={12} xl={12}
                                                                style={{ marginTop: '20px' }}
                                                            >
                                                                <span style={{ color: '#084DFF' }}>
                                                                    <Image src={previewIcon} preview={false} width={18}></Image>  &nbsp;
                                                                    {trans('common:button.preview')}
                                                                </span>
                                                                <div className="small-description decription-input">
                                                                    {trans('warehouse:importExport.noteBeforeSubmit')}
                                                                </div>
                                                            </Col>

                                                            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                                <Table
                                                                    columns={exportCols}
                                                                    dataSource={this.state.previewExport}
                                                                    pagination={false}
                                                                    size="middle"
                                                                    scroll={{
                                                                        y: 340,
                                                                    }}
                                                                />
                                                            </Col>
                                                        </Col>
                                                    </TabPane>
                                                </Tabs>
                                            </Col>

                                        </div>
                                    </Col>
                                </TabPane>
                            </Tabs>
                        </Form>
                    </Row>
                </div>

            </>
        );

    }

};

export default withTranslation(['warehouse', 'common'])(WarehouseAsset);
