import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Modal, Row, Col, ProgressBar, InputGroup } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { User } from '../Redux/Types/User';
import { RequestUpdateUser, RequestUpdatePassword, RequestUser } from '../Redux/Requests/UserRequests';
import { RootState } from '../Redux/store';
import { getCurrentUser, getUsers } from '../Redux/epics';
import { Error } from './Error';
import TimeManage from './TimeManage';
import '../Custom.css';
import { RequestGetTotalWorkTime } from '../Redux/Requests/TimeRequests';
import { getCookie } from '../Login/Api/login-logout';
import { TimeForStatisticFromSeconds } from './TimeStatistic';
import VacationRequests from "./VacationRequests";


function UserProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showEdit, setShowEdit] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [showTimeManage, setShowTimeManage] = useState(false);

    const [showVacationRequests, setShowVacationRequests] = useState(false);

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleCloseEdit = () => { setShowEdit(false); setShowError(false); };
    const handleShowEdit = () => setShowEdit(true);

    const handleClosePassword = () => { setShowPassword(false); setShowError(false); };
    const handleShowPassword = () => setShowPassword(true);

    const handleShowVacationRequests = () => setShowVacationRequests(true);
    const handleCloseVacationRequests = () => setShowVacationRequests(false);


    const [user, setUser] = useState({} as User);
    const [totalWorkTime, setTotalWorkTime] = useState(0);

    const [id, setId] = useState(0);
    const [login, setLogin] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [newPassword, setNewPassword] = useState('');
    const [newPasswordRepeat, setNewPasswordRepeat] = useState('');

    useEffect(() => {
        RequestUser(parseInt(getCookie("user_id")!)).subscribe((x) => {
            setUser(x);
        })
        RequestGetTotalWorkTime(parseInt(getCookie("user_id")!)).subscribe((x) => {
            setTotalWorkTime(x);
        })
    }, []);

    useEffect(() => {
        if (user) {
            setId(user.id!)
            setFullName(user.fullName!)
            setLogin(user.login!)
        }
    }, [user])


    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!password || !login || !fullName) { setShowError(true); setErrorMessage("Fill all fields"); return; }
        const User: User = {
            id: id,
            login: login,
            fullName: fullName,
            email: email,
            password: password
        }
        RequestUpdateUser(User).subscribe((x) => {
            if (x === "User updated successfully") {
                setShowEdit(false);
                RequestUser(parseInt(getCookie("user_id")!)).subscribe((x) => {
                    setUser(x);
                })
                setShowError(false);
            }
            else {
                setErrorMessage(x);
                setShowError(true);
            }
        });
    }

    const handlePasswordUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (newPassword != newPasswordRepeat) { setShowError(true); setErrorMessage("Type in same passwords"); return; }
        if (newPassword.length < 8) { setShowError(true); setErrorMessage("Password should be at least 8 characters"); return; }
        RequestUpdatePassword(id, newPassword, password).subscribe((x) => {
            if (x === "Password updated successfully") {
                setShowPassword(false);
                setShowError(false);
            }
            else {
                setErrorMessage("Wrong password");
                setShowError(true);
            }
        });
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
                            <Row className='mb-3'>
                                <Col>
                                    <span className='d-flex flex-column border border-secondary rounded-1 p-3 w-100 h-100 bg-darkgray'>
                                        <p className='m-0 fs-5 text-white'>{user.fullName}</p>
                                        <p className="m-0 fs-6 text-secondary">@{user.login}</p>
                                        <p className="m-0 fs-6 text-secondary">{user.email}</p>
                                        <InputGroup className='mt-auto'>
                                            {user.editWorkHours ?
                                                <Button variant="outline-secondary" type="submit" onClick={() => setShowTimeManage(n => !n)}>Time Manage</Button>
                                                :
                                                <></>
                                            }
                                            <Button variant='outline-secondary' onClick={handleShowEdit}>Edit</Button>
                                            <Button variant='outline-secondary' onClick={handleShowPassword}>Change Password</Button>
                                        </InputGroup>
                                    </span>
                                </Col>
                                <Col>
                                    <span className='d-flex flex-column border border-secondary rounded-1 p-3 w-100 bg-darkgray'>
                                        <div className='d-flex flex-row w-100 justify-content-between mb-2'>
                                            <p className='m-0'>Worked today</p>
                                            {TimeForStatisticFromSeconds(user.daySeconds!)}
                                        </div>
                                        <div className='d-flex flex-row w-100 justify-content-between mb-2'>
                                            <p className='m-0'>Worked this week</p>
                                            {TimeForStatisticFromSeconds(user.weekSeconds!)}
                                        </div>
                                        <div className='d-flex flex-row w-100 justify-content-between mb-2'>
                                            <p className='m-0'>Worked this month</p>
                                            {TimeForStatisticFromSeconds(user.monthSeconds!)}
                                        </div>
                                        <div className='d-flex flex-row w-100 justify-content-between mb-2'>
                                            <ProgressBar now={(user.monthSeconds! / totalWorkTime) * 100} animated className='w-75 mt-1' variant='success' />
                                            {TimeForStatisticFromSeconds(totalWorkTime)}
                                        </div>
                                    </span>
                                </Col>
                            </Row>

                            <VacationRequests user={user}></VacationRequests>
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
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control type="text" defaultValue={user.fullName} onChange={e => setFullName(e.target.value)} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Login</Form.Label>
                                    <Form.Control type="text" defaultValue={user.login} onChange={e => setLogin(e.target.value)} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" defaultValue={user.email} onChange={e => setEmail(e.target.value)} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" onChange={e => setPassword(e.target.value)} />
                                    <Form.Text muted>Type in your password to confirm changes</Form.Text>
                                    <Error ErrorText={errorMessage} Show={showError} SetShow={() => setShowError(false)}></Error>
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
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Old password</Form.Label>
                                    <Form.Control type="password" onChange={e => setPassword(e.target.value)} />
                                    <Form.Text muted>Type in your password to confirm changes</Form.Text>
                                    <Error ErrorText={errorMessage} Show={showError} SetShow={() => setShowError(false)}></Error>
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClosePassword}>Cancel</Button>
                                <Button variant="success" type="submit">Update</Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                    <TimeManage isShowed={showTimeManage} setShowed={setShowTimeManage} User={user} setUser={setUser}></TimeManage>

                </>
            )
                : (
                    <p>User not found</p>
                )
            }
        </div >
    );
}

export default UserProfile;
