import axios from 'axios';
import { hideProgress, showProgress } from "../../components/ProgressCustom";

export const Utils = {
    get,
    post,
    _urlRender
};

async function get(path, data, hasDialogProcess = false) {
    let url = Utils._urlRender(path, data);
    // const requestOptions = { headers: authHeader() };
    // if (hasDialogProcess) {
    //     showProgress();
    // }
    return axios.get(url).then(res => {
        // if (hasDialogProcess) {
        //     hideProgress();
        // }
        return res;
    }).catch(error => {
        if (error && error.response && error.response.status && (error.response.status === 401 ||
            error.response.status === 403)) {
            alert(JSON.stringify(error.response));
            // AuthenticationService.logout();
        } else {
            // showErrorBox(<FTUTrans ns="common" name="error.common" />);
        }
        // if (hasDialogProcess) {
        //     hideProgress();
        // }
    });
};

async function post(path, data, hasDialogProcess = false, responseType) {
    let url = Utils._urlRender(path, null);
    const requestOptions = {
        headers: Object.assign(
            // authHeader(),
            { 'Content-Type': 'application/json' })

    };
    // if (hasDialogProcess) {
    //     showProgress();
    // }
    if (responseType) {
        requestOptions.responseType = responseType;
    }

    return axios.post(url, data, requestOptions).then(res => {
        // if (hasDialogProcess) {
        //     hideProgress();
        // }
        return res;
    }).catch(error => {
        if (error && error.response && error.response.status && (error.response.status === 401 ||
            error.response.status === 403)) {
            alert(JSON.stringify(error.response));
            // AuthenticationService.logout();
        } else {
            // showErrorBox(<FTUTrans ns="common" name="error.common" />);
        }
        // if (hasDialogProcess) {
        //     hideProgress();
        // }
    });
};

function _urlRender(path, data, renderDomain = true) {
    let url = renderDomain ?
        'http://localhost:3000' + (path.indexOf('/') === 0 ? path : ('/' + path))
        :
        (path.indexOf('/') === 0 ? path : ('/' + path));
    return url;
};

