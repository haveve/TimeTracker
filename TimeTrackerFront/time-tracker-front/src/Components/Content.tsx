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

const router = createBrowserRouter([
  {
    element: <AppNavbar />,
    children: [
      {
        path: "/",
        element: <p>Page not found</p>
      },
      {
        path: "/Users",
        element: <Userslist />
      },
      {
        path: "/Login",
        element: <Login />
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
