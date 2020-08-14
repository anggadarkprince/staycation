import React from "react";

export const authDefaultValue = {
    token: null,
    tokenExpiredAt: null,
    user: null,
    remember: null,
    logout: () => {},
};

export default React.createContext(null);
