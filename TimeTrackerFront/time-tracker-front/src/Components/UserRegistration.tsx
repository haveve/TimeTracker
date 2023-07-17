import React, { useEffect, useState } from 'react';
import { Form, Button, Card, InputGroup } from "react-bootstrap";
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import '../Custom.css';
import { User } from '../Redux/Types/User';
import { RequestCreateUser, RequestRegisterUserByCode } from '../Redux/Requests/UserRequests';

function UserRegistration() {
    const [searchParams] = useSearchParams();
    const [id, setId] = useState(0);
    const [login, setLogin] = useState('');
    const [fullName, setFullName] = useState('');
    const [Password, setPassword] = useState('');
    const [PasswordRepeat, setPasswordRepeat] = useState('');

    const HandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let temp = searchParams.get("code");
            const code: string = temp !== null ? temp : "";

            temp = searchParams.get("email");
            let email: string = temp !== null ? temp : "";
        if(Password !== PasswordRepeat) return;
        RequestRegisterUserByCode(Password, login, fullName, code, email).subscribe(x => console.log(x));
    }

    return (
        <div className="div-login-form d-flex align-items-center flex-column">
            <h5 className='mt-5'>Register to TimeTracker</h5>
            <Card style={{ width: '18rem' }} className='d-flex align-items-center flex-column'>
                <Card.Body className='p-3 w-100'>
                    <Form className="d-flex align-items-start flex-column" onSubmit={e => HandleSubmit(e)}>
                        <InputGroup className="mb-3 d-flex flex-column">
                            <Form.Group className="mb-1">
                                <Form.Label>Login</Form.Label>
                                <Form.Control type="text" onChange={e => setLogin(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-1">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control type="text" onChange={e => setFullName(e.target.value)} />
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
                    </Form >
                </Card.Body>
            </Card>
        </div>
    );
}

export default UserRegistration;
