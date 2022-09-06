import React, { Component } from 'react';
import { Col, Row } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../../layout/Common.css';
import {
    Radio, Form, Image, Upload, Button, Input, message
} from 'antd';
import 'antd/dist/antd.min.css';
import {
    trans
} from '../../../../components/CommonFunction';
import '../../../../layout/Configuration.css';
import { Notification } from "../../../../components/Notification";
import fileUploadIcon from '../../../../assets/xls-upload.png';
import previewIcon from '../../../../assets/preview-icon.png';
import { ChecklistService } from '../../../../services/main_screen/checklist/ChecklistService';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import removeIcon from '../../../../assets/multiply.png';
import { withTranslation } from 'react-i18next';

const { Dragger } = Upload;
const { TextArea } = Input;

class ChecklistDetailPopup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            fileList: [],
            typeUpdate: 1
        };
        this.Notification = new Notification();
        this.service = new ChecklistService();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.options !== this.props.options) {

            this.setState({
                data: [],
                typeUpdate: 1,
                fileList: []
            });
        }
    }

    componentDidMount() {
        this.setState({
            data: [],
            typeUpdate: 1,
            fileList: []
        })
    }

    onCancel = () => {
        console.log(this.state.data)
        this.props.options.onCancel(this.state.data);
    }

    onSubmit = () => {
        if (!this.validate()) {
            return;
        }

        let data = [...this.state.data];

        data.forEach(elm => {
            elm.name = elm.name.trim();
            elm.requirements = elm.requirements.trim();
        });
        console.log(data);

        // return;
        let dataSubmit = {
            listItem: data,
            componentName: this.props?.options?.data?.componentName,
            componentId: this.props?.options?.data?.componentId,
            typeUpdate: this.state.typeUpdate
        }
        this.props.options.onComplete(dataSubmit);
    }

    validate = () => {
        let data = [...this.state.data];
        let isValid = true;
        data.forEach(elm => {
            if (elm.name.length < 1 || elm.requirements.length < 1) {
                isValid = false;
            }
        });

        if (!this.state.isValidFile) {
            isValid = false;
        }

        return isValid;
    }

    onDownloadTemplate = async () => {
        var filename = 'ChecklistTemplate.xlsx';
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

    onImport = async (file) => {
        console.log(file);

        if (file.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            this.setState({
                fileList: [file.file]
            });
            var item = file.fileList[0].originFileObj;
            await this.service.importExcel(item).then(res => {
                if (res && res.status === 200) {
                    this.setState({ data: res?.data?.listData });
                } else {
                    this.setState({
                        fileList: []
                    });
                    this.Notification.error("Có lỗi xảy ra hoặc nội dung sai với file mẫu.");
                }
            });
        } else {
            this.setState({ data: [], fileList: [file.file] });
        }
    }

    onItemChangeValue = (index, name, value) => {
        let updateData = [...this.state.data];
        updateData[index][name] = value;
        this.setState({
            data: updateData
        });
    }

    onRemoveItem = (index) => {
        let data = [...this.state.data];
        data.splice(index, 1);
        this.setState({ data: data });
    }

    render() {
        let context = this;
        return (
            <>
                <Form layout="vertical">
                    <Row>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >
                            <Dragger
                                // {...props}
                                name="file"
                                multiple={false}
                                beforeUpload={(file) => {
                                    const isPNG = file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                                    console.log(isPNG)
                                    let isValidFile = true;
                                    if (isPNG) {
                                        // message.error(`${file.name} is not a xlsx file`);
                                        this.Notification.error(`${file.name} không phải file có định dạng .xlsx`);
                                        isValidFile = false;
                                    }
                                    this.setState({
                                        isValidFile
                                    })
                                    return isPNG;
                                }}
                                accept='.xlsx'
                                maxCount={1}
                                style={{ display: 'flex' }}
                                onChange={this.onImport}
                                fileList={this.state.fileList}
                            >
                                <Image
                                    src={fileUploadIcon}
                                    preview={false}
                                    width={20}
                                    onClick={this.handleSubmitNewItem}
                                ></Image>
                                <span style={{ fontSize: '15px' }}>{trans('checklist:checklistImport.titleImport')}</span>
                            </Dragger>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            style={{ fontSize: '16px', fontStyle: 'italic' }}
                        >
                            {trans('checklist:checklistImport.noteImport')}
                            <Button type='link' style={{ fontSize: '16px', fontStyle: 'italic', marginLeft: '-12px' }}
                                onClick={(e) => this.onDownloadTemplate()}
                            > {trans('checklist:checklistImport.here')}</Button>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >
                            <div className="preview-label" style={{ cursor: 'pointer' }}>
                                <Image
                                    src={previewIcon}
                                    preview={false}
                                    width={25}
                                    onClick={this.handleSubmitNewItem}
                                ></Image>
                                <span style={{ fontSize: '15px', color: '#1547FA' }}> {trans('common:button.preview')}</span>
                            </div>
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            style={this.state.data.length !== 0 ? { height: '300px', overflow: 'auto' } : null}
                        >
                            {/* <Form.Item></Form.Item> */}
                            {
                                this.state.data ?
                                    this.state.data.map(function (item, index) {
                                        return (
                                            <Row key={index}>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={4}>
                                                    <Form.Item
                                                        label={<b>{(index < 9 ? ('0' + (index + 1)) : (index + 1)) + '. '}</b>}
                                                        help={item.name.length < 1 ? trans('common:error.empty') : ''}
                                                        validateStatus={item.name.length < 1 ? 'error' : ''}
                                                    >
                                                        <TextArea
                                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                                            value={item.name}
                                                            onChange={e => context.onItemChangeValue(index, 'name', e.target.value)}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={6}>
                                                    <Form.Item
                                                        label={trans('checklist:checklistImport.requirements')}
                                                        help={item.requirements.length < 1 ? trans('common:error.empty') : ''}
                                                        validateStatus={item.requirements.length < 1 ? 'error' : ''}
                                                    >
                                                        <TextArea
                                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                                            value={item.requirements}
                                                            onChange={e => context.onItemChangeValue(index, 'requirements', e.target.value)}
                                                        />
                                                    </Form.Item>


                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={1}>
                                                    <Form.Item
                                                        label={trans('checklist:checklistImport.default')}
                                                    >
                                                        <Checkbox
                                                            checked={item.defaultValue}
                                                            style={{ marginLeft: '10px' }}
                                                            onChange={e => context.onItemChangeValue(index, 'defaultValue', e.target.checked)}
                                                        />
                                                    </Form.Item>

                                                </Col>
                                                <Col xs={12} sm={12} md={12} lg={12} xl={1}>
                                                    <Form.Item
                                                        label={trans('checklist:checklistImport.remove')}
                                                    >
                                                        <Button type='link'
                                                            onClick={e => context.onRemoveItem(index)}
                                                        >
                                                            <Image src={removeIcon} preview={false} width={20} />
                                                        </Button>
                                                    </Form.Item>

                                                </Col>
                                            </Row>
                                        )
                                    }) : null
                            }
                        </Col>
                        <Col
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            style={{ marginTop: '15px', marginBottom: '0px' }}
                        >

                            <div><b>{trans('checklist:checklistImport.option')}</b></div>
                            <Radio.Group onChange={e => {
                                let update = { ...this.state };
                                update.typeUpdate = e.target.value;
                                this.setState(update);
                            }}
                                defaultValue={this.state.typeUpdate}
                                value={this.state.typeUpdate}>
                                <Radio value={1}>{trans('checklist:checklistImport.overwriteChecklist')}</Radio>
                                <Radio value={2}>{trans('checklist:checklistImport.continueChecklist')}</Radio>
                            </Radio.Group>
                        </Col>

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
                                {trans('common:button.submit')}
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
                                {trans('common:button.cancel')}
                            </div>
                        </Col>
                    </Row>
                </Form>
            </>
        );
    }

};

export default withTranslation(['checklist', 'common'])(ChecklistDetailPopup);
