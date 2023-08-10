import AppNavbar from './Components/Navbar';
import AppContent from './Components/Content';
import './Custom.css';
import React, { useEffect, useState } from 'react';
import { setErrorStatusAndError as setErroMassageToken, setSuccessStatus as setSuccessStatusToken, clearErroMassage as clearErroMassageToken, setloadingStatus as setloadingStatusToken } from './Redux/Slices/TokenSlicer';
import { accessTokenLiveTime, getCookie } from './Login/Api/login-logout';
import { timer } from 'rxjs';
import { useDispatch, useSelector } from 'react-redux';
import { ajaxForRefresh } from './Login/Api/login-logout';
import { Subscription } from 'rxjs';
import { RootState } from './Redux/store';
import { setLoginByToken } from './Redux/Slices/TokenSlicer';
import { setLogout } from './Redux/Slices/UserSlice';

function App() {

  const [refreshInterval, setRefreshInterval] = useState(new Subscription());
  const dispatch = useDispatch();
  const isLogin = useSelector((state: RootState) => state.users.isLogin)
  const refresh_token = getCookie("refresh_token")
  const loginByToken = useSelector((state:RootState)=>{
    return state.token.loginByToken
  })

  useEffect(() => {
    refreshInterval.unsubscribe();
    if (isLogin||refresh_token) {
      setRefreshInterval(timer(0, (accessTokenLiveTime - 5) * 1000).subscribe({
        next: () => {
          dispatch(setloadingStatusToken())
          ajaxForRefresh({}).subscribe({
            next: () => {              
              if(!loginByToken)
              dispatch(setLoginByToken())
              dispatch(setSuccessStatusToken())
            },
            error: (error: string) => {
              dispatch(setLoginByToken())
              refreshInterval.unsubscribe();
              dispatch(setLogout())
              dispatch(setErroMassageToken(error))
            }
          })
        }
      }))
    }
  }, [isLogin,loginByToken])


  return (
    <div className="App container-fluid p-0 h-100" data-bs-theme="dark">
      <AppContent />
    </div>
  );
}

export default App;
