import React,{useState} from 'react';
import * as Yup from 'yup';
import { Formik} from 'formik';
import type { Login } from '../Models/ViewModels';
import {Container, Nav, Navbar, NavDropdown, Button, Card, Table } from "react-bootstrap";
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
    <Card style={{ width: '18rem' }} className='w-50 d-flex align-items-center flex-column m-5'>
        <Card.Body>
      <div className="div-title">
        <p className="title">
          <span className="title-greeting">Hello dear employer!</span>
          <br />
          <span className="title-other-inf">
            There's auth form for time tracker. Please, Sign In.
          </span>
        </p>
      </div>
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
        <form className="d-flex align-items-center flex-column" onSubmit={(e)=>{
          e.preventDefault();
          formik.handleSubmit(e);
          }}>
          <p>
            <input
              type="text"
              placeholder="Enter login or email"
              className="form-input"
              {...formik.getFieldProps('LoginOrEmail')}
            />
          </p>
          {formik.touched.LoginOrEmail && formik.errors.LoginOrEmail ? (
              <p className='error'>{formik.errors.LoginOrEmail}</p>
            ) : null}
          <p>
            <input
              type="text"
              placeholder="Enter password"
              className="form-input"
              {...formik.getFieldProps('Password')}
            />
          </p>
          {formik.touched.Password && formik.errors.Password ? (
              <p className='error'>{formik.errors.Password}</p>
            ) : null}
          <p>
            <Button type="submit" className="btn-beige">
              Sign in
            </Button>
          </p>
          {WrongMessage != "" ? (
              <p className='error'>{WrongMessage}</p>
            ) : null}
        </form >
      )}
      </Formik>
      </Card.Body>
    </Card>
    </div>
  );
}
