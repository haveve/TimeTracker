import React, { useEffect, useState } from 'react';
import { Form, Button, Card, InputGroup } from "react-bootstrap";
import { useParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import '../Custom.css';
import { User } from '../Redux/Types/User';
import { RequestCreateUser } from '../Redux/Requests/UserRequests';

function CreateUser() {
    const [email, setEmail] = useState("")
    const [cRUDUsers, setCRUDUsers] = useState(false)
    const [editPermiters, setEditPermiters] = useState(false)
    const [viewUsers, setViewUsers] = useState(false)
    const [editWorkHours, setEditWorkHours] = useState(false)
    const [importExcel, setImportExcel] = useState(false)
    const [controlPresence, setControlPresence] = useState(false)
    const [controlDayOffs, setControlDayOffs] = useState(false)

    const HandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user : User = {
            login: "login",
            password: "password",
            fullName: "fullname",
            email: email,
            cRUDUsers: cRUDUsers,
            editPermiters: editPermiters,
            viewUsers: viewUsers,
            editWorkHours: editWorkHours,
            importExcel: importExcel,
            controlPresence: controlPresence,
            controlDayOffs: controlDayOffs
        }
        RequestCreateUser(user).subscribe()
    }

    return (
        <div className="div-login-form d-flex align-items-center flex-column m-1 p-3">
            <h5 className=''>Create user</h5>
            <Card style={{ width: '18rem' }} className='d-flex align-items-center flex-column'>
                <Card.Body className='p-3 w-100'>
                    <Form className="d-flex align-items-start flex-column" onSubmit={e => HandleSubmit(e)}>
                        <p className='m-0'>User email adress</p>
                        <Form.Control
                            type="email"
                            className="w-100 mb-3"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {/* <p className='m-0'>Work hours</p>
                        <InputGroup className="mb-3 w-50">
                            <InputGroup.Text>%</InputGroup.Text>
                            <Form.Control />
                        </InputGroup> */}
                        <p className='m-0'>Permissions</p>
                        <InputGroup className="mb-3 d-flex flex-column">
                            <Form.Check
                                type="switch"
                                id="custom-switch-1"
                                label="View users"
                                checked={viewUsers}
                                onClick={() => { setViewUsers(!viewUsers); }}
                            />
                            <Form.Check
                                type="switch"
                                id="custom-switch-2"
                                label="Import excell"
                                checked={importExcel}
                                onClick={() => { setImportExcel(!importExcel) }}
                            />
                            <Form.Check
                                type="switch"
                                id="custom-switch-3"
                                label="Manage users"
                                checked={cRUDUsers}
                                onClick={() => { setCRUDUsers(!cRUDUsers) }}
                            />
                            <Form.Check
                                type="switch"
                                id="custom-switch-4"
                                label="Manage permiters"
                                checked={editPermiters}
                                onClick={() => { setEditPermiters(!editPermiters) }}
                            />
                            <Form.Check
                                type="switch"
                                id="custom-switch-5"
                                label="Manage work hours"
                                checked={editWorkHours}
                                onClick={() => { setEditWorkHours(!editWorkHours) }}
                            />
                            <Form.Check
                                type="switch"
                                id="custom-switch-6"
                                label="Manage presence"
                                checked={controlPresence}
                                onClick={() => { setControlPresence(!controlPresence) }}
                            />
                            <Form.Check
                                type="switch"
                                id="custom-switch-7"
                                label="Manage day offs"
                                checked={controlDayOffs}
                                onClick={() => { setControlDayOffs(!controlDayOffs) }}
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
