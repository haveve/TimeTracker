import React, { useEffect, useState } from 'react';
import type { Login } from '../Models/ViewModels';
import { Button, Card, Table, Form, Row,Col } from "react-bootstrap";
import {
  Navigate,
  useNavigate,
  useParams
} from "react-router-dom";
import { ajaxForLogin, ajaxForGoogleLogin, getQueryObserver, setCookie, setCookieParamas } from "../Api/login-logout";
import { Error } from '../../Components/Service/Error';
import { useDispatch } from 'react-redux';
import { setLoginByToken } from '../../Redux/Slices/TokenSlicer';
import { useTranslation } from "react-i18next";
import { changeLanguage, getLanguageFromCookie, lngs } from "../../i18n";

export default function Login() {


  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  const initialValues: Login = { password: "", loginOrEmail: "" };
  const [WrongMessage, setWrongMessage] = useState("");

  const [loginOrEmail, setLoginOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch()

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search)
    const token = queryParameters.get("token")
    const expiredAt = queryParameters.get("expiredAt")
    const issuedAt = queryParameters.get("issuedAt")
    if (token) {
      setCookie({
        name: "refresh_token",
        value: JSON.stringify({ token, issuedAt, expiredAt }),
        expires_second: new Date(expiredAt!).getTime() / 1000,
        path: "/"
      });
      navigate("/");
    }
  }, [])


  const handleSubmit = () => {
    if (!loginOrEmail || !password) {
      setShowError(true);
      setErrorMessage(t("Login.fillFieldsError"));
      return;
    }
    ajaxForLogin({
      "login": {
        loginOrEmail,
        password
      }
    }).subscribe(getQueryObserver(setErrorMessage, setShowError, () => {
      dispatch(setLoginByToken(true))
    }, navigate, "/", t))
  }

  useEffect(() => {
    getLanguageFromCookie(i18n);
  }, []);
  return (
    <div className="div-login-form container-fluid p-0 h-100 d-flex  justify-content-center">
      <div className='d-flex flex-column mt-5'>
        <h5 className='text-center'>{t("Login.header")}</h5>
        <Card style={{ width: '20rem' }} className='d-flex align-items-center flex-column justify-content-center'>
          <Card.Body className='p-3 w-100'>
            <Form className="d-flex align-items-start flex-column" onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}>
              <Form.Group className="mb-3 w-100">
                <Form.Label>{t("Login.username")}</Form.Label>
                <Form.Control type="text" onChange={e => setLoginOrEmail(e.target.value)} />
              </Form.Group>
              <Form.Group className="w-100 mb-4">
                <Form.Label>{t("Login.password")}</Form.Label>
                <Form.Control type="password" onChange={e => setPassword(e.target.value)} />
                <Error ErrorText={errorMessage} Show={showError}
                  SetShow={() => setShowError(false)}></Error>
              </Form.Group>
              <Button type="submit" className="btn-success w-100 mb-3">{t("Login.submitButton")}</Button>
            </Form>
            <Row className="m-1 mb-3">
              <Button onClick={() => navigate("/RequestResetPassword")}
                variant="outline-info">{t("Login.resetPass")}</Button>
            </Row>
            <Row className='mx-1 mb-3'>
              <Button variant='outline-secondary d-flex flex-row' onClick={() => ajaxForGoogleLogin()}><Col className='d-flex justify-content-center gap-2'><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
                <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
              </svg> <span>Google</span></Col></Button>
            </Row>
            <Row className="m-1">
              <div>{t("chooseLang")}:</div>
              {Object.keys(lngs).map((lng) => {
                return (
                  <Button type="submit"
                    variant="outline-primary"
                    key={lng}
                    onClick={() => changeLanguage(lng, i18n)}
                    disabled={i18n.resolvedLanguage === lng}
                    className="w-25"
                  >
                    {lng}
                  </Button>)
              })}
            </Row>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
