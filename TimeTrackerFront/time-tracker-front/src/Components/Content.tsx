import '../Custom.css';
import Login from '../Login/Features/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Userslist from './UsersList';
import AppNavbar from './Navbar';
import UserDetails from './UserDetails';
import CreateUser from './CreateUser';

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
        path: "/CreateUser",
        element: <CreateUser />
      }
    ]
  }
])


function AppContent() {
  return (
    <div className='Content'>
      <RouterProvider router={router}/>
    </div>
  );
}

export default AppContent;
