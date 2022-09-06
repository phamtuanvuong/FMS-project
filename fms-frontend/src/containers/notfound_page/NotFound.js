import { Result } from 'antd';
import React, { Component } from 'react';
import {
    trans
} from '../../components/CommonFunction';
import { withTranslation } from 'react-i18next';

class Notfound extends Component {
    render() {
        return (
            <>
                <div className="container">
                    <div style={{ marginBottom: '10px' }}>
                        <Result
                            status={404}
                            title={trans('common:error.notFoundTitle')}
                            subTitle={this.props?.description ? this.props.description : trans('common:error.notFoundescription')}
                        />
                    </div>
                </div>
            </>
        );
    }

};

export default withTranslation(['common'])(Notfound);
