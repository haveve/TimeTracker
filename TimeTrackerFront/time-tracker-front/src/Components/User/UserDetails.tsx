import React, {useEffect, useRef, useState} from 'react';
import {
    InputGroup,
    Form,
    Button,
    Card,
    Modal,
    ProgressBar,
    Row,
    Col,
    ListGroupItem,
    ListGroup,
    Overlay, Pagination
} from "react-bootstrap";
import {useParams, useNavigate, Link} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../Redux/store';
import '../../Custom.css';
import {getUsers} from '../../Redux/epics';
import {TimeForStatisticFromSeconds} from '../Time/TimeStatistic';
import {RequestGetTotalWorkTime, RequestUserTime} from '../../Redux/Requests/TimeRequests';
import {User} from '../../Redux/Types/User';
import {
    RequestDisableUser,
    RequestUpdateUserPermissions,
    RequestUser,
    RequestUserPermissions
} from '../../Redux/Requests/UserRequests';
import {Permissions} from '../../Redux/Types/Permissions';
import {addApprover, deleteApprover, getApprovers} from "../../Redux/VacationEpics";
import {getPagedUsers} from "../../Redux/epics"
import {ApproverNode} from "../../Redux/Types/ApproverNode";
import {Page} from "../../Redux/Types/Page";
import {Time} from '../../Redux/Types/Time';
import {
    RequestAddUserAbsence,
    RequestRemoveUserAbsence,
    RequestUserAbsences
} from '../../Redux/Requests/AbsenceRequests';
import {Absence} from '../../Redux/Types/Absence';
import {Error} from '../Service/Error';

