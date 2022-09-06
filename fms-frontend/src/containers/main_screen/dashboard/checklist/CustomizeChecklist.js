import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'antd/dist/antd.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/CreateTrouble.css';
import { Form, Collapse, Image, Checkbox, Input, Button } from 'antd';
import HeaderPannel from '../../../../components/HeaderPannel';
import {
    onChangeValue,
    focusInvalidInput,
    validateEmpty,
    isUndefindOrEmptyForItemForm,
    stringNullOrEmpty,
    handleHideNav,
    trans
} from '../../../../components/CommonFunction';
import { STATUS, MESSAGE, ACTION } from '../../../../constants/Constants';
import SelectCustom from '../../../../components/SelectCustom';
import doneIcon from '../../../../assets/checked.png';
import plusIcon from '../../../../assets/plus.png';
import eyeIcon from '../../../../assets/eye.png';
import '../../../../layout/CustomizeChecklist.css';
import { showDialog, hideDialog } from '../../../../components/Dialog';
import ChecklistImportPopup from './ChecklistImportPopup';
import PreviewChecklistPopup from './PreviewChecklistPopup';
import { ChecklistService } from '../../../../services/main_screen/checklist/ChecklistService';
import { Notification } from '../../../../components/Notification';
import removeIcon from '../../../../assets/multiply.png';
import createIcon from '../../../../assets/create.png';
import editIcon from '../../../../assets/edit.png';
import { hideDialogConfirm, showConfirm } from '../../../../components/MessageBox';
import CreateTemplatePopup from './CreateTemplatePopup';
import { withTranslation } from 'react-i18next';

const { Panel } = Collapse;

const effectArea = [
    {
        name: 'Inside', sub: 'Các phòng trong tòa nhà'
    },
    {
        name: 'WC', sub: 'Khu vực vệ sinh'
    },
    {
        name: 'Lobby', sub: 'Khu vực cầu thang, hành lang'
    }
]
class CustomizeChecklist extends Component {

    constructor(props) {
        super(props);
        this.state = {
            previewVisible: false,
            previewImage: '',
            previewTitle: '',
            requester: '',
            data: {
                componentId: null,
                componentName: null
            },
            components: [],
            temps: [],
            errorsChecklist: {},
            errors: {},
            tempData: {},
            configuration: {
                effectArea: null,
                tempId: null
            },
            cValue: JSON.parse(localStorage.getItem('cont'))
        }
        this.service = new ChecklistService();
        this.Notification = new Notification();
    }

    componentDidMount() {
        this.loadForm();
        document.querySelector('.container').addEventListener('click', handleHideNav);

    }

    loadForm = async () => {
        await this.loadAllComponents();
        await this.loadAllTemplate();
        await this.loadData();
    }

    loadAllComponents = async () => {
        // let user = { ...this.state.cValue.userInfo };
        await this.service.getAllComponents().then(res => {
            if (res?.status === 200 && res.data?.listData) {
                this.setState({ components: res?.data?.listData });
            } else {
                this.Notification.error(MESSAGE.ERROR);
            }
        })
    }

    loadAllTemplate = async () => {
        // let user = { ...this.state.cValue.userInfo };
        await this.service.getAllTemp('').then(res => {
            this.setState({ temps: res?.data?.listData });
        })
    }

    loadData = async () => {
        let data = { ...this.state.data };
        if (data.componentId) {
            await this.service.getCustomizeDetail(data.componentId).then(res => {
                let updateData = { ...this.state.data };
                let tempData = res?.data?.data;
                console.log(tempData)
                updateData.componentId = tempData?.component?.id;
                updateData.comName = tempData?.component?.name;
                let config = {
                    tempId: tempData?.component?.templateID === 0 ? null : tempData?.component?.templateID,
                    effectArea: tempData?.component?.effectArea
                }

                let temps = [...this.state.temps]
                let isRequireArea = false;
                for (let i = 0; i < temps.length; i++) {
                    if (temps[i].id == config.tempId && temps[i].typeID === 1) {
                        isRequireArea = true;
                    }
                }
                this.setState({
                    tempData: tempData,
                    data: updateData,
                    errors: {},
                    configuration: config,
                    errorsChecklist: {},
                    isRequireArea
                });
            });
        }
        else {
            this.setState({
                tempData: {},
                data: {
                    componentId: null,
                    componentName: null
                },
                errors: {},
                errorsChecklist: {}
            });
        }
    }


