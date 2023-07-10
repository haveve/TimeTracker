import '../Custom.css';
import React, { useEffect, useState } from 'react';
import Login from '../Login/Features/Login';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Userslist from './UsersList';
import AppNavbar from './Navbar';
import UserDetails from './UserDetails';
import CreateUser from './CreateUser';
import UserPermissions from './UserPermissions';
import UserProfile from './UserProfile';
import { getTokenOrNavigate } from '../Login/Api/login-logout';
import TimeStatistic from "./TimeStatistic"
const router = createBrowserRouter([
  {
    element: <AppNavbar />,
    loader:async()=>getTokenOrNavigate(),
    children: [
      {
        path: "/",
        element: <TimeStatistic/>
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
      }
    ]
  },
  {
    path: "/Login",
    element: <Login />,
    loader:async()=>getTokenOrNavigate(true),
  }
])


function AppContent() {

  return (
    <div className='Content'>
      <RouterProvider router={router} />
    </div>
  );
}

export default AppContent;
