import React from "react";

const AppContext = React.createContext({
    userInfo : null,
    isAuthen : false
});
export default AppContext;