    handleClickSubmit = (e) => {
        e.preventDefault();
        let data = { ...this.state.data };
        if (data.componentId) {
            this._openDeletePopConfirm(data.componentId);
        }
        else {
            this.Notification.error("Hãy chọn một danh sách để xoá/ Please choose a component to delete.")
        }
        // xử lý sau validate
    }

    _openDeletePopConfirm = (data) => {
        showConfirm
            (
                trans('checklist:customizeChecklist.notiDelete'),
                () => this.onDelete(data),
                trans('common:notify')
            );
    }

    onDelete = async (tempID) => {
        // data.createdBy = 'admin';
        await this.service.deleteComponent(tempID).then(res => {
            if (res?.status === 200) {
                hideDialogConfirm();
                this.Notification.success(MESSAGE.DELETE_SUCCESS);
                this.setState({ data: { componentId: null, componentName: null } });
                setTimeout(() => {
                    this.loadAllComponents();
                    this.loadForm();
                }, 200);

            }
            else {
                hideDialogConfirm();
                this.Notification.error(MESSAGE.ERROR);
            }
        })
    }

    handleClickPreview = () => {
        const checklistsContent = { ...this.state.tempData };
        console.log(checklistsContent);
        if (checklistsContent.items) {
            showDialog(
                this.getPreviewForm(checklistsContent.items),
                <span>{trans('checklist:customizeChecklist.preview')} {this.state.data?.comName}</span>
            )
        } else {
            this.Notification.error("Chưa có dữ liệu để xem trước/ Don't have any data to preview.");
            return;
        }

    }

    getPreviewForm = (data) => {
        return (
            <PreviewChecklistPopup
                options={{
                    data: [...data],
                    dataNew: data,
                    onCancel: (rowData) => {
                        // console.log('ádasdas')
                        hideDialog(false, rowData);
                    }
                }}
            />

        )
    }

    handleClickImport = () => {
        let data = { ...this.state.data };
        if (data.componentName || data.componentId) {
            showDialog(
                this.getImportForm(data),
                trans('checklist:customizeChecklist.importTitle')
            )
        }
        else {
            this.Notification.error('Hãy chọn một danh sách hoặc nhập tên danh sách kiểm tra/ Please choose a component or input name component.',
                trans('checklist:customizeChecklist.errorOpenImport')
            )
        }
    }

    getImportForm = (data) => {
        // console.log(campus);
        return (
            <ChecklistImportPopup
                options={{
                    data: { ...data },
                    dataNew: data,

                    onComplete: async (rowData) => {
                        const res = await this.service.saveImport(rowData);

                        if (res.data.status === STATUS.SUCCESS) {
                            hideDialog();
                            let update = res.data?.data;

                            let data = { ...this.state.data };
                            data.componentId = update.componentId;
                            await this.setState({
                                data: data
                            });
                            this.loadForm();
                            this.Notification.success(MESSAGE.UPDATE_SUCCESS);


                        } else {
                            this.Notification.error(MESSAGE.ERROR);
                        }
                    },
                    onCancel: (rowData) => {
                        // console.log('ádasdas')
                        hideDialog(false, rowData);
                    }
                }}
            />
        )
    }

    validateCreateNewItem() {
        var data = { ...this.state.data };

        const [isValid, errors] = validateEmpty(data, ['createName', 'createRequirement']);
        // console.log(errors, isValid, 'check errorsss');
        if (!isValid) {
            focusInvalidInput(errors);
        }

        this.setState({
            errors
        });
        return isValid;
    }

