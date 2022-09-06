import {
    CHECKLIST_GETLIST, CHECKLIST_GETWEEKLYLIST, CHECKLIST_GETDETAIL, CHECKLIST_SAVE, CHECKLIST_DOWNLOAD_TEMPLATE,
    CHECKLIST_IMPORT_TEMPLATE, CHECKLIST_GETTEMP, CHECKLIST_SAVE_IMPORT, CHECKLIST_ALL_TYPE, CHECKLIST_GET_CUSTOMIZE_DETAIL,
    CHECKLIST_ALL_COMPONENT,CHECKLIST_DELETE_ITEM,CHECKLIST_UPDATE_ITEM,CHECKLIST_DELETE_TEMPLATE,CHECKLIST_UPDATE_CONFIGURATION,
    CHECKLIST_CREATE_ITEM,
    CHECKLIST_SAVE_TEMPLATE,
    CHECKLIST_GET_TEMPLATE,
    CHECKLIST_COMPONENT_DELETE,
    CHECKLIST_GET_TEMPLATE_BASIC_INFO,
    CHECKLIST_CREATE,
    CHECKLIST_GET_LIST_BY_AREA,
    CHECKLIST_DELETE
} from "../../../constants/AppPath";
import { BaseApi } from "../../BaseApi";
import { env } from '../../../constants/Constants';

export class ChecklistService extends BaseApi { 
    getList = async (item) => {
        var url = env.path + CHECKLIST_GETLIST;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getWeekly = async (item) => {
        var url = env.path + CHECKLIST_GETWEEKLYLIST;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getDetail = async (checklistId) => {
        var url = env.path + CHECKLIST_GETDETAIL + checklistId;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    save = async (data) => {
        var url = env.path + CHECKLIST_SAVE;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    downloadTemplate = async () => {
        var url = env.path + CHECKLIST_DOWNLOAD_TEMPLATE;
        try {
            let res = await this.export(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    importExcel = async (item) => {
        var url = env.path + CHECKLIST_IMPORT_TEMPLATE;
        try {
            let res = await this.importFile(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllTemp = async (campus) => {
        var url = env.path + CHECKLIST_GETTEMP + campus;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getTypes = async (campus) => {
        var url = env.path + CHECKLIST_ALL_TYPE + campus;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    saveImport = async (data) => {
        var url = env.path + CHECKLIST_SAVE_IMPORT;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getCustomizeDetail = async (tempId) => {
        var url = env.path + CHECKLIST_GET_CUSTOMIZE_DETAIL + tempId;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllComponents = async () => {
        var url = env.path + CHECKLIST_ALL_COMPONENT;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    deleteItem = async (id) => {
        var url = env.path + CHECKLIST_DELETE_ITEM + '?id=' + id;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    deleteTemplate = async (id) => {
        var url = env.path + CHECKLIST_DELETE_TEMPLATE + '?id=' + id;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    createItem = async (data) => {
        var url = env.path + CHECKLIST_CREATE_ITEM;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    updateItem = async (data) => {
        var url = env.path + CHECKLIST_UPDATE_ITEM;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    updateConfiguration = async (data) => {
        var url = env.path + CHECKLIST_UPDATE_CONFIGURATION;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    saveTemplate = async (data) => {
        var url = env.path + CHECKLIST_SAVE_TEMPLATE;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getTemplate = async (id) => {
        var url = env.path + CHECKLIST_GET_TEMPLATE + id;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    deleteComponent = async (id) => {
        var url = env.path + CHECKLIST_COMPONENT_DELETE + id;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getTemplateBasicInfo = async (id) => {
        var url = env.path + CHECKLIST_GET_TEMPLATE_BASIC_INFO + id;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    create = async (data) => {
        var url = env.path + CHECKLIST_CREATE;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    delete = async (id) => {
        var url = env.path + CHECKLIST_DELETE + id;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }
}