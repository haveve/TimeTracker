import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import type { Login } from '../Models/ViewModels';
import { Container, Nav, Navbar, NavDropdown, Button, Card, Table, Form } from "react-bootstrap";
import {
  useNavigate,
} from "react-router-dom";
import { ajaxForLoginLogout, getQueryObserver } from "../Api/login-logout";

export default function Login() {

  const navigate = useNavigate();
  const initialValues: Login = { password: "", loginOrEmail: "" };
  const [WrongMessage, setWrongMessage] = useState("");

  return (
    <div className="div-login-form container-fluid p-0 h-100 d-flex  justify-content-center">
      <div className='d-flex flex-column mt-5'>
        <h5 className='text-center'>Sign in to TimeTracker</h5>
        <Card style={{ width: '18rem' }} className='d-flex align-items-center flex-column justify-content-center'>
          <Card.Body className='p-3 w-100'>
            <Formik
              validationSchema={Yup.object({
                password: Yup.string()
                  .required('Required')
                  .min(8, "Password must have min 8 symbols")
                  .max(20, "Password must have max 20 symbols"),
                loginOrEmail: Yup.string().required('Required')
              })}
              initialValues={initialValues}
              onSubmit={(value: Login, action) => {
                ajaxForLoginLogout({ "login": value }).subscribe(getQueryObserver(setWrongMessage, navigate, "/"))
                action.setSubmitting(false);
              }
              }
            >{formik => (
              <Form className="d-flex align-items-start flex-column" onSubmit={(e) => {
                e.preventDefault();
                formik.handleSubmit(e);
              }}>
                <p className='m-0'>Username or email adress</p>
                <Form.Control
                  type="text"
                  className="w-100 mb-3"
                  {...formik.getFieldProps('loginOrEmail')}
                />
                {formik.touched.loginOrEmail && formik.errors.loginOrEmail ? (
                  <p className='error'>{formik.errors.loginOrEmail}</p>
                ) : null}
                <p className='m-0'>Password</p>
                <Form.Control
                  type="password"
                  className="w-100 mb-3"
                  {...formik.getFieldProps('password')}
                />
                {formik.touched.password && formik.errors.password ? (
                  <p className='error'>{formik.errors.password}</p>
                ) : null}
                <Button type="submit" className="btn-success w-100">
                  Sign in
                </Button>
                {WrongMessage != "" ? (
                  <p className='error'>{WrongMessage}</p>
                ) : null}
              </Form >
            )}
            </Formik>
            <a href="/RequestResetPassword">Reset via login or email</a>

          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
