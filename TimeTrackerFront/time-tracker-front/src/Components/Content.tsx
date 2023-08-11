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
import {useSelector} from 'react-redux';
import {RootState} from '../Redux/store';
import PermissionError from './PermissionError';
import {RequestCurrentUser} from '../Redux/Requests/UserRequests';
import {User} from '../Redux/Types/User';

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
  let user = useSelector((state: RootState) => state.currentUser.User);

  return (
    <div className='Content container-fluid p-0 h-100'>
      <RouterProvider router={router(user)}/>
    </div>
  );
}

export default AppContent;
