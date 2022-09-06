export const FileURL = {
    PUBLIC: "%PUBLIC_URL%"
}

export const ACTION = {
    CREATE: "CREATE",
    UPDATE: "UPDATE",
    VIEW: "VIEW",
    DELETE: "DELETE",
    DETAIL: "DETAIL",
    FORWARD: "FORWARD",
    EXPORTQR: "EXPORTQR",
};

export const env ={
    ggClientID : "838705461058-46dntk106g2uur1j5b88v188ibu1omss.apps.googleusercontent.com",
    // path: 'https://localhost:5001' //localhost
    path: 'http://demofmsapi.site' //deploy
}

export const URLWEB = {
    path: 'http://demofms.site:3000/createTroubleWithoutLogin',
    deployPath: 'http://demofms.site:3000'
}

export const STATUS = {
    SUCCESS: 200,
    ERROR: 500,
    BAD_REQUEST: 400,
    NOT_FOUND: 404
};

export const MESSAGE = {
    CREATE_SUCCESS: 'Create successfully!',
    UPDATE_SUCCESS: 'Update successfully!',
    DELETE_SUCCESS: 'Delete successfully!',
    SAVED_SUCCESS: 'Saved successfully',
    ERROR: 'Error occur! Please try again later.'
}