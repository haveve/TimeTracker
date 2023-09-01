import ReactDOM from 'react-dom/client';
import App from './App';
import {Provider} from "react-redux";
import store from "./Redux/store";

import "./i18n"
import {Suspense} from "react";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <Provider store={store}>
        <Suspense fallback={<div>Loading...</div>}>
            <App/>
        </Suspense>
    </Provider>
);
