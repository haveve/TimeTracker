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
import {getTokenOrNavigate} from '../Login/Api/login-logout';
import TimeStatistic from "./TimeStatistic"
import RequestResetPassword from "./RequestResetPassword";
import UserRegistration from './UserRegistration';
import Calendar from './Calendar';
import ApproversSetup from "./ApproversSetup";
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
import { accessTokenLiveTime } from '../Login/Api/login-logout';
import { ajaxForRefresh } from '../Login/Api/login-logout';

const checkPermissions = (Permission: string, user: User) => {
  if (Permission === "ViewUsers" && user.viewUsers === false) {
    return redirect("/PermissionError");
  }
  if (Permission === "CreateUsers" && user.cRUDUsers === false) {
    return redirect("/PermissionError");
  }
  if (Permission === "UserDetails" && user.viewUsers === false) {
    return redirect("/PermissionError");
  }
  return null;
}
const router = (user: User) => createBrowserRouter([
  {
    element: <AppNavbar/>,
    loader: async () => getTokenOrNavigate(),
    children: [
      {
        path: "/",
        element: <TimeStatistic/>
      },
      {
        path: "/Users",
        loader: async () => checkPermissions("ViewUsers", user),
        element: <Userslist/>,
      },
      {
        path: "/Users/:userId",
        loader: async () => checkPermissions("UserDetails", user),
        element: <UserDetails/>
      },
      {
        path: "/CreateUser",
        loader: async () => checkPermissions("CreateUsers", user),
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
        path: "/PermissionError",
        element: <PermissionError/>
      }
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
  let user = useSelector((state: RootState) => state.currentUser.User);

  return (
    <div className='Content container-fluid p-0 h-100'>
      <RouterProvider router={router(user)}/>
      <NotificationModalWindow isShowed={errorTime !== ""} dropMassege={() => dispatch(clearErroMassageTime())} messegeType={MasssgeType.Error}>{errorTime}</NotificationModalWindow>
      <NotificationModalWindow isShowed={errorUserList !== ""} dropMassege={() => dispatch(clearErroMassageUserList())} messegeType={MasssgeType.Error}>{errorUserList}</NotificationModalWindow>
      <NotificationModalWindow isShowed={errorLocation !== ""} dropMassege={() => dispatch(clearErroMassageLocation())} messegeType={MasssgeType.Error}>{errorLocation}</NotificationModalWindow>
      <NotificationModalWindow isShowed={errorToken !== ""} dropMassege={() => dispatch(clearErroMassageToken())} messegeType={MasssgeType.Error}>{errorToken}</NotificationModalWindow>
    </div>
  );
}

export default AppContent;
