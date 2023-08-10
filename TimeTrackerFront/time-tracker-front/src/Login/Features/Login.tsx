import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import type { Login } from '../Models/ViewModels';
import { Container, Nav, Navbar, NavDropdown, Button, Card, Table, Form } from "react-bootstrap";
import {
  useNavigate,
} from "react-router-dom";
import { ajaxForLogin, getQueryObserver } from "../Api/login-logout";
import { Error } from '../../Components/Error';
import { useDispatch } from 'react-redux';
import { setLoginByToken } from '../../Redux/Slices/TokenSlicer';

export default function Login() {

  const navigate = useNavigate();
  const initialValues: Login = { password: "", loginOrEmail: "" };
  const [WrongMessage, setWrongMessage] = useState("");

  const [loginOrEmail, setLoginOrEmail] = useState('');
  const [password, setPassword] = useState('');


  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch()

  const handleSubmit = () => {
    if (!loginOrEmail || !password) { setShowError(true); setErrorMessage("Fill all fields"); return; }
    ajaxForLogin({ "login": { loginOrEmail, password } }).subscribe(getQueryObserver(setErrorMessage, setShowError,()=>{
      dispatch(setLoginByToken())
    }, navigate, "/"))
  }
  return (
    <div className="div-login-form container-fluid p-0 h-100 d-flex  justify-content-center">
      <div className='d-flex flex-column mt-5'>
        <h5 className='text-center'>Sign in to TimeTracker</h5>
        <Card style={{ width: '18rem' }} className='d-flex align-items-center flex-column justify-content-center'>
          <Card.Body className='p-3 w-100'>
            <Form className="d-flex align-items-start flex-column" onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}>
              <Form.Group className="mb-3 w-100">
                <Form.Label>Username or email adress</Form.Label>
                <Form.Control type="text" onChange={e => setLoginOrEmail(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3 w-100">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" onChange={e => setPassword(e.target.value)} />
                <Error ErrorText={errorMessage} Show={showError} SetShow={() => setShowError(false)}></Error>
              </Form.Group>
              <Button type="submit" className="btn-success w-100">Sign in</Button>
            </Form >
            <a href="/RequestResetPassword">Reset via login or email</a>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
