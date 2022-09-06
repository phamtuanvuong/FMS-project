import { env } from '../../../constants/Constants';
import { BaseApi } from "../../BaseApi";
import {
    WORKFLOW_GET_BY_TYPE
} from "../../../constants/AppPath";

export class WorkflowService extends BaseApi {
    getByType = async (type) => {
        var url = env.path + WORKFLOW_GET_BY_TYPE + type;
        try {
            let res = await this.execute_get(url);
            return res;
        }
        catch (err) {
            console.error(err);
        }
    }
}