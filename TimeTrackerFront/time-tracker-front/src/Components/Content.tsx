import {useEffect} from 'react';
import Userslist from './UsersList';
import { Route, Routes } from 'react-router';
import type {RootState} from "../Redux/store";
import UserDetails from './UserDetails';
import { useSelector, useDispatch  } from 'react-redux';
import '../Custom.css';
import { getUsers } from '../Redux/epics';
import Login from '../Login/Features/Login';


function AppContent() {
  return (
    <div className='Content'>
      <Routes>
        <Route path='/Login' element={<Login />}></Route>
        <Route path='/Users' element={<Userslist />}></Route>
        <Route path="/users/:userId" element={<UserDetails />} />
      </Routes>
    </div>
  );
}

export default AppContent;
