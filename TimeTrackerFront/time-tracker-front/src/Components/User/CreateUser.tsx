import React, { useEffect, useState } from 'react';
import { Form, Button, Card, InputGroup } from "react-bootstrap";
import { useParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../Redux/store";
import '../../Custom.css';
import { User } from '../../Redux/Types/User';
import { RequestCreateUser } from '../../Redux/Requests/UserRequests';
import { Error } from '../Service/Error';
import { Permissions } from '../../Redux/Types/Permissions';

function CreateUser() {
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [workHours, setWorkHours] = useState(100)
    const [cRUDUsers, setCRUDUsers] = useState(false)
    const [editApprovers, setEditApprovers] = useState(false)
    const [viewUsers, setViewUsers] = useState(false)
    const [editWorkHours, setEditWorkHours] = useState(false)
    const [exportExcel, setExportExcel] = useState(false)
    const [controlPresence, setControlPresence] = useState(false)
    const [controlDayOffs, setControlDayOffs] = useState(false)

    const HandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (email === "" || fullName === "") { setShowError(true); setErrorMessage("Fill all fields"); return; }
        const user: User = {
            login: "login",
            password: "password",
            fullName: fullName,
            email: email,
            cRUDUsers: cRUDUsers,
            editApprovers: editApprovers,
            viewUsers: viewUsers,
            editWorkHours: editWorkHours,
            exportExcel: exportExcel,
            controlPresence: controlPresence,
            controlDayOffs: controlDayOffs,
            workHours: workHours
        }
        const permissions: Permissions = {
            userId: 0,
            cRUDUsers: cRUDUsers,
            editApprovers: editApprovers,
            viewUsers: viewUsers,
            editWorkHours: editWorkHours,
            exportExcel: exportExcel,
            controlPresence: controlPresence,
            controlDayOffs: controlDayOffs
        }
        RequestCreateUser(user, permissions).subscribe()
        setFullName("")
        setEmail("")
        setWorkHours(100)
        setCRUDUsers(false)
        setEditApprovers(false)
        setViewUsers(false)
        setEditWorkHours(false)
        setExportExcel(false)
        setControlPresence(false)
        setControlDayOffs(false)
    }

    return (
        <div className="div-login-form d-flex align-items-center flex-column m-1 p-3">
            <h5 className=''>Create user</h5>
            <Card style={{ width: '18rem' }} className='d-flex align-items-center flex-column'>
                <Card.Body className='p-3 w-100'>
                    <Form className="d-flex align-items-start flex-column" onSubmit={e => HandleSubmit(e)} id="createform">
                        <p className='m-0'>User full name</p>
                        <Form.Control
                            type="text"
                            className="w-100 mb-3"
                            onChange={(e) => setFullName(e.target.value)}
                            value={fullName}
                        />
                        <p className='m-0'>User email adress</p>
                        <Form.Control
                            type="email"
                            className="w-100 mb-3"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                        <p className='m-0'>Work hours</p>
                        <InputGroup className="mb-3 w-100">
                            <InputGroup.Text>%</InputGroup.Text>
                            <Form.Control type='number' min={1} max={100}
                                onChange={(e) => setWorkHours(parseInt(e.target.value))}
                                value={workHours}
                                />
                        </InputGroup>
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
                                label="Export excell"
                                checked={exportExcel}
                                onClick={() => { setExportExcel(!exportExcel) }}
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
                                label="Manage approvers"
                                checked={editApprovers}
                                onClick={() => { setEditApprovers(!editApprovers) }}
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
                        <Error ErrorText={errorMessage} Show={showError} SetShow={() => setShowError(false)}></Error>
                    </Form >
                </Card.Body>
            </Card>
        </div>
    );
}

export default CreateUser;
