import "../Custom.css";
import { Error } from "./Error";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, Card, Form, FormText, InputGroup } from "react-bootstrap";
import React, { ChangeEvent, ChangeEventHandler, FormEvent, useState } from "react";
import { ErrorMassagePattern } from "../Redux/epics";
import { RequestUpdatePasswordByCode } from "../Redux/Requests/UserRequests";


function ResetPassword() {
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
            setErrorText("Both passwords should match!");
            setShowPassError(true);
        }
        else if (firstPass.length < 8 && firstPass.length > 20) {
            setErrorText("Path length must be between 8 and 50!");
            setShowPassError(true);
        }
        else {
            // submit changes
            let temp = searchParams.get("code");
            const code: string = temp !== null ? temp : "";

            temp = searchParams.get("email");
            let email: string = temp !== null ? temp : "";

            RequestUpdatePasswordByCode(firstPass, code, email).subscribe((x) => {
                //console.log("x = "+ x);
                setInfoText(x);
                setFormSent(true);
            })
        }
    }

    return (
        <>
            <div className="div-login-form container-fluid p-0 h-100 d-flex  justify-content-center">
                <div className='d-flex flex-column mt-5'>
                    <h5 className='text-center'>Reset password</h5>
                    <Card style={{ width: '18rem' }} className='d-flex align-items-center flex-column'>
                        <Card.Body className='p-3 w-100'>
                            <Form className="d-flex align-items-start flex-column"
                                onSubmit={(event) => onSubmitHandler(event)}>

                                {!formSent ?
                                    <>
                                        <p className='m-0'>New password</p>
                                        <Form.Control
                                            type="password"
                                            className="w-100 mb-3"
                                            onChange={onFirstPassChange}
                                        />
                                        <p className='m-0'>Repeat new password</p>
                                        <Form.Control
                                            type="password"
                                            className="w-100 mb-3"
                                            onChange={onSecondPassChange}

                                        />
                                        <Error ErrorText={ErrorText} Show={showPassError} SetShow={() => setShowPassError(false)} />
                                        <Button
                                            type="submit"
                                            className="btn-success w-100"
                                        >
                                            Reset password
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
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    )
}

export default ResetPassword;