function UserDetails() {
    const {userId = ""} = useParams();
    const [showDisable, setShowDisable] = useState(false);
    const [showPermissions, setShowPermissions] = useState(false);
    const [showApprovers, setShowApprovers] = useState(false);
    const [showAbsence, setShowAbsence] = useState(false);
    const [user, setUser] = useState({} as User);
    const [time, setTime] = useState({} as Time);
    const [absences, setAbsences] = useState([] as Absence[]);
    const [totalWorkTime, setTotalWorkTime] = useState(0);

    const [date, setDate] = useState<Date>();
    const [type, setType] = useState('Absent');

    const [cRUDUsers, setCRUDUsers] = useState(false)
    const [editApprovers, setEditApprovers] = useState(false)
    const [viewUsers, setViewUsers] = useState(false)
    const [editWorkHours, setEditWorkHours] = useState(false)
    const [exportExcel, setExportExcel] = useState(false)
    const [controlPresence, setControlPresence] = useState(false)
    const [controlDayOffs, setControlDayOffs] = useState(false)

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [search, setSearch] = useState('');
    const [orderfield, setOrderfield] = useState('');
    const [enabled, setEnabled] = useState('1');
    const [order, setOrder] = useState("ASC");
    const target = useRef(null);
    const [show, setShow] = useState(false);

    const first = 6;
    const [after, setAfter] = useState(0);
    let page = {...useSelector((state: RootState) => state.users.UsersPage)};

    const approverList = useSelector((state: RootState) => state.vacation.approvers);
    if (page.userList !== undefined) {
        page.userList = page.userList.filter((item) => !approverList.some((el) => el.id === item.id));
        page.userList = page.userList.filter((item) => item.id !== user.id);
    }
    const dispatch = useDispatch();
    const navigate = useNavigate();

    let currentUserPermissions = useSelector((state: RootState) => state.currentUser.Permissions);

    useEffect(() => {
        RequestUser(parseInt(userId)).subscribe((x) => {
            setUser(x);
        })
        RequestGetTotalWorkTime(parseInt(userId)).subscribe((x) => {
            setTotalWorkTime(x);
        })
        RequestUserTime(parseInt(userId)).subscribe((x) => {
            setTime(x.time);
        })
    }, []);

    useEffect(() => {
        const page: Page = {
            first: first,
            after: after,
            search: search,
            orderField: orderfield,
            order: order,
            enabled: enabled
        }
        dispatch(getPagedUsers(page));
    }, [after, orderfield, order]);

    useEffect(() => {
        if (user !== undefined && user.id !== undefined) {
            dispatch(getApprovers(user.id));
        }
    }, [user, dispatch])

    const handleCloseAbcense = () => {
        setShowAbsence(false);
        setShowError(false);
    };
    const handleShowAbcense = () => {
        RequestUserAbsences(parseInt(userId)).subscribe(x => setAbsences(x));
        setShowAbsence(true);
    };

    const handleCloseDisable = () => setShowDisable(false);
    const handleShowDisable = () => setShowDisable(true);

    const handleClosePermissions = () => setShowPermissions(false);
    const handleShowPermissions = () => {
        RequestUserPermissions(parseInt(userId)).subscribe((x) => {
            setCRUDUsers(x.cRUDUsers)
            setEditApprovers(x.editApprovers)
            setViewUsers(x.viewUsers)
            setEditWorkHours(x.editWorkHours)
            setExportExcel(x.exportExcel)
            setControlPresence(x.controlPresence)
            setControlDayOffs(x.controlDayOffs)
        })
        setShowPermissions(true);
    };
    const handleCloseApprovers = () => {
        setShowApprovers(false);
    }
    const handleShowApprovers = () => {
        setShowApprovers(true);
    }
    const AddApproverClickHandler = (event: React.MouseEvent, inputUser: User) => {
        const approverNode = {userIdApprover: inputUser.id, userIdRequester: user.id} as ApproverNode;
        console.log(approverNode)
        dispatch(addApprover(approverNode));
    }
    const RemoveClickHandler = (event: React.MouseEvent, inputUser: User) => {
        const approverNode = {userIdApprover: inputUser.id, userIdRequester: user.id} as ApproverNode;
        dispatch(deleteApprover(approverNode));
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            HandleSearch()
        }
    }

    const HandleSearch = () => {
        const page: Page = {
            first: first,
            after: 0,
            search: search,
            orderField: orderfield,
            order: order,
            enabled: enabled
        }
        dispatch(getPagedUsers(page));
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const Permissions: Permissions = {
            userId: parseInt(userId),
            cRUDUsers: cRUDUsers,
            editApprovers: editApprovers,
            viewUsers: viewUsers,
            editWorkHours: editWorkHours,
            exportExcel: exportExcel,
            controlPresence: controlPresence,
            controlDayOffs: controlDayOffs
        }
        RequestUpdateUserPermissions(Permissions).subscribe()
        handleClosePermissions()
    }

    const handleUserDisable = () => {
        RequestDisableUser(parseInt(userId)).subscribe()
        handleCloseDisable()
    }

    const handleAddAbsence = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (date === undefined) {
            setShowError(true);
            setErrorMessage("Fill all fields");
            return;
        }
        if (absences.filter((a) => a.date!.toLocaleString() === date!.toISOString().slice(0, 10)).length !== 0) {
            setShowError(true);
            setErrorMessage("Already absent on this date");
            return;
        }
        const Absence: Absence = {
            userId: parseInt(userId),
            type: type,
            date: date
        }
        RequestAddUserAbsence(Absence).subscribe((x) => {
            setShowError(false);
            RequestUserAbsences(parseInt(userId)).subscribe(x => setAbsences(x));
        });
    }

    const handleRemoveAbsence = (Absence: Absence) => {
        Absence.userId = parseInt(userId);
        RequestRemoveUserAbsence(Absence).subscribe((x) => {
            setShowError(false);
            RequestUserAbsences(parseInt(userId)).subscribe(x => setAbsences(x));
        });
    }

    return (

        <div className='UserDetails d-flex align-items-center flex-column m-1'>
            <Button variant='dark' className='ms-2 me-auto' onClick={() => navigate("/Users")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                     className="bi bi-arrow-90deg-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd"
                          d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z"/>
                </svg>
            </Button>
            {user ? (
                    <>
                        <Card style={{width: '18rem'}} className='w-75 '>
                            <Card.Body className='d-flex flex-column'>
                                <Row className='mb-3'>
                                    <Col>
                  <span className='d-flex flex-column border border-secondary rounded-1 p-3 w-100 h-100 bg-darkgray'>
                    <p className='m-0 fs-5 text-white'>{user.fullName}</p>
                    <p className="m-0 fs-6 text-secondary">@{user.login}</p>
                    <p className="m-0 fs-6 text-secondary">{user.email}</p>
                      {user.enabled == false ?
                          <p className='m-0 mt-auto text-danger'>User is disabled</p>
                          :
                          <>

                              {currentUserPermissions.cRUDUsers ?
                                  <InputGroup className='mt-auto'>
                                      <Button variant='outline-secondary'
                                              onClick={handleShowPermissions}>Permissions</Button>
                                      <Button variant='outline-secondary'
                                              onClick={handleShowApprovers}>Approvers</Button>
                                      <Button variant='outline-secondary' onClick={handleShowAbcense}>Presence</Button>
                                      <Button variant='outline-secondary' onClick={handleShowDisable}>Disable</Button>
                                  </InputGroup>
                                  :
                                  <></>
                              }
                          </>
                      }
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
                                   variant='success'/>
                        {TimeForStatisticFromSeconds(totalWorkTime)}
                    </div>
                  </span>
                                    </Col>
                                </Row>
                                <div className='ms-auto'>
                                </div>
                            </Card.Body>
                        </Card>
                        <Modal
                            show={showDisable}
                            onHide={handleCloseDisable}
                            backdrop="static"
                            keyboard={false}
                            centered
                            data-bs-theme="dark"
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Disable user @{user.login}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Are you sure you want to disable user {user.fullName}?
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseDisable}>Cancel</Button>
                                <Button variant="danger" onClick={handleUserDisable}>Disable</Button>
                            </Modal.Footer>
                        </Modal>
                        <Modal
                            show={showPermissions}
                            backdrop="static"
                            keyboard={false}
                            centered
                            data-bs-theme="dark"
                            onHide={handleClosePermissions}
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
                                            onClick={() => {
                                                setViewUsers(!viewUsers);
                                            }}
                                        />
                                        <Form.Check
                                            type="switch"
                                            id="custom-switch-2"
                                            label="Export excell"
                                            checked={exportExcel}
                                            onClick={() => {
                                                setExportExcel(!exportExcel)
                                            }}
                                        />
                                        <Form.Check
                                            type="switch"
                                            id="custom-switch-3"
                                            label="Manage users"
                                            checked={cRUDUsers}
                                            onClick={() => {
                                                setCRUDUsers(!cRUDUsers)
                                            }}
                                        />
                                        <Form.Check
                                            type="switch"
                                            id="custom-switch-4"
                                            label="Manage approvers"
                                            checked={editApprovers}
                                            onClick={() => {
                                                setEditApprovers(!editApprovers)
                                            }}
                                        />
                                        <Form.Check
                                            type="switch"
                                            id="custom-switch-5"
                                            label="Manage work hours"
                                            checked={editWorkHours}
                                            onClick={() => {
                                                setEditWorkHours(!editWorkHours)
                                            }}
                                        />
                                        <Form.Check
                                            type="switch"
                                            id="custom-switch-6"
                                            label="Manage presence"
                                            checked={controlPresence}
                                            onClick={() => {
                                                setControlPresence(!controlPresence)
                                            }}
                                        />
                                        <Form.Check
                                            type="switch"
                                            id="custom-switch-7"
                                            label="Manage day offs"
                                            checked={controlDayOffs}
                                            onClick={() => {
                                                setControlDayOffs(!controlDayOffs)
                                            }}
                                        />
                                    </InputGroup>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleClosePermissions}>Cancel</Button>
                                    <Button variant="success" type="submit">Update</Button>
                                </Modal.Footer>
                            </Form>
                        </Modal>
                        <Modal
                            show={showApprovers}
                            backdrop="static"
                            keyboard={false}
                            size="lg"
                            centered
                            data-bs-theme="dark"
                            onHide={handleCloseApprovers}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Approvers</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <h5>Approvers list</h5>
                                <ListGroup>
                                    {
                                        approverList.map((itemUser) =>

                                            <ListGroupItem key={itemUser.id}
                                                           className='d-flex flex-row align-items-center justify-content-between rounded-2 mb-1'>
                                                <Col sm={4}>
                                                    <p className='m-0 fs-5'>{itemUser.fullName}</p>
                                                    <Link to={"/Users/" + itemUser.id}
                                                          className="link-offset-2 link-underline link-underline-opacity-0 fs-6">@{itemUser.login}</Link>
                                                </Col>
                                                <Button
                                                    variant="outline-primary"
                                                    onClick={(event) => RemoveClickHandler(event, itemUser)}>
                                                    Remove from approvers
                                                </Button>
                                            </ListGroupItem>
                                        )
                                    }
                                </ListGroup>
                                <h5>Approvers to add</h5>
                                <Row className='m-0 p-0 w-100'>
                                    <Col className='m-0 p-0 me-2' sm={7}>
                                        <InputGroup>
                                            <Form.Control
                                                placeholder="Search"
                                                aria-describedby="Search"
                                                onChange={e => setSearch(e.target.value)}
                                                onKeyDown={e => handleKeyDown(e)}
                                            />
                                            <Button variant="outline-secondary" id="Search" onClick={HandleSearch}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                     fill="currentColor"
                                                     className="bi bi-search mb-1" viewBox="0 0 16 16">
                                                    <path
                                                        d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                                </svg>
                                            </Button>
                                        </InputGroup>
                                    </Col>
                                    <Col className='m-0 p-0'>
                                        <InputGroup>
                                            <Form.Select onChange={e => setOrderfield(e.target.value)}>
                                                <option value="">Sort by</option>
                                                <option value="Login">Login</option>
                                                <option value="FullName">Name</option>
                                            </Form.Select>
                                            <Button variant="outline-secondary" onClick={() => {
                                                order === "ASC" ? setOrder("DESC") : setOrder("ASC")
                                            }}>
                                                {order === "ASC" ?
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                         fill="currentColor"
                                                         className="bi bi-sort-down mb-1" viewBox="0 0 16 16">
                                                        <path
                                                            d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
                                                    </svg> :
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                         fill="currentColor"
                                                         className="bi bi-sort-up mb-1" viewBox="0 0 16 16">
                                                        <path
                                                            d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707V12.5zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
                                                    </svg>
                                                }
                                            </Button>

                                        </InputGroup>
                                    </Col>
                                </Row>
                                <ListGroup className='w-100 d-flex'>
                                    {
                                        page.userList?.map((itemUser) =>
                                            <ListGroup.Item key={itemUser.id}
                                                            className='d-flex flex-row align-items-center justify-content-between rounded-2 mb-1'>

                                                <Col sm={4}>
                                                    <p className='m-0 fs-5'>{itemUser.fullName}</p>
                                                    <Link to={"/Users/" + itemUser.id}
                                                          className="link-offset-2 link-underline link-underline-opacity-0 fs-6">@{itemUser.login}</Link>
                                                </Col>
                                                <Col sm={2}>
                                                    <Button
                                                        variant="outline-primary"
                                                        onClick={(event) => AddApproverClickHandler(event, itemUser)}>
                                                        Pick
                                                    </Button>
                                                </Col>


                                            </ListGroup.Item>
                                        )
                                    }
                                </ListGroup>
                                {page.totalCount > 0 ?
                                    <Pagination className='mt-auto'>
                                        <Pagination.First onClick={() => setAfter(0)}/>
                                        <Pagination.Prev onClick={() => {
                                            if (page.pageIndex != 0) setAfter(after - first)
                                        }}/>
                                        <Pagination.Item active>{page.pageIndex + 1}</Pagination.Item>
                                        <Pagination.Next onClick={() => {
                                            if (page.pageIndex != page.totalCount - 1) setAfter(after + first)
                                        }}/>
                                        <Pagination.Last onClick={() => setAfter((page.totalCount - 1) * first)}/>
                                    </Pagination>
                                    : <p>No users found</p>
                                }
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="danger" onClick={handleCloseApprovers}>Close</Button>
                            </Modal.Footer>
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
                                        <Form.Control type="date" onChange={e => setDate(new Date(e.target.value))}/>
                                        <Form.Select onChange={e => setType(e.target.value)}>
                                            <option value="Absent">Absent</option>
                                            <option value="Ill">Ill</option>
                                        </Form.Select>
                                        <Button variant='success' type='submit'>Add</Button>
                                    </InputGroup>
                                    <Error ErrorText={errorMessage} Show={showError}
                                           SetShow={() => setShowError(false)}></Error>
                                </Form>
                                <ListGroup className='w-100 d-flex scroll pe-2'>
                                    {
                                        absences?.map((absence, index) =>
                                            <ListGroup.Item key={index}
                                                            className='d-flex flex-row align-items-center justify-content-between rounded-2 mb-1'>
                                                <Row className='w-100'>
                                                    <Col sm={4} className='d-flex align-items-center'>
                                                        <p className='m-0 fs-5'>{absence.date!.toLocaleString()}</p>
                                                    </Col>
                                                    <Col sm={4} className='d-flex align-items-center'>
                                                        <p className='m-0 fs-5'>{absence.type}</p>
                                                    </Col>
                                                    <Col className='d-flex align-items-center pe-0'>
                                                        <Button variant="outline-danger"
                                                                onClick={() => handleRemoveAbsence(absence)}
                                                                className='ms-auto'>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                                 fill="currentColor" className="bi bi-trash mb-1"
                                                                 viewBox="0 0 16 16">
                                                                <path
                                                                    d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                                                                <path
                                                                    d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
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
                    </>
                )
                : (
                    <p>User not found</p>
                )
            }
        </div>
    );
}

export default UserDetails;
