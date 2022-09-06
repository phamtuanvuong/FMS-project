import { env } from '../../../constants/Constants';
import { BaseApi } from "../../BaseApi";
import {
    WAREHOUSE_ASSET_CHANGE_STANDARD,
    WAREHOUSE_ASSET_GET_ALL,
    WAREHOUSE_DOWNLOAD_EXPORT_TEMPLATE,
    WAREHOUSE_DOWNLOAD_HISTORY_REPORT,
    WAREHOUSE_DOWNLOAD_IMPORT_TEMPLATE, WAREHOUSE_EXPORT_ASSET, WAREHOUSE_EXPORT_SAVE_ASSET, WAREHOUSE_EXPORT_VALIDATE_URL, WAREHOUSE_GET_LIST_CONFIG, WAREHOUSE_GET_LIST_HISTORY, WAREHOUSE_GET_LIST_REMAINING, WAREHOUSE_IMPORT_ASSET, WAREHOUSE_IMPORT_CHANGE_READY, WAREHOUSE_IMPORT_GET_ASSET, WAREHOUSE_IMPORT_SAVE_ASSET
} from "../../../constants/AppPath";

export class WarehouseService extends BaseApi {

    downloadTemplate = async () => {
        var url = env.path + WAREHOUSE_DOWNLOAD_IMPORT_TEMPLATE;
        try {
            let res = await this.export(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    importExcel = async (item) => {
        var url = env.path + WAREHOUSE_IMPORT_ASSET;
        try {
            let res = await this.importFile(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    saveImportData = async (item) => {
        // debugger
        var url = env.path + WAREHOUSE_IMPORT_SAVE_ASSET;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getById = async (id) => {
        var url = env.path + WAREHOUSE_IMPORT_GET_ASSET + id;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    downloadTemplateExport = async () => {
        var url = env.path + WAREHOUSE_DOWNLOAD_EXPORT_TEMPLATE;
        try {
            let res = await this.export(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    importExportExcel = async (item) => {
        var url = env.path + WAREHOUSE_EXPORT_ASSET;
        try {
            let res = await this.importFile(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    validateURL = async (item) => {
        // debugger
        var url = env.path + WAREHOUSE_EXPORT_VALIDATE_URL;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllAsset = async () => {
        var url = env.path + WAREHOUSE_ASSET_GET_ALL;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    saveExportData = async (item) => {
        // debugger
        var url = env.path + WAREHOUSE_EXPORT_SAVE_ASSET;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListHistory = async (item) => {
        // debugger
        var url = env.path + WAREHOUSE_GET_LIST_HISTORY;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListRemaining = async (item) => {
        // debugger
        var url = env.path + WAREHOUSE_GET_LIST_REMAINING;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListConfig = async (item) => {
        // debugger
        var url = env.path + WAREHOUSE_GET_LIST_CONFIG;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    exportHistory = async (item) => {
        var url = env.path + WAREHOUSE_DOWNLOAD_HISTORY_REPORT;
        try {
            let res = await this.export(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    changeReady = async (item) => {
        // debugger
        var url = env.path + WAREHOUSE_IMPORT_CHANGE_READY;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    updateStandard = async (item) => {
        // debugger
        var url = env.path + WAREHOUSE_ASSET_CHANGE_STANDARD;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

}