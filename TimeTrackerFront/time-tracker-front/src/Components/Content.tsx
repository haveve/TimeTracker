import '../Custom.css';
import React, { useEffect, useState } from 'react';
import Login from '../Login/Features/Login';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import ResetPassword from './ResetPassword';
import Userslist from './UsersList';
import AppNavbar from './Navbar';
import UserDetails from './UserDetails';
import CreateUser from './CreateUser';
import UserPermissions from './UserPermissions';
import UserProfile from './UserProfile';
import { getTokenOrNavigate } from '../Login/Api/login-logout';
import TimeStatistic from "./TimeStatistic"
import RequestResetPassword from "./RequestResetPassword";
import UserRegistration from './UserRegistration';
import Calendar from './Calendar';
import ApproversSetup from "./ApproversSetup";

const router = createBrowserRouter([
  {
    element: <AppNavbar />,
    loader: async () => getTokenOrNavigate(),
    children: [
      {
        path: "/",
        element: <TimeStatistic />
      },
      {
        path: "/Users",
        element: <Userslist />
      },
      {
        path: "/Users/:userId",
        element: <UserDetails />
      },
      {
        path: "/UserPermissions/:userId",
        element: <UserPermissions />
      },
      {
        path: "/CreateUser",
        element: <CreateUser />
      },
      {
        path: "/User/:login",
        element: <UserProfile />
      },
      {
        path:"/Calendar",
        element:<Calendar/>
      },
      {
        path: "/ApproversSetup",
        element: <ApproversSetup/>
      }
    ]
  },
  {
    path: "/Login",
    element: <Login />,
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
  return (
    <div className='Content container-fluid p-0 h-100'>
      <RouterProvider router={router} />
    </div>
  );
}

export default AppContent;
