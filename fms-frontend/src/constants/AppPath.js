export const TEST_API = "/troubles";

export const CAMPUS_GET_ALL = "/api/Campus/getall";
export const CAMPUS_GET_ALL_NO_CONDITION = "/api/Campus/getallNoCondition";
export const CAMPUS_SAVE = "/api/Campus/save";
export const CAMPUS_DELETE = "/api/Campus/delete";
export const CAMPUS_GETLIST = "/api/Campus/getlist";
export const CAMPUS_GETLIST_NO_CONDITION = "/api/Campus/getlistNoCondition";
export const CAMPUS_CHANGE_ACTIVE = "/api/Campus/changeActive";

export const AREA_ROOM_GET_ALL = "/api/AreaRoom/getall";
export const AREA_ROOM_GET_ALL_NO_CONDITION = "/api/AreaRoom/getallNoCondition";
export const AREA_ROOM_SAVE = "/api/AreaRoom/save";
export const AREA_ROOM_DELETE = "/api/AreaRoom/delete";
export const AREA_ROOM_GET_LIST = "/api/AreaRoom/getlist";
export const AREA_ROOM_GET_LIST_NO_CONDITION = "/api/AreaRoom/getlistNoCondition";
export const AREA_ROOM_CHANGE_ACTIVE = "/api/AreaRoom/changeActive";
export const AREA_ROOM_GET_BY_LIST_LOCATION = "/api/AreaRoom/getByListLocation";
export const AREA_ROOM_IMPORT_EXCEL = "/api/AreaRoom/import";
export const AREA_ROOM_GET_TEMPLATE = "/api/AreaRoom/downloadTemplate";
export const AREA_ROOM_SAVE_IMPORT = "/api/AreaRoom/saveImport";

export const ASSET_GET_ALL = "/api/Asset/getall";
export const ASSET_SAVE = "/api/Asset/save";
export const ASSET_DELETE = "/api/Asset/delete";
export const ASSET_GET_LIST = "/api/Asset/getlist";
export const ASSET_CHANGE_ACTIVE = "/api/Asset/changeActive";
export const ASSET_GET_ALL_MEASURE = "/api/Asset/getMeasure";

export const LOCATION_GET_ALL = "/api/Location/getall";
export const LOCATION_GET_ALL_NO_CONDITION = "/api/Location/getallNoCondition";
export const LOCATION_GET_LIST = "/api/Location/getlist";
export const LOCATION_GET_LIST_NO_CONDITION = "/api/Location/getlistNoCondition";
export const LOCATION_CHANGE_ACTIVE = "/api/Location/changeActive";
export const LOCATION_SAVE = "/api/Location/save";
export const LOCATION_DELETE= "/api/Location/delete";
export const LOCATION_GET_BY_CAMPUS = "/api/Location/getByListCampus";
export const LOCATION_GET_TEMPLATE = "/api/Location/downloadTemplate";
export const LOCATION_IMPORT_EXCEL = "/api/Location/import";
export const LOCATION_SAVE_IMPORT = "/api/Location/saveImport";

export const USER_GET_ALL = "/api/User/getall";
export const USER_GET_USER_BY_EMAIL = "/api/User/getUserByEmail";
export const USER_GET_LIST = "/api/User/getlist";
export const USER_SAVE = "/api/User/save";
export const USER_DELETE = "/api/User/delete";
export const USER_CHANGE_ACTIVE = "/api/User/changeActive";

export const CATEGORY_GET_ALL = "/api/Category/getall";
export const CATEGORY_SAVE = "/api/Category/save";
export const CATEGORY_GET_LIST = "/api/Category/getlist";
export const CATEGORY_DELETE = "/api/Category/delete";

export const ROLE_GET_ALL = "/api/Role/getall";
export const GET_BY_ROLE = "/api/User/getByRole?role=";

export const TROUBLE_SAVE_IMAGE ="https://api.cloudinary.com/v1_1/dqds2j3jr/image/upload";
export const TROUBLE_CREATE = "/api/Trouble/create";
export const TROUBLE_GET_LIST = "/api/Trouble/getlist";
export const TROUBLE_EXPORT = "/api/Trouble/export";
export const TROUBLE_CHANGE_TECH = "/api/Trouble/changetechnician";
export const TROUBLE_GET_BY_ID = "/api/Trouble/getbyid?reportId=";
export const TROUBLE_DELETE_IMAGE = "/api/Trouble/deleteimage";
export const TROUBLE_CANCEL = "/api/Trouble/cancel";
export const TROUBLE_DELETE = "/api/Trouble/deleteReport?id=";
export const TROUBLE_UPDATE = "/api/Trouble/update";
export const TROUBLE_COUNT = "/api/Trouble/count";
export const TROUBLE_GET_HISTORY = "/api/Trouble/getHistory?reportId=";


