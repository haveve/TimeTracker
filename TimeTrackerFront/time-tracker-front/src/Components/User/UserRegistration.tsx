import React, { useEffect, useState } from 'react';
import { Form, Button, Card, InputGroup } from "react-bootstrap";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../Redux/store";
import '../../Custom.css';
import { User } from '../../Redux/Types/User';
import { RequestCreateUser, RequestRegisterUserByCode } from '../../Redux/Requests/UserRequests';

import { Error } from '../Service/Error';

function UserRegistration() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [InfoText, setInfoText] = useState("");
    const [formSent, setFormSent] = useState(false);

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [id, setId] = useState(0);
    const [login, setLogin] = useState('');
    const [Password, setPassword] = useState('');
    const [PasswordRepeat, setPasswordRepeat] = useState('');

    const HandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(login === ""){ setErrorMessage("Fill all fields"); setShowError(true); return;}
        if(Password.length < 8){ setErrorMessage("Password should be at least 8 characters"); setShowError(true); return;}
        if(Password !== PasswordRepeat){ setErrorMessage("Type in same passwords"); setShowError(true); return;}
        let temp = searchParams.get("code");
        const code: string = temp !== null ? temp : "";

        temp = searchParams.get("email");
        let email: string = temp !== null ? temp : "";
        if (Password !== PasswordRepeat) return;
        RequestRegisterUserByCode(Password, login, code, email).subscribe(x => {
            setInfoText(x);
            setFormSent(true);
        });
    }

    return (
        <div className="div-login-form d-flex align-items-center flex-column">
            <h5 className='mt-5'>Register to TimeTracker</h5>
            <Card style={{ width: '18rem' }} className='d-flex align-items-center flex-column'>
                <Card.Body className='p-3 w-100'>
                    <Form className="d-flex align-items-start flex-column" onSubmit={e => HandleSubmit(e)}>

                        {!formSent ?
                            <>
                                <InputGroup className="mb-3 d-flex flex-column">
                                    <Form.Group className="mb-1">
                                        <Form.Label>Login</Form.Label>
                                        <Form.Control type="text" onChange={e => setLogin(e.target.value)} />
                                    </Form.Group>
                                    <Form.Group className="mb-1">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" onChange={e => setPassword(e.target.value)} />
                                    </Form.Group>
                                    <Form.Group className="mb-1">
                                        <Form.Label>Repeat password</Form.Label>
                                        <Form.Control type="password" onChange={e => setPasswordRepeat(e.target.value)} />
                                    </Form.Group>
                                </InputGroup>
                                <Button type="submit" className="btn-success w-100">
                                    Send email
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
                        <Error ErrorText={errorMessage} Show={showError} SetShow={() => setShowError(false)}></Error>
                    </Form >
                </Card.Body>
            </Card>
        </div>
    );
}

export default UserRegistration;
