import React, { useEffect } from 'react';
import { Form, Button, Card, InputGroup } from "react-bootstrap";
import { useParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import '../Custom.css';

function CreateUser() {
    return (
        <div className="div-login-form d-flex align-items-center flex-column m-1'">
            <h5 className=''>Create user</h5>
            <Card style={{ width: '18rem' }} className='d-flex align-items-center flex-column'>
                <Card.Body className='p-3 w-100'>
                    <Form className="d-flex align-items-start flex-column">
                        <p className='m-0'>User email adress</p>
                        <Form.Control
                            type="text"
                            className="w-100 mb-3"
                        />
                        <p className='m-0'>Work hours</p>
                        <InputGroup className="mb-3 w-50">
                            <InputGroup.Text>%</InputGroup.Text>
                            <Form.Control />
                        </InputGroup>
                        <p className='m-0'>Permissions</p>
                        <InputGroup className="mb-3 d-flex flex-column">
                            <Form.Check
                                type="switch"
                                id="custom-switch"
                                label="View users"
                            />
                            <Form.Check
                                type="switch"
                                id="custom-switch"
                                label="Import excell"
                            />
                            <Form.Check
                                type="switch"
                                id="custom-switch"
                                label="Manage users"
                            />
                            <Form.Check
                                type="switch"
                                id="custom-switch"
                                label="Manage permiters"
                            />
                            <Form.Check
                                type="switch"
                                id="custom-switch"
                                label="Manage work hours"
                            />
                            <Form.Check
                                type="switch"
                                id="custom-switch"
                                label="Manage presence"
                            />
                            <Form.Check
                                type="switch"
                                id="custom-switch"
                                label="Manage day offs"
                            />
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

export default CreateUser;
