import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Home from './containers/main_screen/dashboard/home/Home';
import Notfound from './containers/notfound_page/NotFound';
import Unauthozied from './containers/notfound_page/Unauthozied';
import Navigation from './containers/main_screen/Navigation';

import CreateTrouble from './containers/main_screen/dashboard/trouble/CreateTrouble';
import MyTrouble from './containers/main_screen/dashboard/trouble/MyTrouble';
import TroubleDetail from './containers/main_screen/dashboard/trouble/TroubleDetail';
import CreateTroubleWithoutLogin from './containers/without_login/CreateTrouble';

import MyChecklists from './containers/main_screen/dashboard/checklist/MyChecklists';
import CheklistsWeekly from './containers/main_screen/dashboard/checklist/CheklistsWeekly';
import ChecklistDetail from './containers/main_screen/dashboard/checklist/ChecklistDetail';
import CustomizeChecklist from './containers/main_screen/dashboard/checklist/CustomizeChecklist';

import CampusConfiguration from './containers/main_screen/dashboard/configuration/campus/CampusConfig';
import LocationConfiguration from './containers/main_screen/dashboard/configuration/location/LocationConfig';
import AreaRoomConfiguration from './containers/main_screen/dashboard/configuration/areaRoom/AreaRoomConfig';
import UserConfiguration from './containers/main_screen/dashboard/configuration/user/UserConfig';
import AssetConfiguration from './containers/main_screen/dashboard/configuration/asset/AssetConfig';
import AssetCategoryConfig from './containers/main_screen/dashboard/configuration/assetType/AssetCategoryConfig';

// import MaintainceSchedule from './containers/main_screen/dashboard/maintance/Schedule';

import WarehouseAsset from './containers/main_screen/dashboard/warehouse/WarehouseAsset';
import WarehouseHistory from './containers/main_screen/dashboard/warehouse/WarehouseHistory';
import WarehouseRemainingRp from './containers/main_screen/dashboard/warehouse/WarehouseRemainingRp';
import WarehouseRemainingStandard from './containers/main_screen/dashboard/warehouse/WarehouseRemainingStandard';

import CustomizeMap from './containers/main_screen/dashboard/map/CustomizeMap';
import ViewMap from './containers/main_screen/dashboard/map/ViewMap';

import Guideline from './containers/main_screen/dashboard/guidline/Guideline';
import Techreports from './containers/main_screen/dashboard/techreport/TechReports';

import Dialog from '../src/components/Dialog';
import MessageBox from '../src/components/MessageBox';
import ProgressCustom from '../src/components/ProgressCustom'

import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import AppContext from './context/AppContext';

import RoleAuth from './auth/RoleAuth';

import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';

import commonVn from './locales/vi/common.json';
import commonEn from './locales/en/common.json';
import navigationVn from './locales/vi/navigation.json';
import navigationEn from './locales/en/navigation.json';
import homeVn from './locales/vi/home.json';
import homeEn from './locales/en/home.json';
import troubleVn from './locales/vi/trouble.json';
import troubleEn from './locales/en/trouble.json';
import checklistVn from './locales/vi/checklist.json';
import checklistEn from './locales/en/checklist.json';
import techreportVn from './locales/vi/techreport.json';
import techreportEn from './locales/en/techreport.json';
import mapVn from './locales/vi/map.json';
import mapEn from './locales/en/map.json';
import warehouseVn from './locales/vi/warehouse.json';
import warehouseEn from './locales/en/warehouse.json';
import configurationVn from './locales/vi/configuration.json';
import configurationEn from './locales/en/configuration.json';
import guidlineVn from './locales/vi/guideline.json';
import guidlineEn from './locales/en/guideline.json';

// import english from './locales/en/English.json';

