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
import {useSelector} from 'react-redux';
import {RootState} from '../Redux/store';
import PermissionError from './PermissionError';
import {RequestCurrentUser} from '../Redux/Requests/UserRequests';
import {User} from '../Redux/Types/User';
import { Permissions } from '../Redux/Types/Permissions';

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
  return null;
}
const router = (permissions: Permissions) => createBrowserRouter([
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
  let permissions = useSelector((state: RootState) => state.currentUser.Permissions);

  return (
    <div className='Content container-fluid p-0 h-100'>
      <RouterProvider router={router(permissions)}/>
    </div>
  );
}

export default AppContent;
