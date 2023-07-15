import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Modal } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { User } from '../Redux/Types/User';
import { RequestUpdateUser, RequestUpdatePassword } from '../Redux/Requests/UserRequests';
import { RootState } from '../Redux/store';
import { getUsers } from '../Redux/epics';
import '../Custom.css';


function UserProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showEdit, setShowEdit] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordsError, setShowPasswordsError] = useState(false);

    const handleCloseEdit = () => setShowEdit(false);
    const handleShowEdit = () => setShowEdit(true);

    const handleClosePassword = () => setShowPassword(false);
    const handleShowPassword = () => setShowPassword(true);

    let user  = useSelector((state: RootState) => state.currentUser.User);


    const [id, setId] = useState(0);
    const [login, setLogin] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');

    const [newPassword, setNewPassword] = useState('');
    const [newPasswordRepeat, setNewPasswordRepeat] = useState('');

    useEffect(() => {
        if (user) {
            setId(user.id!)
            setFullName(user.fullName!)
            setLogin(user.login!)
        }
    }, [])


    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const User: User = {
            id: id,
            login: login,
            fullName: fullName,
            password: password
        }
        RequestUpdateUser(User).subscribe((x) => {
            console.log(x);
            if (x === "User updated successfully") {
                setShowEdit(false);
                dispatch(getUsers());
                User.password = ""
                localStorage.setItem("User", JSON.stringify(User));
            }
            else {
                setShowError(true)
            }
        });
    }

    const handlePasswordUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (newPassword === newPasswordRepeat) {
            RequestUpdatePassword(id, newPassword, password).subscribe((x) => {
                console.log(x);
                if (x === "Password updated successfully") {
                    setShowPassword(false);
                    dispatch(getUsers());
                }
                else {
                    setShowError(true)
                }
            });
        }
        else{
            setShowPasswordsError(true)
        }
    }

    return (
        
        <div className='UserDetails d-flex align-items-center flex-column m-1'>
            <Button variant='dark' className='ms-2 me-auto' onClick={() => navigate(-1)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-90deg-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z" />
                </svg>
            </Button>
            {user! ? (
                <>
                    <Card style={{ width: '18rem' }} className='w-75'>
                        <Card.Body className='d-flex flex-column'>
                            <div>
                                <p className='m-0 fs-5'>{user.fullName}</p>
                                <p className="link-offset-2 link-underline link-underline-opacity-0 fs-6">@{user.login}</p>
                            </div>
                            <p className='mb-2'>Worker</p>
                            <div className='d-flex flex-column'>
                                <Button variant='outline-secondary w-25 mb-2' onClick={handleShowEdit}>Edit</Button>
                                <Button variant='outline-secondary w-25 mb-2' onClick={handleShowPassword}>Change Password</Button>
                            </div>
                        </Card.Body>
                    </Card>
                    <Modal
                        show={showEdit}
                        backdrop="static"
                        keyboard={false}
                        centered
                        data-bs-theme="dark"
                        onHide={handleCloseEdit}
                    >
                        <Form onSubmit={e => handleUpdate(e)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit your information</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Login</Form.Label>
                                    <Form.Control type="text" defaultValue={user.login} onChange={e => setLogin(e.target.value)} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control type="text" defaultValue={user.fullName} onChange={e => setFullName(e.target.value)} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" onChange={e => setPassword(e.target.value)} />
                                    <Form.Text muted>Type in your password to confirm changes</Form.Text>
                                    {showError ?
                                        <div>
                                            <Form.Text className='text-danger' onClick={() => setShowError(false)}>Wrong password</Form.Text>
                                        </div>
                                        : <></>
                                    }
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseEdit}>Cancel</Button>
                                <Button variant="success" type="submit">Update</Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                    <Modal
                        show={showPassword}
                        backdrop="static"
                        keyboard={false}
                        centered
                        data-bs-theme="dark"
                        onHide={handleClosePassword}
                    >
                        <Form onSubmit={e => handlePasswordUpdate(e)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit your information</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>New password</Form.Label>
                                    <Form.Control type="password" onChange={e => setNewPassword(e.target.value)} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Repeat new password</Form.Label>
                                    <Form.Control type="password" onChange={e => setNewPasswordRepeat(e.target.value)} />
                                    {showPasswordsError ?
                                        <div>
                                            <Form.Text className='text-danger' onClick={() => setShowPasswordsError(false)}>Type in same passwords</Form.Text>
                                        </div>
                                        : <></>
                                    }
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" onChange={e => setPassword(e.target.value)} />
                                    <Form.Text muted>Type in your password to confirm changes</Form.Text>
                                    {showError ?
                                        <div>
                                            <Form.Text className='text-danger' onClick={() => setShowError(false)}>Wrong password</Form.Text>
                                        </div>
                                        : <></>
                                    }
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClosePassword}>Cancel</Button>
                                <Button variant="success" type="submit">Update</Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                </>
            )
                : (
                    <p>User not found</p>
                )
            }
        </div>
    );
}

export default UserProfile;
