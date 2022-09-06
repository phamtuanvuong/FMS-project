import { env } from '../../../constants/Constants';
import { BaseApi } from "../../BaseApi";
import {
    ASSET_GET_ALL,
    ASSET_SAVE,
    ASSET_DELETE,
    ASSET_GET_LIST,
    ASSET_CHANGE_ACTIVE,
    CAMPUS_GET_ALL,
    LOCATION_GET_ALL,
    AREA_ROOM_GET_ALL,
    LOCATION_GET_LIST,
    AREA_ROOM_GET_LIST,
    CATEGORY_GET_ALL,
    ASSET_GET_ALL_MEASURE,
    LOCATION_GET_ALL_NO_CONDITION,
    CAMPUS_GET_ALL_NO_CONDITION,
    AREA_ROOM_GET_ALL_NO_CONDITION,
    LOCATION_GET_LIST_NO_CONDITION,
    AREA_ROOM_GET_LIST_NO_CONDITION
} from "../../../constants/AppPath";

export class AssetService extends BaseApi {
    getAllAsset = async () => {
        var url = env.path + ASSET_GET_ALL;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllCategory = async () => {
        var url = env.path + CATEGORY_GET_ALL;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllAreaRoom = async () => {
        var url = env.path + AREA_ROOM_GET_ALL;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getAllAreaRoomNoCondition = async () => {
        var url = env.path + AREA_ROOM_GET_ALL_NO_CONDITION;
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
        var url = env.path + ASSET_CHANGE_ACTIVE;
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

    saveAsset = async (data) => {
        var url = env.path + ASSET_SAVE;
        try {
            let res = await this.execute_post(url, data);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }

    getListAsset = async (data) => {
        var url = env.path + ASSET_GET_LIST;
        try {
            let res = await this.execute_post(url, data);
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

    deleteAsset = async (id) => {
        var url = env.path + ASSET_DELETE + '?id=' + id;
        try {
            let res = await this.execute_get(url);
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

    getMeasureUnits = async () => {
        var url = env.path + ASSET_GET_ALL_MEASURE;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }
}