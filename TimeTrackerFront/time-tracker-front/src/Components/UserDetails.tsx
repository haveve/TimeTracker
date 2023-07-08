import React, { useEffect, useState } from 'react';
import { InputGroup, Form, Button, Card, Modal } from "react-bootstrap";
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import '../Custom.css';
import { deleteUser } from '../Redux/epics';
import { getUsers } from '../Redux/epics';

function UserDetails() {
  const { userId = "" } = useParams();
  const [showDelete, setShowDelete] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUsers());
  }, []);

  let user = useSelector((state: RootState) => state.users.Users).find(u => u.id == parseInt(userId))!;

  const handleCloseDelete = () => setShowDelete(false);
  const handleShowDelete = () => setShowDelete(true);

  const handleShowPermissions = () => {
    navigate("/UserPermissions/" + user.id);
  }

  const handleUserDelete = () => {
    dispatch(deleteUser(parseInt(userId)));
    navigate("/Users")
  }
  return (

    <div className='UserDetails d-flex align-items-center flex-column m-1'>
    <Button variant='dark' className='ms-2 me-auto' onClick={() => navigate("/Users")}>
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
              <p className='m-0'>Worker</p>
              <div className='ms-auto'>
                <Button variant='outline-secondary me-2' onClick={handleShowPermissions}>Permissions</Button>
                <Button variant='outline-danger' onClick={handleShowDelete}>Delete</Button>
              </div>
            </Card.Body>
          </Card>
          <Modal
            show={showDelete}
            onHide={handleCloseDelete}
            backdrop="static"
            keyboard={false}
            centered
            data-bs-theme="dark"
          >
            <Modal.Header closeButton>
              <Modal.Title>Delete user @{user.login}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete user?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDelete}>Cancel</Button>
              <Button variant="danger" onClick={handleUserDelete}>Delete</Button>
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
