import React from 'react'
import ReactDOM from "react-dom/client"
import App from './components/App';

import {GoogleOAuthProvider } from '@react-oauth/google';

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
<GoogleOAuthProvider clientId="1051141458689-m2p57ja57jscqatag991b499i9u1ojkf.apps.googleusercontent.com">
    <App/>
</GoogleOAuthProvider>
)