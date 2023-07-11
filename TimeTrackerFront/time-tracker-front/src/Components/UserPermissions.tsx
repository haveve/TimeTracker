import React, { useEffect, useState } from 'react';
import { InputGroup, Form, Button, Card, Modal } from "react-bootstrap";
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import '../Custom.css';
import { getUsers, updateUserPermissions } from '../Redux/epics';
import { Permissions } from '../Redux/Types/Permissions';
import { RequestUserPermissions } from '../Redux/Requests/UserRequests';


function UserPermissions() {
    const { userId = "" } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState({} as Permissions)


    useEffect(() => {
        RequestUserPermissions(parseInt(userId)).subscribe((x) => {
            setPermissions(x);
        })
    }, []);

    const [cRUDUsers, setCRUDUsers] = useState(false)
    const [editPermiters, setEditPermiters] = useState(false)
    const [viewUsers, setViewUsers] = useState(false)
    const [editWorkHours, setEditWorkHours] = useState(false)
    const [importExcel, setImportExcel] = useState(false)
    const [controlPresence, setControlPresence] = useState(false)
    const [controlDayOffs, setControlDayOffs] = useState(false)

    useEffect(() => {
        setCRUDUsers(permissions.cRUDUsers)
        setEditPermiters(permissions.editPermiters)
        setViewUsers(permissions.viewUsers)
        setEditWorkHours(permissions.editWorkHours)
        setImportExcel(permissions.importExcel)
        setControlPresence(permissions.controlPresence)
        setControlDayOffs(permissions.controlDayOffs)
    }, [permissions]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const Permissions: Permissions = {
            id: parseInt(userId),
            cRUDUsers: cRUDUsers,
            editPermiters: editPermiters,
            viewUsers: viewUsers,
            editWorkHours: editWorkHours,
            importExcel: importExcel,
            controlPresence: controlPresence,
            controlDayOffs: controlDayOffs
        }
        dispatch(updateUserPermissions(Permissions))
        navigate("/Users/" + userId)
    }
    return (
        permissions! ? (
            <Modal
                show={true}
                backdrop="static"
                keyboard={false}
                centered
                data-bs-theme="dark"
                onHide={() => navigate("/Users/" + userId)}
            >

                <Form onSubmit={(e) => handleSubmit(e)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Permissions</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
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
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={(e) => { e.preventDefault(); navigate("/Users/" + userId) }}>Cancel</Button>
                        <Button variant="success" type="submit">Update</Button>
                    </Modal.Footer>
                </Form>
            </Modal>)
            : (
                <p>User not found</p>
            )
    )
}

export default UserPermissions;