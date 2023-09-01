import "../../Custom.css";
import {Error} from "../Service/Error";
import {useSearchParams, useNavigate} from "react-router-dom";
import {Button, Card, Form, FormText, InputGroup} from "react-bootstrap";
import React, {ChangeEvent, ChangeEventHandler, FormEvent, useState} from "react";
import {ErrorMassagePattern} from "../../Redux/epics";
import {RequestUpdatePasswordByCode} from "../../Redux/Requests/UserRequests";
import {useTranslation} from "react-i18next";
import {lngs} from "../../i18n";


function ResetPassword() {
  const {t, i18n}=useTranslation();
  const [formSent, setFormSent] = useState(false);
  const [searchParams] = useSearchParams();
  const [firstPass, setFirstPass] = useState("");
  const [secondPass, setSecondPass] = useState("");
  const [showPassError, setShowPassError] = useState(false);
  const [ErrorText, setErrorText] = useState("")

  const [InfoText, setInfoText] = useState("");


  const navigate = useNavigate();

  const onFirstPassChange = (e: React.ChangeEvent<any>) => {
    setShowPassError(false);
    setFirstPass(e.target.value);
  }

  const onSecondPassChange = (e: React.ChangeEvent<any>) => {
    setShowPassError(false);
    setSecondPass(e.target.value);
  }

  const onSubmitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (firstPass !== secondPass) {
      setErrorText(t("ResetPassword.passMatchError"));
      setShowPassError(true);
    } else if (firstPass.length < 8 || firstPass.length > 20) {
      setErrorText(t("ResetPassword.passValidationError"));
      setShowPassError(true);
    } else {
      // submit changes
      let temp = searchParams.get("code");
      const code: string = temp !== null ? temp : "";

      temp = searchParams.get("email");
      let email: string = temp !== null ? temp : "";

      RequestUpdatePasswordByCode(firstPass, code, email).subscribe((x) => {
        //console.log("x = "+ x);
	      let response : string = x;
        switch (x){
          case "User not found": response = t("ResetPassword.Responses.userNotFoundError"); break;
          case "User was not requesting password change": response = t("ResetPassword.Responses.noRequestError"); break;
          case "Reset code not match": response = t("ResetPassword.Responses.noMatchCodeError"); break;
          case "Password reseted successfully": response = t("ResetPassword.Responses.successful"); break;
        }
	      setInfoText(response);
        setFormSent(true);
      })
    }
  }

  return (
      <>
        <div className="div-login-form container-fluid p-0 h-100 d-flex  justify-content-center">
          <div className='d-flex flex-column mt-5'>
            <h5 className='text-center'>{t("ResetPassword.header")}</h5>
            <Card style={{width: '18rem'}} className='d-flex align-items-center flex-column'>
              <Card.Body className='p-3 w-100'>
                <Form className="d-flex align-items-start flex-column"
                      onSubmit={(event) => onSubmitHandler(event)}>

                  {!formSent ?
                      <>
                        <p className='m-0'>{t("ResetPassword.password")}</p>
                        <Form.Control
                            type="password"
                            className="w-100 mb-3"
                            onChange={onFirstPassChange}
                        />
                        <p className='m-0'>{t("ResetPassword.repeatPassword")}</p>
                        <Form.Control
                            type="password"
                            className="w-100 mb-3"
                            onChange={onSecondPassChange}

                        />
                        <Error ErrorText={ErrorText} Show={showPassError} SetShow={() => setShowPassError(false)}/>
                        <Button
                            type="submit"
                            className="btn-success w-100"
                        >
                          {t("ResetPassword.submitButton")}
                        </Button>
                      </>
                      :
                      <Button
                          onClick={() => navigate("/Login")}
                          className="btn-success w-100"
                      >
                        Login
                      </Button>
                  }
                  {InfoText !== "" ? <Form.Text>{InfoText}</Form.Text> : <></>}
                </Form>
                <div>{t("chooseLang")}:</div>
                {Object.keys(lngs).map((lng) => {
                  return (
                      <Button type="submit"
                              variant="outline-primary"
                              key={lng}
                              onClick={() => i18n.changeLanguage(lng)}
                              disabled={i18n.resolvedLanguage === lng}
                              className="w-25"
                      >
                        {lng}
                      </Button>)
                })}
              </Card.Body>
            </Card>
          </div>
        </div>
      </>
  )
}

export default ResetPassword;