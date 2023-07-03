import React,{useState} from 'react';
import * as Yup from 'yup';
import { Formik} from 'formik';
import type { Login } from '../Models/ViewModels';
import {Container, Nav, Navbar, NavDropdown, Button, Card, Table, Form } from "react-bootstrap";
import {
  useNavigate,
} from "react-router-dom";
import {ajaxForLoginLogout,getQueryObserver} from "../Api/login-logout";

export default function Login() {

  const navigate = useNavigate();
  const initialValues: Login = { Password: "", LoginOrEmail: "" };
  const [WrongMessage, setWrongMessage] = useState("");

return (
    <div className="div-login-form d-flex align-items-center flex-column m-1'">
    <h5 className=''>Sign in to TimeTracker</h5>
    <Card style={{ width: '18rem' }} className='d-flex align-items-center flex-column'>
        <Card.Body className='p-3 w-100'>
          <Formik
            validationSchema={Yup.object({
              Password: Yup.string()
                .required('Required')
                .min(8, "Password must have min 8 symbols")
                .max(20, "Password must have max 20 symbols"),
              LoginOrEmail: Yup.string().required('Required')
            })}
            initialValues={initialValues}
            onSubmit={(value: Login, action) => {
              ajaxForLoginLogout("Login",value).subscribe(getQueryObserver(setWrongMessage,navigate,"/"))
              action.setSubmitting(false);
            }
            }
          >{formik => (
            <Form className="d-flex align-items-start flex-column" onSubmit={(e)=>{
              e.preventDefault();
              formik.handleSubmit(e);
              }}>
                <p className='m-0'>Username or email adress</p>
                <input
                  type="text"
                  className="w-100 mb-3"
                  {...formik.getFieldProps('LoginOrEmail')}
                />
              {formik.touched.LoginOrEmail && formik.errors.LoginOrEmail ? (
                  <p className='error'>{formik.errors.LoginOrEmail}</p>
                ) : null}
                <p className='m-0'>Password</p>
                <input
                  type="text"
                  className="w-100 mb-3"
                  {...formik.getFieldProps('Password')}
                />
              {formik.touched.Password && formik.errors.Password ? (
                  <p className='error'>{formik.errors.Password}</p>
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
      </Card.Body>
    </Card>
    </div>
  );
}