export const WORKFLOW_GET_BY_TYPE = "/api/Workflow/getByType?type=";

export const CHECKLIST_GETLIST = "/api/Checklist/getlist";
export const CHECKLIST_GETWEEKLYLIST = "/api/Checklist/getWeeklyList";
export const CHECKLIST_GETDETAIL = "/api/Checklist/getDetail?checklistId=";
export const CHECKLIST_SAVE = "/api/Checklist/save";
export const CHECKLIST_DOWNLOAD_TEMPLATE = "/api/Checklist/template";
export const CHECKLIST_IMPORT_TEMPLATE = "/api/Checklist/importFile";
export const CHECKLIST_GETTEMP = "/api/Checklist/getTemplate?campus=";
export const CHECKLIST_SAVE_IMPORT = "/api/Checklist/saveImport";
export const CHECKLIST_ALL_TYPE= "/api/Checklist/getAllType?campus=";
export const CHECKLIST_GET_CUSTOMIZE_DETAIL = "/api/Checklist/getCustomizeDetail?tempId=";
export const CHECKLIST_ALL_COMPONENT = "/api/Checklist/getAllComponents";
export const CHECKLIST_DELETE_ITEM = "/api/Checklist/deleteItem";
export const CHECKLIST_UPDATE_ITEM = "/api/Checklist/updateItem";
export const CHECKLIST_DELETE_TEMPLATE = "/api/Checklist/deleteTemplate";
export const CHECKLIST_UPDATE_CONFIGURATION = "/api/Checklist/updateConfiguration";
export const CHECKLIST_CREATE_ITEM = "/api/Checklist/createNewItem";
export const CHECKLIST_SAVE_TEMPLATE = "/api/Checklist/saveTemplate";
export const CHECKLIST_GET_TEMPLATE = "/api/Checklist/getTemplateDetail?id=";
export const CHECKLIST_COMPONENT_DELETE = "/api/Checklist/deleteComponent?id=";
export const CHECKLIST_GET_TEMPLATE_BASIC_INFO = "/api/Checklist/getTemplateBasicInfomation?id=";
export const CHECKLIST_CREATE = "/api/Checklist/create";
export const CHECKLIST_DELETE = "/api/Checklist/delete?id=";

export const TECH_REPORT_GET_REPORT = "/api/TechnicalReport/getReport";
export const TECH_REPORT_EXPORT_REPORT = "/api/TechnicalReport/export";


export const WAREHOUSE_DOWNLOAD_IMPORT_TEMPLATE = "/api/Warehouse/downloadImportTemplate";
export const WAREHOUSE_IMPORT_ASSET = "/api/Warehouse/importAsset";
export const WAREHOUSE_IMPORT_SAVE_ASSET = "/api/Warehouse/saveImportWarehouse";
export const WAREHOUSE_IMPORT_GET_ASSET = "/api/Warehouse/getAssetByCode?code=";

export const WAREHOUSE_DOWNLOAD_EXPORT_TEMPLATE = "/api/Warehouse/downloadExportTemplate";
export const WAREHOUSE_EXPORT_ASSET = "/api/Warehouse/importExportAsset";
export const WAREHOUSE_EXPORT_VALIDATE_URL = "/api/Warehouse/validateURL";
export const WAREHOUSE_ASSET_GET_ALL = "/api/Warehouse/getAllAsset";
export const WAREHOUSE_EXPORT_SAVE_ASSET = "/api/Warehouse/saveExportWarehouse";

export const WAREHOUSE_GET_LIST_HISTORY = "/api/Warehouse/getListHistory";
export const WAREHOUSE_GET_LIST_REMAINING = "/api/Warehouse/getListRemaining";
export const WAREHOUSE_GET_LIST_CONFIG = "/api/Warehouse/getListConfig";

export const WAREHOUSE_DOWNLOAD_HISTORY_REPORT = "/api/Warehouse/exportHistory";
export const WAREHOUSE_IMPORT_CHANGE_READY = "/api/Warehouse/changeReady";
export const WAREHOUSE_ASSET_CHANGE_STANDARD = "/api/Warehouse/updateStandard";

export const MAP_GET_MAP = "/api/Map/getMap";
export const MAP_GET_ALL_TYPE_ROOM = "/api/Map/getAllType";
export const MAP_SAVE_MAP = "/api/Map/saveMap";
export const MAP_GET_AREA_SELECT = "/api/Map/getAreaSelect";
export const DASH_CHECKLIST = "/api/Dashboard/checklist";
export const DASH_WAREHOUSE = "/api/Dashboard/warehouse";
