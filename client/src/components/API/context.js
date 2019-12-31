import React from 'react';
const APIContext = React.createContext(null);

export const withAPI = Component => props => (
    <APIContext.Consumer>
        {API => <Component {...props} API={API}/>}
    </APIContext.Consumer>
)

export default APIContext;