    handleSubmitNewItem = async (e) => {
        let data = { ...this.state.data };
        let checklistsContent = [];
        e.preventDefault();
        if (data.componentId == null && data.componentName == null) {
            this.Notification.
                error('Hãy chọn một thành phần kiểm tra hoặc nhập tên/ Please choose a component or input component name.',
                    trans('checklist:customizeChecklist.errorOpenCreate')
                );
            return;
        }
        if (!this.validateCreateNewItem()) {
            return;
        }

        checklistsContent.push({
            name: data.createName,
            requirements: data.createRequirement,
            isDefault: data.isDefault
        });
        let createData = {
            listItem: checklistsContent,
            componentName: data?.componentName,
            componentId: data?.componentId
        }

        const res = await this.service.createItem(createData);
        if (res.data.status === STATUS.SUCCESS) {
            hideDialog();
            let update = res.data?.data;
            let data = { ...this.state.data };
            data.componentId = update.componentId;
            data.componentName = null;
            await this.setState({
                data: data
            });
            this.loadForm();
            this.Notification.success(MESSAGE.UPDATE_SUCCESS);
        } else {
            this.Notification.error(MESSAGE.ERROR);
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

    onChangeValueCustomForChecklist = (name, index, value) => {
        let tempData = { ...this.state.tempData };
        let checklistsContent = tempData.items;
        let errorsChecklist = { ...this.state.errorsChecklist };
        // console.log(checklistsContent)
        checklistsContent[index][name] = value;
        errorsChecklist[name + index] = '';
        tempData.items = checklistsContent;
        this.setState({
            tempData: tempData,
            errorsChecklist
        });
    }

    handleSubmitChecklistItem = async (index) => {
        if (!this.validateChangeChecklist(index)) {
            return;
        }
        let items = [...this.state.tempData?.items];
        await this.service.updateItem(items?.[index]).then(res => {
            if (res && res.status === 200) {
                this.Notification.success(res.data?.message);
            }
            else {
                this.Notification.error(MESSAGE.ERROR)
            }
        });
        await this.loadForm();
    }

    handleDeleteChecklistItem = async (index) => {
        showConfirm
            (
                trans('common:notiTitleDelete'),
                () => this.onDeleteItem(index),
                trans('common:notify')
            );

    }

    onDeleteItem = async (index) => {
        let items = [...this.state.tempData?.items];
        await this.service.deleteItem(items?.[index].id).then(res => {
            if (res && res.status === 200) {
                hideDialogConfirm();
                this.Notification.success(res.data?.message);
            }
            else {
                this.Notification.error(MESSAGE.ERROR)
            }
        });
        this.loadForm();
    }

    validateChangeChecklist(index) {
        let tempData = { ...this.state.tempData };
        let checklistsContent = tempData.items;
        const errorsChecklist = { ...this.state.errorsChecklist };
        const [isValid, errors] = this.validateEmptyCustom(checklistsContent, index);
        // console.log(errors, isValid, 'check errorsss');
        if (!isValid) {
            focusInvalidInput(errors);
        }

        this.setState({
            errorsChecklist: {
                ...errorsChecklist,
                ...errors
            }
        });
        return isValid;
    }

    validateEmptyCustom = (data, index) => {
        let isValid = true, errors = {};
        if (stringNullOrEmpty(data[index].name) || String(data[index].name).trim() === "") {
            isValid = false;
            errors['name' + index] = trans('common:error.empty');
        }
        if (stringNullOrEmpty(data[index].requirements) || String(data[index].requirements).trim() === "") {
            isValid = false;
            errors['requirements' + index] = trans('common:error.empty');
        }

        return [isValid, errors];
    }

    onSubmitConfiguration = async () => {
        if (this.state.isRequireArea && !this.state.configuration.effectArea) {
            this.setState({
                errorsArea: trans('common:error.empty')
            });
            return;
        }

        await this.service.updateConfiguration({
            id: this.state.data.componentId,
            templateID: this.state.configuration.tempId,
            effectArea: this.state.configuration.effectArea
        }).then(res => {
            if (res && res.status === 200) {
                this.Notification.success(MESSAGE.UPDATE_SUCCESS);
                setTimeout(() => {
                    this.loadForm();
                }, 200);
            }
            else {
                this.Notification.error(MESSAGE.ERROR)
            }
        })

    }

    getTemplateForm = (data, action) => {
        return (
            <CreateTemplatePopup
                options={{
                    data: { ...data },
                    dataNew: data,
                    action: action,
                    onComplete: async (rowData) => {
                        const res = await this.service.saveTemplate(rowData);
                        if (res.data.status === STATUS.SUCCESS) {
                            hideDialog();
                            let update = res.data?.data;
                            let data = { ...this.state.configuration };
                            data.tempId = update.id;
                            await this.setState({
                                configuration: data
                            });
                            // setTimeout(() => {
                            this.loadForm();
                            this.Notification.success(MESSAGE.UPDATE_SUCCESS);
                            // }, 200);

                        } else {
                            this.Notification.error(MESSAGE.ERROR);
                        }
                    },
                    onCancel: (rowData) => {
                        hideDialog(false, rowData);
                    }
                }}
            />

        )
    }

    handleTemplate = (action, title) => {
        if (action === ACTION.DELETE) {
            showConfirm
                (
                    trans('common:notiTitleDelete'),
                    () => this.onDeleteTemplate(this.state.configuration),
                    trans('common:notify')
                )
        }
        else {
            showDialog(
                this.getTemplateForm(this.state.configuration, action),
                title
            );
        }
    }

    onDeleteTemplate = async (data) => {
        await this.service.deleteTemplate(data.tempId).then(res => {
            if (res && res.status === 200) {
                hideDialogConfirm();
                let configuration = { ...this.state.configuration };
                configuration.tempId = null;
                this.setState({ configuration: configuration });
                this.Notification.success(MESSAGE.DELETE_SUCCESS);
                this.loadAllTemplate();

            }
            else {
                this.Notification.error(MESSAGE.ERROR);
            }
        });
    }

    render() {
        // let userInfo = this.context.userInfo ? this.context.userInfo : this.state.cValue.userInfo;
        let context = this;
        let renderChecklistsContent =
            this.state.tempData.items ?
                this.state.tempData.items.map(function (item, index) {
                    return (
                        <>
                            <Col xs={12} sm={10} md={10} lg={10} xl={11}>
                                <Row>
                                    <Col xs={12} sm={12} md={10} lg={10} xl={4}>
                                        <div className="edit-item-name">
                                            <Form.Item
                                                label={(index < 9 ? ('0' + (index + 1)) : (index + 1)) + '.'}
                                                help={context.state.errorsChecklist['name' + index]}
                                                validateStatus={isUndefindOrEmptyForItemForm(context.state.errorsChecklist['name' + index])}
                                            >
                                                <Input
                                                    id={'name' + index}
                                                    placeholder=''
                                                    value={item.name}
                                                    onChange={e => context.onChangeValueCustomForChecklist('name', index, e.target.value)}
                                                />
                                            </Form.Item>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={10} lg={10} xl={6}>
                                        <div className="edit-item-requirement">
                                            <Form.Item
                                                label={trans('checklist:customizeChecklist.requirements')}
                                                help={context.state.errorsChecklist['requirements' + index]}
                                                validateStatus={isUndefindOrEmptyForItemForm(context.state.errorsChecklist['requirements' + index])}
                                            >
                                                <Input
                                                    id={'requirements' + index}
                                                    placeholder=''
                                                    value={item.requirements}
                                                    onChange={e => context.onChangeValueCustomForChecklist('requirements', index, e.target.value)}
                                                />
                                            </Form.Item>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={2} lg={2} xl={1} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <div className="edit-default">
                                            {trans('checklist:customizeChecklist.default')}
                                            <Checkbox
                                                checked={item.defaultValue}
                                                onChange={e => context.onChangeValueCustomForChecklist('defaultValue', index, e.target.checked)}
                                                style={{ marginLeft: "15px" }}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={12} sm={2} md={2} lg={2} xl={1}>
                                <div style={{ display: "flex", justifyContent: "space-around" }}>
                                    <Image
                                        style={{ cursor: 'pointer' }}
                                        src={doneIcon}
                                        preview={false}
                                        width={35}
                                        onClick={(e) => context.handleSubmitChecklistItem(index)}
                                    ></Image>
                                    <Image
                                        style={{ cursor: 'pointer' }}
                                        src={removeIcon}
                                        preview={false}
                                        width={35}
                                        onClick={(e) => context.handleDeleteChecklistItem(index)}
                                    ></Image>
                                </div>
                            </Col>
                        </>
                    );
                }) : null;

        return (

            <>
                <div className="container">
                    <Row>
                        <Col
                            style={{ marginBottom: "10px" }}
                        >
                            <HeaderPannel
                                classNameCustom="create-trouble"
                                title={trans('checklist:customizeChecklist.title')}
                                breadcrumbList={[trans('checklist:customizeChecklist.checklist'), trans('checklist:customizeChecklist.title')]}
                                buttons={[
                                    {
                                        title: trans('common:button.import'),
                                        classNameCustom: 'other',
                                        action: () => this.handleClickImport
                                    },
                                    {
                                        title: trans('common:button.preview'),
                                        classNameCustom: 'other',
                                        action: () => this.handleClickPreview
                                    },
                                    {
                                        title: trans('common:button.delete'),
                                        classNameCustom: 'submit',
                                        action: () => this.handleClickSubmit
                                    }
                                ]}
                            />
                        </Col>
                        <Form layout="vertical" colon={false}>
                            <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                <div className="infor-user-create padding-pannel">
                                    <Row style={{ marginTop: '10px' }}>
                                        <Col xs={12} sm={12} md={12} lg={4} xl={6}>
                                            <Form.Item
                                                label={trans('checklist:customizeChecklist.checklistComponent')}
                                                required={true}
                                                help={this.state.errors.componentId}
                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.componentId)}
                                            >
                                                <SelectCustom
                                                    id="name"
                                                    onChange={async (e, value) => {
                                                        let data = { ...this.state.data };
                                                        data.componentId = value?.value;
                                                        data.componentName = null;
                                                        await this.setState({ data: data });
                                                        this.loadData();

                                                    }}
                                                    // defaultValue="Student1212"
                                                    placeholder={trans('checklist:customizeChecklist.checklistComponentPlacholder')}
                                                    value={this.state.data.componentId}
                                                    options={this.state.components}
                                                    lable='name'
                                                    keyValue='id'
                                                    clear={true}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12} sm={12} md={12} lg={8} xl={6}>
                                            <Form.Item
                                                label={<i>{trans('checklist:customizeChecklist.createNewChecklist')}</i>}
                                                help={this.state.errors.componentName}
                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.componentName)}
                                            >
                                                <Input
                                                    id="createChecklist"
                                                    placeholder={'Tạo mới một danh sách kiểm tra...'}
                                                    value={this.state.data.componentName}
                                                    onChange={e => {
                                                        let data = { ...this.state.data };
                                                        data.componentName = e.target.value;
                                                        data.componentId = null;
                                                        this.setState({ data: data, tempData: {} });
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>
                                        {/* <Col span={1}></Col> */}
                                    </Row>
                                </div>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginBottom: "10px" }}>
                                <div className="room-inside-container">
                                    <Collapse
                                        defaultActiveKey={["1", "2", "3"]}
                                        onChange={this.onChangeCollapse}
                                        expandIconPosition="end"
                                    >
                                        <Panel key="1" header={<b>{trans('checklist:customizeChecklist.checklistContent')}</b>}>
                                            <Row>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <Row style={this.state.tempData.items && this.state.tempData.items.length > 0 ? { minHeight: "100px", overflow: "auto", maxHeight: "400px"} : null}>
                                                        {renderChecklistsContent}
                                                    </Row>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                                    <div className="create-checklist">
                                                        <Row>
                                                            <Col xs={12} sm={12} md={{ size: 12, order: 1 }} lg={12} xl={12}>
                                                                <div className="create-checklist-title">
                                                                    <Image src={createIcon} preview={false} width={30} /><b>{trans('checklist:customizeChecklist.createNewItem')}</b>
                                                                </div>
                                                            </Col>
                                                            <Col xs={12} sm={12} md={{ size: 8, order: 2 }} lg={8} xl={4}>
                                                                <Form.Item
                                                                    label={trans('checklist:customizeChecklist.itemName')}
                                                                    help={this.state.errors.createName}
                                                                    required
                                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.createName)}
                                                                >
                                                                    <Input
                                                                        id="createName"
                                                                        placeholder='Nhập tên điều kiện kiểm tra'
                                                                        value={this.state.data?.createName}
                                                                        onChange={e => onChangeValue(this, 'createName', e.target.value)}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col xs={12} sm={12} md={{ size: 8, order: 4 }} lg={8} xl={6}>
                                                                <Form.Item
                                                                    required
                                                                    label={trans('checklist:customizeChecklist.requirements')}
                                                                    help={this.state.errors.createRequirement}
                                                                    validateStatus={isUndefindOrEmptyForItemForm(this.state.errors.createRequirement)}
                                                                >
                                                                    <Input
                                                                        id="createRequirement"
                                                                        placeholder='Điều kiện 1; điều kiện 2;...; điều kiện n'
                                                                        value={this.state.data?.createRequirement}
                                                                        onChange={e => onChangeValue(this, 'createRequirement', e.target.value)}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col xs={12} sm={12} md={{ size: 2, order: 5 }} lg={2} xl={1} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                <div className="edit-default">
                                                                    {trans('checklist:customizeChecklist.default')}
                                                                    <Checkbox
                                                                        checked={this.state.data.isDefault}
                                                                        onChange={e => onChangeValue(this, 'isDefault', e.target.checked)}
                                                                        style={{ marginLeft: "15px" }}
                                                                    />
                                                                </div>
                                                            </Col>
                                                            <Col xs={12} sm={12} md={{ size: 2, order: 3, offset: 2 }} lg={2} xl={{ size: 1, order: 5, offset: 0 }}>
                                                                <div style={{ display: "flex", justifyContent: "space-around" }}>
                                                                    <Image
                                                                        style={{ cursor: 'pointer' }}
                                                                        src={doneIcon}
                                                                        preview={false}
                                                                        width={35}
                                                                        onClick={this.handleSubmitNewItem}
                                                                    ></Image>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Panel>
                                    </Collapse>
                                </div>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={12} xl={12}>
                                {
                                    this.state.data.componentId && this.state.data.componentId > 0 ?
                                        <div className="room-inside-container">
                                            <Collapse
                                                defaultActiveKey={["1"]}
                                                expandIconPosition="end"
                                            >
                                                <Panel key="1" header={<b>{trans('checklist:customizeChecklist.checklistConfiguration')}</b>}>
                                                    <Row>
                                                        <Col xs={12} sm={12} md={12} lg={5} xl={6}>
                                                            <Form.Item
                                                                style={{ display: 'flex', }}
                                                                label={
                                                                    <div>
                                                                        {trans('checklist:customizeChecklist.checklistTemplate')}
                                                                        {!this.state.configuration.tempId || this.state.configuration.tempId === 0 ?
                                                                            <Button
                                                                                type='link'
                                                                                title='Create New Template'
                                                                                onClick={(e) => this.handleTemplate(ACTION.CREATE, trans('checklist:customizeChecklist.titleFormCreateTemplate'))}
                                                                            >
                                                                                <Image src={plusIcon} width={20} preview={false} />
                                                                            </Button>
                                                                            :
                                                                            <>
                                                                                <Button
                                                                                    type='link'
                                                                                    title='View Template'
                                                                                    onClick={(e) => this.handleTemplate(ACTION.VIEW, trans('checklist:customizeChecklist.titleFormViewTemplate'))}
                                                                                    hidden={true}
                                                                                >
                                                                                    <Image src={eyeIcon} width={20} preview={false} />
                                                                                </Button>
                                                                                <Button
                                                                                    type='link'
                                                                                    title='Edit Template'
                                                                                    onClick={(e) => this.handleTemplate(ACTION.UPDATE, trans('checklist:customizeChecklist.titleFormUpdateTemplate'))}
                                                                                >
                                                                                    <Image src={editIcon} width={20} preview={false} />
                                                                                </Button>
                                                                                <Button
                                                                                    type='link'
                                                                                    title='Delete Template'
                                                                                    onClick={(e) => this.handleTemplate(ACTION.DELETE)}
                                                                                >
                                                                                    <Image src={removeIcon} width={20} preview={false} />
                                                                                </Button>
                                                                            </>
                                                                        }
                                                                    </div>
                                                                }
                                                            >
                                                                <SelectCustom
                                                                    id="name"
                                                                    onChange={(e, value) => {
                                                                        let data = { ...this.state.configuration };
                                                                        let temps = [...this.state.temps]
                                                                        let isRequireArea = false;
                                                                        data.tempId = e;
                                                                        for (let i = 0; i < temps.length; i++) {
                                                                            console.log(temps[i]);
                                                                            if (temps[i].id == e && temps[i].typeID === 1) {
                                                                                isRequireArea = true;
                                                                            }
                                                                        }

                                                                        this.setState({ configuration: data, isRequireArea, errorsArea: '' });
                                                                    }}
                                                                    // defaultValue="Student1212"
                                                                    placeholder={trans('checklist:customizeChecklist.checklistTemplatePlaceholder')}
                                                                    value={this.state.configuration.tempId}
                                                                    options={this.state.temps}
                                                                    lable='name'
                                                                    keyValue='id'
                                                                    clear={true}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={12} sm={12} md={12} lg={12} xl={6}>
                                                            <Form.Item
                                                                required={this.state.isRequireArea}
                                                                style={{ display: 'flex' }}
                                                                label={
                                                                    <div style={{ height: '32px' }}>
                                                                        {trans('checklist:customizeChecklist.effectArea')}
                                                                    </div>
                                                                }
                                                                help={this.state.errorsArea}
                                                                validateStatus={isUndefindOrEmptyForItemForm(this.state.errorsArea)}
                                                            >
                                                                <SelectCustom
                                                                    id="name"
                                                                    onChange={(e, value) => {
                                                                        let data = { ...this.state.configuration };
                                                                        data.effectArea = value?.value;
                                                                        this.setState({
                                                                            configuration: data,
                                                                            errorsArea: ''
                                                                        });
                                                                    }}
                                                                    // defaultValue="Student1212"
                                                                    placeholder={trans('checklist:customizeChecklist.effectAreaPlaceholder')}
                                                                    value={this.state.configuration.effectArea}
                                                                    options={effectArea}
                                                                    lable='name'
                                                                    keyValue='name'
                                                                    subValue='sub'
                                                                    clear={true}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                    <Row>

                                                        <Col xs={12} sm={12} md={12} lg={12} xl={12}
                                                            style={{ display: 'flex', justifyContent: 'flex-end' }}
                                                        >
                                                            <Form.Item
                                                                id='saveConfig'
                                                            >
                                                                {
                                                                    this.state.data.componentId ?
                                                                        <>
                                                                            <div className="button button-submit" onClick={this.onSubmitConfiguration}
                                                                                style={{ marginRight: '10px' }}
                                                                            >
                                                                                {trans('common:button.save')}
                                                                            </div>
                                                                        </>
                                                                        : null
                                                                }

                                                            </Form.Item>
                                                        </Col>

                                                    </Row>
                                                </Panel>
                                            </Collapse>
                                        </div>
                                        : null}
                            </Col>
                        </Form>
                    </Row>
                </div>

            </>
        );

    }

};

export default withTranslation(['checklist', 'common'])(CustomizeChecklist);