i18next.init({
    interpolation: { escapeValue: false },
    lng: 'vn',
    resources: {
        vn: {
            common: commonVn,
            navigation: navigationVn,
            home: homeVn,
            trouble: troubleVn,
            checklist: checklistVn,
            techreport: techreportVn,
            map: mapVn,
            warehouse: warehouseVn,
            configuration: configurationVn,
            guideline: guidlineVn
        },
        en: {
            common: commonEn,
            navigation: navigationEn,
            home: homeEn,
            trouble: troubleEn,
            checklist: checklistEn,
            techreport: techreportEn,
            map: mapEn,
            warehouse: warehouseEn,
            configuration: configurationEn,
            guideline: guidlineEn
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AppContext.Provider value={{ userInfo: null, isAuthen: false }}>
        <React.StrictMode>
            <BrowserRouter>
                <I18nextProvider i18n={i18next}>
                    <Dialog />
                    <MessageBox />
                    <ProgressCustom />
                    <Routes>
                        <Route path='/login' element={<App />} />
                        <Route path='/createTroubleWithoutLogin/' element={<CreateTroubleWithoutLogin />}>
                            <Route path=':campus' element={<CreateTroubleWithoutLogin />}>
                                <Route path=':location' element={<CreateTroubleWithoutLogin />}>
                                    <Route path=':area' element={<CreateTroubleWithoutLogin />}>

                                    </Route>
                                </Route>
                            </Route>
                        </Route>
                        
                        <Route path='/' element={<Navigation />}>
                            <Route index path='home' element={<Home />} />
                            <Route path='' element={<Home />} />
                            <Route path='trouble' element={<MyTrouble />} />
                            <Route path='createTrouble' element={<CreateTrouble />} />
                            <Route path='updateTrouble/' >
                                <Route path=':troubleId' element={<CreateTrouble />} />
                            </Route>
                            <Route path='detailTrouble/'>
                                <Route path=':troubleId' element={<TroubleDetail />} />
                            </Route>

                            <Route element={<RoleAuth arrayAuth={[2, 3, 4]} />} >
                                <Route path='checklist' element={<MyChecklists />} />
                                <Route path='checklistsWeekly' element={<CheklistsWeekly />}>
                                </Route>
                                <Route path='checklistDetail'>
                                    <Route path=':checklistDetailId' element={<ChecklistDetail />} />
                                </Route>

                                <Route path='warehouseHistory' element={<WarehouseHistory />} />
                                <Route path='warehouseRemainingReport' element={<WarehouseRemainingRp />} />

                                <Route path='techreport' element={<Techreports />} />
                            </Route>

                            <Route element={<RoleAuth arrayAuth={[2, 3]} />} >
                                <Route path='checklistCustomize' element={<CustomizeChecklist />} />

                                <Route path='mapCustomize' element={<CustomizeMap />} />

                                <Route path='warehouseRemainingStandard' element={<WarehouseRemainingStandard />} />
                            </Route>

                            <Route element={<RoleAuth arrayAuth={[3]} />} >
                                <Route path='warehouseAsset' element={<WarehouseAsset />} />
                            </Route>

                            <Route element={<RoleAuth arrayAuth={[2]} />} >
                                <Route path='campusConfiguration' element={<CampusConfiguration />} />
                                <Route path='locationConfiguration' element={<LocationConfiguration />} />
                                <Route path='roomAreaConfiguration' element={<AreaRoomConfiguration />} />
                                <Route path='userConfiguration' element={<UserConfiguration />} />
                                <Route path='assetConfiguration' element={<AssetConfiguration />} />
                                <Route path='assetCategoryConfiguration' element={<AssetCategoryConfig />} />
                            </Route>

                            {/* <Route path='maintaince' element={<MaintainceSchedule />} /> */}

                            <Route path='mapView' element={<ViewMap />} />

                            <Route path='guideline' element={<Guideline />} />

                            <Route path='/unAuthorized' element={<Unauthozied />} />
                        </Route>
                        <Route path='*' element={<Notfound />} />
                    </Routes>
                </I18nextProvider>
            </BrowserRouter>
        </React.StrictMode>
    </AppContext.Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
