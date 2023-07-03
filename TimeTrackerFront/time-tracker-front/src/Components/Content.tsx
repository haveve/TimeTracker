import '../Custom.css';
import Login from '../Login/Features/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Userslist from './UsersList';
import AppNavbar from './Navbar';

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
