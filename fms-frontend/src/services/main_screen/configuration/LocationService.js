import { env } from '../../../constants/Constants';
import { BaseApi } from "../../BaseApi";
import {
    LOCATION_GET_ALL,
    LOCATION_SAVE,
    LOCATION_GET_LIST,
    LOCATION_DELETE,
    LOCATION_CHANGE_ACTIVE,
    LOCATION_GET_BY_CAMPUS,
    LOCATION_GET_ALL_NO_CONDITION,
    LOCATION_GET_LIST_NO_CONDITION,
    LOCATION_GET_TEMPLATE,
    LOCATION_IMPORT_EXCEL,
    LOCATION_SAVE_IMPORT
} from "../../../constants/AppPath";

export  class LocationService extends BaseApi {
    getAll = async () => {
        var url =  env.path + LOCATION_GET_ALL;
        try{
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllNoCondition = async () => {
        var url =  env.path + LOCATION_GET_ALL_NO_CONDITION;
        try{
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    changeIsActive = async (data) => {
        var url = env.path + LOCATION_CHANGE_ACTIVE;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    save = async (item) =>{
        var url =  env.path + LOCATION_SAVE;
        try{
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getList = async (item) =>{
        var url =  env.path + LOCATION_GET_LIST;
        try{
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListNoCondition = async (item) =>{
        var url =  env.path + LOCATION_GET_LIST_NO_CONDITION;
        try{
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    delete = async (id) =>{
        var url =  env.path + LOCATION_DELETE + '?id=' +id;
        try{
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListByCampus =  async (item) => {
        console.log(item);
        var url =  env.path + LOCATION_GET_BY_CAMPUS;
        try{
            let res = await this.execute_post(url, item.campus);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getLocationByCampus =  async (item) => {
        var url =  env.path + LOCATION_GET_BY_CAMPUS;
        try{
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    importExcel = async (item) => {
        var url = env.path + LOCATION_IMPORT_EXCEL;
        try {
            let res = await this.importFile(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getTemplateImport = async () => {
        var url = 'http://demofmsapi.site' + LOCATION_GET_TEMPLATE;
        try {
            let res = await this.export(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    saveImportExcel =  async (item) => {
        var url =  env.path + LOCATION_SAVE_IMPORT;
        try{
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }
}