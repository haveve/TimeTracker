import {useEffect, useState} from 'react';
import type {Login} from '../Models/ViewModels';
import {Button, Card, Table, Form, Row} from "react-bootstrap";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";
import {ajaxForLogin, getCookie, getQueryObserver, setCookie, setCookieParamas} from "../Api/login-logout";
import {Error} from '../../Components/Service/Error';
import {useDispatch} from 'react-redux';
import {setLoginByToken} from '../../Redux/Slices/TokenSlicer';
import {useTranslation} from "react-i18next";
import {changeLanguage, getLanguageFromCookie, lngs} from "../../i18n";

export default function Login() {

  const {t, i18n} = useTranslation();


  const navigate = useNavigate();
  const initialValues: Login = {password: "", loginOrEmail: ""};
  const [WrongMessage, setWrongMessage] = useState("");

  const [loginOrEmail, setLoginOrEmail] = useState('');
  const [password, setPassword] = useState('');


  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch()

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
    }, navigate, "/",t))
  }

	useEffect(() => {
		getLanguageFromCookie(i18n);
	}, []);
  return (
      <div className="div-login-form container-fluid p-0 h-100 d-flex  justify-content-center">
        <div className='d-flex flex-column mt-5'>
          <h5 className='text-center'>{t("Login.header")}</h5>
          <Card style={{width: '20rem'}} className='d-flex align-items-center flex-column justify-content-center'>
            <Card.Body className='p-3 w-100'>
              <Form className="d-flex align-items-start flex-column" onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}>
                <Form.Group className="mb-3 w-100">
                  <Form.Label>{t("Login.username")}</Form.Label>
                  <Form.Control type="text" onChange={e => setLoginOrEmail(e.target.value)}/>
                </Form.Group>
                <Form.Group className="w-100 mb-4">
                  <Form.Label>{t("Login.password")}</Form.Label>
                  <Form.Control type="password" onChange={e => setPassword(e.target.value)}/>
                  <Error ErrorText={errorMessage} Show={showError}
                         SetShow={() => setShowError(false)}></Error>
                </Form.Group>
                <Button type="submit" className="btn-success w-100">{t("Login.submitButton")}</Button>
              </Form>
              <Row className="m-1">
                <Button onClick={()=>navigate("/RequestResetPassword")}
                variant="outline-info">{t("Login.resetPass")}</Button>
              </Row>
              <Row className="m-1">
                <div>{t("chooseLang")}:</div>
                {Object.keys(lngs).map((lng) => {
                  return (
                      <Button type="submit"
                              variant="outline-primary"
                              key={lng}
                              onClick={() => changeLanguage(lng,i18n)}
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
