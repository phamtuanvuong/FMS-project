import {
    TROUBLE_SAVE_IMAGE, TROUBLE_CREATE, TROUBLE_GET_LIST, TROUBLE_EXPORT, TROUBLE_CHANGE_TECH, TROUBLE_GET_BY_ID,
    TROUBLE_DELETE_IMAGE, TROUBLE_CANCEL, TROUBLE_DELETE, TROUBLE_UPDATE, TROUBLE_COUNT, TROUBLE_GET_HISTORY, CAMPUS_GET_ALL
} from "../../../constants/AppPath";
import { BaseApi } from "../../BaseApi";
import { env } from '../../../constants/Constants';

export class MyTroubleService extends BaseApi { 
    saveImage = async (item) => {
        var url = TROUBLE_SAVE_IMAGE;
        try {
            let res = await this.uploadFile(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    create = async (item) =>{
        var url = env.path + TROUBLE_CREATE;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getList = async (item) => {
        var url = env.path + TROUBLE_GET_LIST;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    exportTrouble = async (item) =>{
        var url = env.path + TROUBLE_EXPORT;
        try {
            let res = await this.export(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    changeTechnician = async (item) => {
        var url = env.path + TROUBLE_CHANGE_TECH;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getById = async (reportId) => {
        var url = env.path + TROUBLE_GET_BY_ID + reportId;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    deleteImage = async (id) => {
        var url = env.path + TROUBLE_DELETE_IMAGE;
        try {
            let res = await this.execute_post(url, {id: id});
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    cancelReport = async (data) => {
        var url = env.path + TROUBLE_CANCEL + '?id=' + data;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    deleteReport = async (data) => {
        var url = env.path + TROUBLE_DELETE + data;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    update = async (item) =>{
        var url = env.path + TROUBLE_UPDATE;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    count = async (item) =>{
        var url = env.path + TROUBLE_COUNT;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getHistory = async (reportId) => {
        var url = env.path + TROUBLE_GET_HISTORY + reportId;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllCampus = () => {
        var url =  env.path + CAMPUS_GET_ALL;
        try{
            let res = this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

}