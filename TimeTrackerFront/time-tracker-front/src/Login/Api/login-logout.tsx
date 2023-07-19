import { ajax } from 'rxjs/ajax';
import { map, catchError, Observer } from 'rxjs';
import {
  redirect,
  useNavigate,
} from "react-router-dom";
import { User } from '../../Redux/Types/User';

const url = "https://localhost:7226/graphql-login";

export function ajaxForLoginLogout(variables: {}) {
  return ajax({
    url: url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query:`query($login:LoginInputType!){
        login(login:$login){
          access_token
          user_id
        }
      }`,
      variables
    }),
    withCredentials: true,
  }).pipe(
    map((value): void => {

      let fullResponse = value.response as { data:{login:{access_token: string, user_id: string}} }
      let response = fullResponse.data.login;
      if ((200 > value.status && value.status > 300) || !response || !response.access_token)
        throw "status error";

      setCookie({ name: "access_token", value: response.access_token, expires_second: 365 * 24 * 60 * 60, path: "/" });
      setCookie({ name: "user_id", value: response.user_id, expires_second: 365 * 24 * 60 * 60, path: "/" });
    }),
    catchError((error) => {
      throw error
    })
  );
}

type navigateType = ReturnType<typeof useNavigate>;

export const getQueryObserver = (setError: (value: string) => void, commitNavigate: navigateType, path: string): Observer<any> => {
  return {
    next: () => {
      commitNavigate(path);
    },
    error: (value) => { setError("uncorrect data"); console.log(JSON.stringify(value)); },
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
  const token = getCookie("access_token");
  if (!token && !isLoginRedirect) {
    return redirect("/Login");
  }
  else if (isLoginRedirect && token)
    return redirect("/");

  return token;
}

type setCookieParamas = { name: string, value: string, expires_second?: number, path?: string, domain?: string, secure?: boolean }