import "../Custom.css";
import {useSearchParams} from "react-router-dom";
import {Button, Card, Form, InputGroup} from "react-bootstrap";
import React, {ChangeEvent, FormEvent, useState} from "react";


function ResetPassword() {

    const [searchParams] = useSearchParams();
    const [firstPass, setFirstPass] = useState("");
    const [secondPass, setSecondPass] = useState("");
    const [showPassError, setShowPassError] = useState(false);
    const onFirstPassChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setFirstPass(event.target.value);

    }
    const onSecondPassChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setFirstPass(event.target.value);
    }
    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log(event);


    }
    return (
        <>
            <div className="d-flex align-items-center flex-column m-1 ">
                <h5>Reset password</h5>

                <p>{searchParams.get("code")}</p>
                <p>{searchParams.get("email")}</p>
                <Card style={{width: '18rem'}} className='d-flex align-items-center flex-column'>
                    <Card.Body className='p-3 w-100'>
                        <Form className="d-flex align-items-start flex-column"
                              onSubmit={(event) => onSubmit(event)}>
                            <p className='m-0'>New password</p>
                            <Form.Control
                                type="password"
                                className="w-100 mb-3"
                                onChange={() => onFirstPassChange}
                            />
                            <p className='m-0'>Repeat new password</p>
                            <Form.Control
                                type="password"
                                className="w-100 mb-3"
                                onChange={() => onSecondPassChange}

                            />
                            <Button
                                type="submit"
                                className="btn-success w-100"
                            >
                                Reset password
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </>
    )
}

export default ResetPassword;