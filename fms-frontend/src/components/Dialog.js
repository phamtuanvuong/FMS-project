import React from "react";
import {Modal} from "antd";
import {showConfirm, hideDialogConfirm} from "./MessageBox";
import {
    trans
} from './CommonFunction';
import { withTranslation } from 'react-i18next';

const _ = require('lodash');

function shallowObjectEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
  
    if (keys1.length !== keys2.length) {
      return true;
    }

    for (let key =0; key < keys1.length; key++) {
      if (object1[keys1[key]] != object2[keys2[key]]) {
        return true;
      }
    }
    return false;
  }

export var hideDialog = function (_showConfirm, dataNew) {
    if (_showConfirm && shallowObjectEqual(this.state.content.props.options.data, dataNew)) {
        showConfirm(trans('common:noty.closeModal'), () => {
                this.setState({visible: false});
                hideDialogConfirm();
            }, trans('common:noty.title'));
    } else {
        console.log('check hideDialogConfirm')
        this.setState({
            visible: false,
            content: ''
        });
    }
};

export var showDialog = function(_content, _title, _width = "70%", _onCancel = null, _confirmLoading = false) {
    this.setState({
        visible: true,
        title: _title,
        content: _content,
        confirmLoading: _confirmLoading,
        width: _width,
        onCancel: _onCancel,
        // onOk: _onOk
    });
};

class Dialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            // className: 'modal-primary'
        };

        this.onCancel = this.onCancel.bind(this);
    }

    componentDidMount() {
        showDialog = showDialog.bind(this);

        hideDialog = hideDialog.bind(this);
        // console.log('componentDidMount dialog')
    }
    
    onCancel = () => {
        if (this.state.onCancel)
            this.state.onCancel();
        else hideDialog(false);
    }

    render() {
        return (
            <div>
                <Modal
                    title={this.state.title}
                    visible={this.state.visible}
                    // onOk={this.state.onOk}
                    footer={null}
                    confirmLoading={this.state.confirmLoading}
                    onCancel={this.onCancel}
                    width={this.state.width}
                    // maskClosable={false}
                >
                    {this.state.content}
                </Modal>
            </div>
        );
    }
}

export default withTranslation(['common'])(Dialog);

