import { Button, Card, Form, FormText } from "react-bootstrap";
import React, { FormEvent, useState } from "react";
import { RequestPasswordReset } from "../../Redux/Requests/UserRequests";
import {useTranslation} from "react-i18next";
import {Error} from "../Service/Error";

function RequestResetPassword() {

    const {t,i18n}=useTranslation();

    const [loginOrEmail, setLoginOrEmail] = useState("");
    const [isSubmited, setIsSubmited] = useState(false);

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const onTextChange = (e: React.ChangeEvent<any>) => {
        setLoginOrEmail(e.target.value);
    }
    const onSubmitHandler = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(!loginOrEmail){
            setShowError(true);
            setErrorMessage(t("RequestResetPassword.fillFieldsError"));
            return;
        }
        RequestPasswordReset(loginOrEmail).subscribe((x) => { });
        setIsSubmited(true);
    }
    return (
        <>
            <div className="div-login-form container-fluid p-0 h-100 d-flex  justify-content-center">
                <div className='d-flex flex-column mt-5'>
                    <h5 className='text-center'>{t("RequestResetPassword.header")}</h5>
                    <Card style={{ width: '18rem' }} className='d-flex align-items-center flex-column'>
                        <Card.Body className='p-3 w-100'>
                            <Form className="d-flex align-items-start flex-column"
                                onSubmit={(event) => onSubmitHandler(event)}>
                                <p className='m-0'>{t("RequestResetPassword.credentials")}</p>
                                <Form.Control
                                    type="text"
                                    className="w-100 mb-3"
                                    onChange={onTextChange}
                                />
                                <Error ErrorText={errorMessage} Show={showError}
                                       SetShow={() => setShowError(false)}></Error>
                                <Button
                                    type="submit"
                                    className="btn-success w-100"
                                >
                                    {t("RequestResetPassword.submitButton")}
                                </Button>
                            </Form>
                            {isSubmited ? <FormText>{t("RequestResetPassword.submittedText")}</FormText> : <></>}
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    )
}
export default RequestResetPassword;