import '../Custom.css';
import React, {useEffect, useState} from 'react';
import Login from '../Login/Features/Login';
import {createBrowserRouter, RouterProvider, Outlet, redirect} from 'react-router-dom';
import ResetPassword from './ResetPassword';
import Userslist from './UsersList';
import AppNavbar from './Navbar';
import UserDetails from './UserDetails';
import CreateUser from './CreateUser';
import UserProfile from './UserProfile';
import {getCookie, getTokenOrNavigate} from '../Login/Api/login-logout';
import TimeStatistic from "./TimeStatistic"
import RequestResetPassword from "./RequestResetPassword";
import UserRegistration from './UserRegistration';
import Calendar from './Calendar';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../Redux/store';
import PermissionError from './PermissionError';
import {RequestCurrentUser} from '../Redux/Requests/UserRequests';
import {User} from '../Redux/Types/User';

import NotificationModalWindow, { MasssgeType } from './NotificationModalWindow';
import { clearErroMassage as clearErroMassageTime } from '../Redux/Slices/TimeSlice';
import { clearErroMassage as clearErroMassageUserList } from '../Redux/Slices/UserSlice';
import { setErrorStatusAndError as setErroMassageLocation, clearErroMassage as clearErroMassageLocation, setloadingStatus as setloadingStatusLocation } from '../Redux/Slices/LocationSlice';
import { setErrorStatusAndError as setErroMassageToken,setSuccessStatus as setSuccessStatusToken, clearErroMassage as clearErroMassageToken, setloadingStatus as setloadingStatusToken } from '../Redux/Slices/TokenSlicer';
import { Subscription,timer } from 'rxjs';
import { ajaxForRefresh } from '../Login/Api/login-logout';

import { Permissions } from '../Redux/Types/Permissions';
import MainMenu from './MainMenu';


const checkPermissions = (Permission: string, permissions: Permissions) => {
  if (Permission === "ViewUsers" && permissions.viewUsers === false) {
    return redirect("/PermissionError");
  }
  if (Permission === "CreateUsers" && permissions.cRUDUsers === false) {
    return redirect("/PermissionError");
  }
  if (Permission === "UserDetails" && permissions.viewUsers === false) {
    return redirect("/PermissionError");
  }
  if (Permission === "Time" && getCookie("is_fulltimer") === "true") {
    return redirect("/PermissionError");
  }
  return null;
}
const router = (permissions: Permissions) => createBrowserRouter([
  {
    element: <AppNavbar/>,
    loader: async () => getTokenOrNavigate(),
    children: [
      {
        path: "/",
        element: <MainMenu/>
      },
      {
        path: "/Users",
        loader: async () => checkPermissions("ViewUsers", permissions),
        element: <Userslist/>,
      },
      {
        path: "/Users/:userId",
        loader: async () => checkPermissions("UserDetails", permissions),
        element: <UserDetails/>
      },
      {
        path: "/CreateUser",
        loader: async () => checkPermissions("CreateUsers", permissions),
        element: <CreateUser/>
      },
      {
        path: "/User/:login",
        element: <UserProfile/>
      },
      {
        path: "/Calendar",
        element: <Calendar/>
      },
      {
        path: "/Time",
        loader: async () => checkPermissions("Time", permissions),
        element: <TimeStatistic/>
      },
      {
        path: "/PermissionError",
        element: <PermissionError/>
      },
    ]
  },
  {
    path: "/Login",
    element: <Login/>,
    loader: async () => getTokenOrNavigate(true),
  },
  {
    path: "/ResetPassword",
    element: <ResetPassword/>
  },
  {
    path: "/RequestResetPassword",
    element: <RequestResetPassword/>
  },
  {
    path: "/UserRegistration",
    element: <UserRegistration/>
  }
])


function AppContent() {


  const errorTime = useSelector((state: RootState) => state.time.error ? state.time.error : "");
  const errorUserList = useSelector((state: RootState) => state.users.error ? state.users.error : "");
  const errorLocation = useSelector((state: RootState) => state.location.error ? state.location.error : "");
  const errorToken = useSelector((state:RootState)=> state.token.error ? state.token.error : "")

  const dispatch = useDispatch();
  let permissions = useSelector((state: RootState) => state.currentUser.Permissions);
  return (
    <div className='Content container-fluid p-0 h-100'>
      <RouterProvider router={router(permissions)}/>
      <NotificationModalWindow isShowed={errorTime !== ""} dropMassege={() => dispatch(clearErroMassageTime())} messegeType={MasssgeType.Error}>{errorTime}</NotificationModalWindow>
      <NotificationModalWindow isShowed={errorUserList !== ""} dropMassege={() => dispatch(clearErroMassageUserList())} messegeType={MasssgeType.Error}>{errorUserList}</NotificationModalWindow>
      <NotificationModalWindow isShowed={errorLocation !== ""} dropMassege={() => dispatch(clearErroMassageLocation())} messegeType={MasssgeType.Error}>{errorLocation}</NotificationModalWindow>
      <NotificationModalWindow isShowed={errorToken !== ""} dropMassege={() => dispatch(clearErroMassageToken())} messegeType={MasssgeType.Error}>{errorToken}</NotificationModalWindow>
    </div>
  );
}

export default AppContent;
