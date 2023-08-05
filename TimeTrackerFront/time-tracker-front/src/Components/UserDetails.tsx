import React, { useEffect, useState } from 'react';
import { InputGroup, Form, Button, Card, Modal, ProgressBar, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import '../Custom.css';
import { TimeForStatisticFromSeconds } from './TimeStatistic';
import { RequestDisableUser, RequestUpdateUserPermissions, RequestUser, RequestUserPermissions } from '../Redux/Requests/UserRequests';
import { RequestGetTotalWorkTime } from '../Redux/Requests/TimeRequests';
import { User } from '../Redux/Types/User';
import { Permissions } from '../Redux/Types/Permissions';

function UserDetails() {
  const { userId = "" } = useParams();
  const [showDisable, setShowDisable] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [user, setUser] = useState({} as User);
  const [totalWorkTime, setTotalWorkTime] = useState(0);

  const [cRUDUsers, setCRUDUsers] = useState(false)
  const [editPermiters, setEditPermiters] = useState(false)
  const [viewUsers, setViewUsers] = useState(false)
  const [editWorkHours, setEditWorkHours] = useState(false)
  const [importExcel, setImportExcel] = useState(false)
  const [controlPresence, setControlPresence] = useState(false)
  const [controlDayOffs, setControlDayOffs] = useState(false)

  const dispatch = useDispatch();
  const navigate = useNavigate();

  let currentUser = useSelector((state: RootState) => state.currentUser.User);

  useEffect(() => {
    RequestUser(parseInt(userId)).subscribe((x) => {
      setUser(x);
    })
    RequestGetTotalWorkTime(parseInt(userId)).subscribe((x) => {
      setTotalWorkTime(x);
    })
  }, []);

  const handleCloseDisable = () => setShowDisable(false);
  const handleShowDisable = () => setShowDisable(true);

  const handleClosePermissions = () => setShowPermissions(false);
  const handleShowPermissions = () => {
    RequestUserPermissions(parseInt(userId)).subscribe((x) => {
      setCRUDUsers(x.cRUDUsers)
      setEditPermiters(x.editPermiters)
      setViewUsers(x.viewUsers)
      setEditWorkHours(x.editWorkHours)
      setImportExcel(x.importExcel)
      setControlPresence(x.controlPresence)
      setControlDayOffs(x.controlDayOffs)
    })
    setShowPermissions(true);
  };

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
    RequestUpdateUserPermissions(Permissions).subscribe()
    handleClosePermissions()
  }

  const handleUserDisable = () => {
    RequestDisableUser(parseInt(userId)).subscribe()
    handleCloseDisable()
  }
  return (

    <div className='UserDetails d-flex align-items-center flex-column m-1'>
      <Button variant='dark' className='ms-2 me-auto' onClick={() => navigate("/Users")}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-90deg-left" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z" />
        </svg>
      </Button>
      {user ? (
        <>
          <Card style={{ width: '18rem' }} className='w-75 '>
            <Card.Body className='d-flex flex-column'>
              <Row className='mb-3'>
                <Col>
                  <span className='d-flex flex-column border border-secondary rounded-1 p-3 w-100 h-100 bg-darkgray'>
                    <p className='m-0 fs-5 text-white'>{user.fullName}</p>
                    <p className="m-0 fs-6 text-secondary">@{user.login}</p>
                    <p className="m-0 fs-6 text-secondary">{user.email}</p>
                    {user.enabled == false ?
                      <p className='m-0 mt-auto text-danger'>User disabled</p>
                      :
                      <>
                        {currentUser.cRUDUsers ?
                          <InputGroup className='mt-auto'>
                            <Button variant='outline-secondary' onClick={handleShowPermissions}>Permissions</Button>
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
                <Button variant="secondary" onClick={handleClosePermissions}>Cancel</Button>
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
    </div >
  );
}

export default UserDetails;
