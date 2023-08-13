import { ajax } from 'rxjs/ajax';
import { map, catchError, Observer } from 'rxjs';
import {
  redirect,
  useNavigate,
} from "react-router-dom";
import { User } from '../../Redux/Types/User';
import { Alert } from 'react-bootstrap';

export const accessTokenLiveTime = 60;

const url = "https://localhost:7226/graphql-login";
/*    "errors": [
        {
            "message": "User does not auth"
        }
    ],
    "data": {
        "refreshToken": {
            "refresh_token": "Your session was expired. Please, login again",
            "user_id": 0,
            "access_token": ""
        }
    }*/

export function isUnvalidTokenError(response: {
  "errors": [
    {
      "message": string
    }
  ],
  "data": {
    "refreshToken": {
      "refresh_token": string,
      "user_id": number,
      "access_token": string
    }
  }
}) {
  const errors = response.errors;
  if (errors && response.data.refreshToken) {
    return true;
  }
  return false;
}

export function ajaxForLogin(variables: {}) {
  return ajax({
    url: url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `query($login:LoginInputType!){
        login(login:$login){
          access_token
          user_id
          refresh_token
          is_fulltimer

        }
      }`,
      variables
    }),
    withCredentials: true,
  }).pipe(
    map((value): void => {


      let fullResponse = value.response as { data:{login:{access_token: string, user_id: string, is_fulltimer: string,refresh_token: string}}, errors: {message: string}[]}

      let response = fullResponse.data.login;
      if ((200 > value.status && value.status > 300) || !response || !response.access_token)
        throw fullResponse.errors[0].message;


      setCookie({ name: "access_token", value: response.access_token, expires_second: 7 * 24 * 60 * 60, path: "/" });
      setCookie({ name: "user_id", value: response.user_id, expires_second: 7 * 24 * 60 * 60, path: "/" });
      setCookie({ name: "refresh_token", value: response.refresh_token, expires_second: 7 * 24 * 60 * 60, path: "/" });
      setCookie({ name: "is_fulltimer", value: response.is_fulltimer, expires_second: 365 * 24 * 60 * 60, path: "/" });

    }),
    catchError((error) => {
      throw error
    })
  );
}

export function ajaxForRefresh(variables: {}) {
  return ajax({
    url: url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      access_token: getCookie("access_token"),
      refresh_token: getCookie("refresh_token"),
    },
    body: JSON.stringify({
      query: `query{
        refreshToken{
          refresh_token,
          user_id,
          access_token
        }
      }`,
      variables
    }),
    withCredentials: true,
  }).pipe(
    map((value): void => {

      let fullResponse = value.response as { data: { refreshToken: { refresh_token: string, access_token: string, user_id: string } }, errors: { message: string }[] }
      let response = fullResponse.data.refreshToken;

      if (isUnvalidTokenError(value.response as any)) {
        deleteCookie("refresh_token");
        deleteCookie("access_token");
        deleteCookie("user_id");
        deleteCookie("canUseUserIp");
        throw fullResponse.data.refreshToken.refresh_token;
      }

      if ((200 > value.status && value.status > 300) || !response)
        throw fullResponse.errors[0].message;

      setCookie({ name: "access_token", value: response.access_token, expires_second: 7 * 24 * 60 * 60, path: "/" });
      setCookie({ name: "user_id", value: response.user_id, expires_second: 7 * 24 * 60 * 60, path: "/" });
      setCookie({ name: "refresh_token", value: response.refresh_token, expires_second: 7 * 24 * 60 * 60, path: "/" });
    }),
    catchError((error) => {
      throw error
    })
  );
}

export function ajaxForLogout(token: string) {
  return ajax({
    url: url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      refresh_token: token,
    },
    body: JSON.stringify({
      query: `query{
        logout
      }`,
    }),
    withCredentials: true,
  }).pipe(
    map((res: any): void => {

      if (res.response.errors) {
        console.error(JSON.stringify(res.response.errors))
        throw "error"
      }

      return res;
    }),
    catchError((error) => {
      throw error
    })
  );
}


type navigateType = ReturnType<typeof useNavigate>;

export const getQueryObserver = (setError: (value: string) => void, setShowError: (value: boolean) => void,setLoginByToken:()=>void, commitNavigate: navigateType, path: string): Observer<any> => {
  return {
    next: () => {
      commitNavigate(path);
      setLoginByToken();
    },
    error: (value) => { value == "User was disabled" ? setError(value) : setError("Wrong login/email or password"); setShowError(true); },
    complete: () => { }
  }
}


export function getCookie(name: string) {
  name = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return decodeURIComponent(c.substring(name.length, c.length));
    }
  }
  return null;
}

export function setCookie(cookieParams: setCookieParamas) {
  let s = cookieParams.name + '=' + encodeURIComponent(cookieParams.value) + ';';
  if (cookieParams.expires_second) {
    let d = new Date();
    d.setTime(d.getTime() + cookieParams.expires_second * 1000);
    s += ' expires=' + d.toUTCString() + ';';
  }
  if (cookieParams.path) s += ' path=' + cookieParams.path + ';';
  if (cookieParams.domain) s += ' domain=' + cookieParams.domain + ';';
  if (cookieParams.secure) s += ' secure;';
  document.cookie = s;
}

export function deleteCookie(name: string) {
  document.cookie = name + '=; expires=' + Date();
}

export function getTokenOrNavigate(isLoginRedirect: boolean = false) {
  const token = getCookie("refresh_token");
  if (!token && !isLoginRedirect) {
    return redirect("/Login");
  }
  else if (isLoginRedirect && token)
    return redirect("/");

  return token;
}

type setCookieParamas = { name: string, value: string, expires_second?: number, path?: string, domain?: string, secure?: boolean }