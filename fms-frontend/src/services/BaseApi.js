import { Component } from "react";
import axios from 'axios';
import { showProgress, hideProgress } from '../components/ProgressCustom';

export class BaseApi extends Component {

    execute_get = async url => {
        showProgress();

        return axios.get(url).then((res) => {
            // console.log('request');
            hideProgress();
            return res;
        }).catch((err) => {
            hideProgress();
            console.error(err);
        });

    }

    execute_post = async (url, item) => {
        showProgress();

        return axios.post(url, item).then((res) => {
            // console.log('request');
            hideProgress();
            return res;
        }).catch((err) => {
            hideProgress();
            console.error(err);
        });
    }

    execute_delete = async (url, item) => {
        // debugger
        showProgress();

        return axios.delete(url, item).then((res) => {
            // console.log('request');
            hideProgress();
            return res;
        }).catch((err) => {
            hideProgress();
            console.error(err);
        });
    }

    uploadFile = async (url, file) => {
        showProgress();
        var data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "fmsupload")
        return await axios.post(url, data).then((res) => {
            // console.log('request');
            hideProgress();
            return res;
        }).catch((err) => {
            hideProgress();
            console.error(err);
        });
    }

    export = async (url, item) => {
        return await axios.request({ url, method: "POST", responseType: 'blob', data: item });
    }

    importFile = async (url, file) => {
        var data = new FormData();
        data.append("file", file);
        return await axios.post(url, data);
    }
}