import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Modal, Row, Col, ProgressBar, InputGroup, ListGroup } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { User } from '../../Redux/Types/User';
import { RequestUpdateUser, RequestUpdatePassword, RequestUser, RequestCurrentUser } from '../../Redux/Requests/UserRequests';
import { RootState } from '../../Redux/store';
import { ErrorMassagePattern, getCurrentUser, getUsers } from '../../Redux/epics';
import { Error } from '../Service/Error';
import '../../Custom.css';
import { RequestGetTotalWorkTime, RequestUserTime } from '../../Redux/Requests/TimeRequests';
import { getCookie } from '../../Login/Api/login-logout';
import { TimeForStatisticFromSeconds } from '../Time/TimeStatistic';
import VacationRequests from "./VacationRequests";
import { Time } from '../../Redux/Types/Time';
import { Absence } from '../../Redux/Types/Absence';
import { RequestAddCurrentUserAbsence, RequestCurrentUserAbsences, RequestRemoveCurrentUserAbsence } from '../../Redux/Requests/AbsenceRequests';
import NotificationModalWindow, { MessageType } from '../Service/NotificationModalWindow';


function UserProfile() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showEdit, setShowEdit] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showAbsence, setShowAbsence] = useState(false);

    const [showVacationRequests, setShowVacationRequests] = useState(false);

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleCloseAbcense = () => { setShowAbsence(false); setShowError(false); };
    const handleShowAbcense = () => { RequestCurrentUserAbsences().subscribe(x => setAbsences(x)); setShowAbsence(true); };

    const handleClosePassword = () => { setShowPassword(false); setShowError(false); };
    const handleShowPassword = () => setShowPassword(true);

    const handleCloseEdit = () => { setShowEdit(false); setShowError(false); };
    const handleShowEdit = () => setShowEdit(true);

    const handleShowVacationRequests = () => setShowVacationRequests(true);
    const handleCloseVacationRequests = () => setShowVacationRequests(false);


    const [user, setUser] = useState({} as User);
    const [time, setTime] = useState({} as Time);
    const [absences, setAbsences] = useState([] as Absence[]);
    const [totalWorkTime, setTotalWorkTime] = useState(0);

    const [id, setId] = useState(0);
    const [login, setLogin] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [newPassword, setNewPassword] = useState('');
    const [newPasswordRepeat, setNewPasswordRepeat] = useState('');


    const [date, setDate] = useState<Date>();
    const [type, setType] = useState('Absent');

    useEffect(() => {
        RequestCurrentUser().subscribe((x) => {
            setUser(x);
        })
        RequestGetTotalWorkTime(parseInt(getCookie("user_id")!)).subscribe((x) => {
            setTotalWorkTime(x);
        })
        RequestUserTime(parseInt(getCookie("user_id")!)).subscribe((x) => {
            setTime(x.time);
        })
    }, []);

    useEffect(() => {
        if (user) {
            setId(user.id!)
            setFullName(user.fullName!)
            setLogin(user.login!)
            setEmail(user.email!)
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
        RequestUpdateUser(User).subscribe({
            next(x) {
                if (x === "User updated successfully") {
                    setShowEdit(false);
                    RequestUser(parseInt(getCookie("user_id")!)).subscribe((x) => {
                        setUser(x);
                    })
                    setShowError(false);
                    setSuccess(x)
                }
                else {
                    setError(x);
                }
            },
            error(error) { setError(ErrorMassagePattern) }
        });
    }

    const handlePasswordUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (newPassword != newPasswordRepeat) { setShowError(true); setErrorMessage("Type in same passwords"); return; }
        if (newPassword.length < 8) { setShowError(true); setErrorMessage("Password should be at least 8 characters"); return; }
        RequestUpdatePassword(id, newPassword, password).subscribe({
            next(x) {
                if (x === "Password updated successfully") {
                    setShowPassword(false);
                    setShowError(false);
                    setSuccess(x)
                }
                else {
                    setError(x);
                }
            },
            error(error) { setError(ErrorMassagePattern) }
        });
    }

    const handleAddAbsence = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (date === undefined) { setShowError(true); setErrorMessage("Fill all fields"); return; }
        if (absences.filter((a) => a.date!.toLocaleString() === date!.toISOString().slice(0, 10)).length !== 0) { setShowError(true); setErrorMessage("Already absent on this date"); return; }
        const Absence: Absence = {
            userId: id,
            type: type,
            date: date
        }
        RequestAddCurrentUserAbsence(Absence).subscribe((x) => {
            setShowError(false);
            RequestCurrentUserAbsences().subscribe(x => setAbsences(x));
        });
    }

    const handleRemoveAbsence = (Absence: Absence) => {
        RequestRemoveCurrentUserAbsence(Absence).subscribe((x) => {
            setShowError(false);
            RequestCurrentUserAbsences().subscribe(x => setAbsences(x));
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
                                            <Button variant='outline-secondary' onClick={handleShowEdit}>Edit</Button>
                                            <Button variant='outline-secondary' onClick={handleShowPassword}>Change Password</Button>
                                            <Button variant='outline-secondary' onClick={handleShowAbcense}>Presence</Button>
                                        </InputGroup>
                                    </span>
                                </Col>
                                <Col>
                                    <span className='d-flex flex-column border border-secondary rounded-1 p-3 w-100 bg-darkgray'>
                                        <div className='d-flex flex-row w-100 justify-content-between mb-2'>
                                            <p className='m-0'>Worked today</p>
                                            {TimeForStatisticFromSeconds(time.daySeconds)}
                                        </div>
                                        <div className='d-flex flex-row w-100 justify-content-between mb-2'>
                                            <p className='m-0'>Worked this week</p>
                                            {TimeForStatisticFromSeconds(time.weekSeconds!)}
                                        </div>
                                        <div className='d-flex flex-row w-100 justify-content-between mb-2'>
                                            <p className='m-0'>Worked this month</p>
                                            {TimeForStatisticFromSeconds(time.monthSeconds!)}
                                        </div>
                                        <div className='d-flex flex-row w-100 justify-content-between mb-2'>
                                            <ProgressBar now={(time.monthSeconds! / totalWorkTime) * 100} animated className='w-75 mt-1'
                                                variant='success' />
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
                    <Modal
                        show={showAbsence}
                        backdrop="static"
                        keyboard={false}
                        centered
                        data-bs-theme="dark"
                        onHide={handleCloseAbcense}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Presence</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form className='mb-2' onSubmit={e => handleAddAbsence(e)}>
                                <InputGroup>
                                    <Form.Control type="date" onChange={e => setDate(new Date(e.target.value))} />
                                    <Form.Select onChange={e => setType(e.target.value)}>
                                        <option value="Absent">Absent</option>
                                        <option value="Ill">Ill</option>
                                    </Form.Select>
                                    <Button variant='success' type='submit'>Add</Button>
                                </InputGroup>
                                <Error ErrorText={errorMessage} Show={showError} SetShow={() => setShowError(false)}></Error>
                            </Form>
                            <ListGroup className='w-100 d-flex scroll pe-2'>
                                {
                                    absences?.map((absence, index) =>
                                        <ListGroup.Item key={index} className='d-flex flex-row align-items-center justify-content-between rounded-2 mb-1'>
                                            <Row className='w-100'>
                                                <Col sm={4} className='d-flex align-items-center'>
                                                    <p className='m-0 fs-5'>{absence.date!.toLocaleString()}</p>
                                                </Col>
                                                <Col sm={4} className='d-flex align-items-center'>
                                                    <p className='m-0 fs-5'>{absence.type}</p>
                                                </Col>
                                                <Col className='d-flex align-items-center pe-0'>
                                                    <Button variant="outline-danger" onClick={() => handleRemoveAbsence(absence)} className='ms-auto'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-trash mb-1" viewBox="0 0 16 16">
                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                                        </svg>
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    )
                                }
                            </ListGroup>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseAbcense}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                    <NotificationModalWindow isShowed={error !== ""} dropMessage={setError}
                        messageType={MessageType.Error}>{error}</NotificationModalWindow>
                    <NotificationModalWindow isShowed={success !== ""} dropMessage={setSuccess}
                        messageType={MessageType.Success}>{success}</NotificationModalWindow>
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
