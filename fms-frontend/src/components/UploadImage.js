import React, { Component } from 'react';
import 'antd/dist/antd.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../layout/CreateTrouble.css';
import { Upload, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const acceptFile = [
    'image/*'
]


class UploadImage extends Component {

    constructor(props) {
        super(props);
    }
    state = {
        previewVisible: false,
        previewImage: ''
    }

    handleCancel = () => this.setState({ previewVisible: false });

    handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await this.getBase64(file.originFileObj);
        }

        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
            previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
        });
    };

    getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    handleChangeImage = ({ fileList }) => {
        // debugger;
        if (this.props.handleChangeImage) {
            if (this.props.fileName) {
                this.props.handleChangeImage(fileList, this.props.fileName);
            }
            else {
                this.props.handleChangeImage(fileList);
            }
        }
    };

    handleRemove = (file) => {
        // debugger;
        if (this.props.handleRemove) {
            if (this.props.fileName) {
                return this.props.handleRemove(file, this.props.fileName);
            }
            else {
                return this.props.handleRemove(file);
            }

        }
    }

    render() {

        let urls = [...this.props.fileList];
        var fileList = [];
        if (urls) {
            urls.forEach((item) => {
                if (item.path) {
                    fileList.push({
                        uid: item.id, status: 'done', url: item.path
                    });
                }
                else {
                    fileList.push(item);
                }
            });
        }

        const uploadButton = (
            <div>
                <PlusOutlined />
                <div
                    style={{
                        marginTop: 8,
                    }}
                >
                    Upload
                </div>
            </div>
        );

        return (
            <>
                <div className="issue-image-upload">
                    <Upload
                        accept={acceptFile.join(',')}
                        listType="picture-card"
                        multiple={true}
                        beforeUpload={file => false}
                        // onRemove={this.onRemove}
                        maxCount={this.props.maxCount ? this.props.maxCount : 8}
                        fileList={fileList}
                        onPreview={this.handlePreview}
                        onChange={this.handleChangeImage}
                        onRemove={this.handleRemove}
                        disabled={this.props.disabled? this.props.disabled : false}
                    >
                        {fileList.length >= 8 ? null : uploadButton}
                    </Upload>
                    <Modal visible={this.state.previewVisible} title={this.state.previewTitle} footer={null} onCancel={this.handleCancel}>
                        <img
                            alt="example"
                            style={{
                                width: '100%',
                                zIndex: '9999999999'
                            }}
                            src={this.state.previewImage}
                        />
                    </Modal>
                </div>

            </>
        );
    }

};

export default UploadImage;
