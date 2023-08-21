import '../Custom.css';
import Login from '../Login/Features/Login';
import { createBrowserRouter, RouterProvider, Outlet, redirect } from 'react-router-dom';
import ResetPassword from './User/ResetPassword';
import Userslist from './User/UsersList';
import AppNavbar from './Navbar';
import UserDetails from './User/UserDetails';
import CreateUser from './User/CreateUser';
import UserProfile from './User/UserProfile';
import { getCookie, getTokenOrNavigate } from '../Login/Api/login-logout';
import TimeStatistic from "./Time/TimeStatistic"
import RequestResetPassword from "./User/RequestResetPassword";
import UserRegistration from './User/UserRegistration';
import Calendar from './Calendar/Calendar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import PermissionError from './Service/PermissionError';
import { RequestCurrentUser, RequestCurrentUserPermissions } from '../Redux/Requests/UserRequests';

import NotificationModalWindow, { MessageType } from './Service/NotificationModalWindow';
import { clearErrorMessage as clearErrorMessageTime } from '../Redux/Slices/TimeSlice';
import { clearErrorMessage as clearErrorMessageUserList } from '../Redux/Slices/UserSlice';
import { clearErrorMessage as clearErrorMessageLocation } from '../Redux/Slices/LocationSlice';
import { clearErrorMessage as clearErrorMessageToken } from '../Redux/Slices/TokenSlicer';

import { Permissions } from '../Redux/Types/Permissions';
import MainMenu from './MainMenu';


const checkPermissions = (Permission: string, permissions: Permissions) => {
    if (Permission === "ViewUsers" && !permissions.viewUsers) {
        return redirect("/PermissionError");
    }
    if (Permission === "CreateUsers" && !permissions.cRUDUsers) {
        return redirect("/PermissionError");
    }
    if (Permission === "UserDetails" && !permissions.viewUsers) {
        return redirect("/PermissionError");
    }
    if (Permission === "Time" && getCookie("is_fulltimer") === "true") {
        return redirect("/PermissionError");
    }
    return null;
}
const router = () => createBrowserRouter([
    {
        element: <AppNavbar />,
        loader: async () => getTokenOrNavigate(),
        children: [
            {
                path: "/",
                element: <MainMenu />
            },
            {
                path: "/Users",
                loader: async () => RequestCurrentUserPermissions().subscribe((permissions) => { checkPermissions("ViewUsers", permissions) }),
                element: <Userslist />,
            },
            {
                path: "/Users/:userId",
                loader: async () => RequestCurrentUserPermissions().subscribe((permissions) => { checkPermissions("UserDetails", permissions) }),
                element: <UserDetails />
            },
            {
                path: "/CreateUser",
                loader: async () => RequestCurrentUserPermissions().subscribe((permissions) => { checkPermissions("CreateUsers", permissions) }),
                element: <CreateUser />
            },
            {
                path: "/User/:login",
                element: <UserProfile />
            },
            {
                path: "/Calendar",
                element: <Calendar />
            },
            {
                path: "/Time",
                loader: async () => RequestCurrentUserPermissions().subscribe((permissions) => { checkPermissions("Time", permissions) }),
                element: <TimeStatistic />
            },
            {
                path: "/PermissionError",
                element: <PermissionError />
            },
        ]
    },
    {
        path: "/Login",
        element: <Login />,
        loader: async () => getTokenOrNavigate(true),
    },
    {
        path: "/ResetPassword",
        element: <ResetPassword />
    },
    {
        path: "/RequestResetPassword",
        element: <RequestResetPassword />
    },
    {
        path: "/UserRegistration",
        element: <UserRegistration />
    }
])


function AppContent() {


    const errorTime = useSelector((state: RootState) => state.time.error ? state.time.error : "");
    const errorUserList = useSelector((state: RootState) => state.users.error ? state.users.error : "");
    const errorLocation = useSelector((state: RootState) => state.location.error ? state.location.error : "");
    const errorToken = useSelector((state: RootState) => state.token.error ? state.token.error : "")

    const dispatch = useDispatch();
    return (
        <div className='Content container-fluid p-0 h-100'>
            <RouterProvider router={router()} />
            <NotificationModalWindow isShowed={errorTime !== ""} dropMessage={() => dispatch(clearErrorMessageTime())}
                messageType={MessageType.Error}>{errorTime}</NotificationModalWindow>
            <NotificationModalWindow isShowed={errorUserList !== ""}
                dropMessage={() => dispatch(clearErrorMessageUserList())}
                messageType={MessageType.Error}>{errorUserList}</NotificationModalWindow>
            <NotificationModalWindow isShowed={errorLocation !== ""}
                dropMessage={() => dispatch(clearErrorMessageLocation())}
                messageType={MessageType.Error}>{errorLocation}</NotificationModalWindow>
            <NotificationModalWindow isShowed={errorToken !== ""} dropMessage={() => dispatch(clearErrorMessageToken())}
                messageType={MessageType.Error}>{errorToken}</NotificationModalWindow>
        </div>
    );
}

export default AppContent;
