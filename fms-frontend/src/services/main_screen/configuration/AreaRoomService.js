import { env } from '../../../constants/Constants';
import { BaseApi } from "../../BaseApi";
import {
    CAMPUS_GET_ALL,
    AREA_ROOM_GET_ALL,
    AREA_ROOM_SAVE,
    AREA_ROOM_DELETE,
    AREA_ROOM_GET_LIST,
    LOCATION_GET_ALL,
    LOCATION_GET_LIST,
    AREA_ROOM_CHANGE_ACTIVE,
    AREA_ROOM_GET_BY_LIST_LOCATION,
    CAMPUS_GET_ALL_NO_CONDITION,
    LOCATION_GET_ALL_NO_CONDITION,
    LOCATION_GET_LIST_NO_CONDITION,
    AREA_ROOM_GET_LIST_NO_CONDITION,
    AREA_ROOM_IMPORT_EXCEL,
    AREA_ROOM_GET_TEMPLATE,
    USER_GET_USER_BY_EMAIL,
    AREA_ROOM_SAVE_IMPORT
} from "../../../constants/AppPath";

export class AreaRoomService extends BaseApi {
    getAll = async () => {
        var url = env.path + AREA_ROOM_GET_ALL;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllCampus = async () => {
        var url = env.path + CAMPUS_GET_ALL;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllCampusNoCondition = () => {
        var url =  env.path + CAMPUS_GET_ALL_NO_CONDITION;
        try{
            let res = this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    changeIsActive = async (data) => {
        var url = env.path + AREA_ROOM_CHANGE_ACTIVE;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllLocation = async () => {
        var url = env.path + LOCATION_GET_ALL;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllLocationNoCondition = async () => {
        var url =  env.path + LOCATION_GET_ALL_NO_CONDITION;
        try{
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    saveAreaRoom = async (item) => {
        var url = env.path + AREA_ROOM_SAVE;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListAreaRoom = async (item) => {
        var url = env.path + AREA_ROOM_GET_LIST;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListAreaRoomNoCondition = async (item) => {
        var url = env.path + AREA_ROOM_GET_LIST_NO_CONDITION;
        try {
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListLocation = async (data) => {
        var url = env.path + LOCATION_GET_LIST;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListLocationNoCondition = async (item) =>{
        var url =  env.path + LOCATION_GET_LIST_NO_CONDITION;
        try{
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    deleteAreaRoom = async (id) => {
        var url = env.path + AREA_ROOM_DELETE + '?id=' + id;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListByLocations =  async (item) => {
        var url =  env.path + AREA_ROOM_GET_BY_LIST_LOCATION;
        try{
            let res = await this.execute_post(url, item.location);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAreaRoomByLocations =  async (item) => {
        var url =  env.path + AREA_ROOM_GET_BY_LIST_LOCATION;
        try{
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    importExcel = async (item) => {
        var url = env.path + AREA_ROOM_IMPORT_EXCEL;
        try {
            let res = await this.importFile(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getTemplateImport = async () => {
        var url = 'http://demofmsapi.site' + AREA_ROOM_GET_TEMPLATE;
        try {
            let res = await this.export(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getUserByEmail = async (email) => {
        var url = env.path + USER_GET_USER_BY_EMAIL + '?email=' + email;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    saveImportExcel =  async (item) => {
        var url =  env.path + AREA_ROOM_SAVE_IMPORT;
        try{
            let res = await this.execute_post(url, item);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }
}