import React, { Component } from 'react';
import '../layout/RequireSample.css';
import { Select } from 'antd';
const { Option } = Select;

class SelectCustom extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const lable = this.props.lable;
        const keyValue = this.props.keyValue;
        const subValue = this.props.subValue;
        const renderOption = this.props.options ? this.props.options.map((item, index) => {
            return <Option key={index} value={item[keyValue] || item.id || item.userName}>{(item[lable] || item.name || item.userName)
                + (subValue ? ' (' + item[subValue] + ')' : '')}</Option>
        }) : ''
        return (
            <Select
                id={this.props.id}
                placeholder={this.props.placeholder}
                showSearch
                mode={this.props.mode ? this.props.mode : 'combobox'}
                onChange={this.props.onChange}
                defaultValue={this.props.defaultValue}
                style={this.props.style ? this.props.style: { width: '100%' }}
                value={this.props.value}
                filterOption={(input, option) =>
                    option.children ?
                        option.children?.toLowerCase().includes(input.toLowerCase())
                        :
                        option.value.toLowerCase().includes(input.toLowerCase())
                }
                optionFilterProp="children"
                tokenSeparators={[',']}
                onFocus={this.props.onFocus ? this.props.onFocus : ''}
                disabled={this.props.disabled ? this.props.disabled : false}
                allowClear={this.props.clear ? this.props.clear : false}
            >
                {renderOption}
            </Select>
        );
    }

};

export default SelectCustom;
