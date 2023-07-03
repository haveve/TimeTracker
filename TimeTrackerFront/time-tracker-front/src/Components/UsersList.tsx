import React, { useEffect } from 'react';
import {Container, Nav, Navbar, NavDropdown, Button, Card, Table } from "react-bootstrap";
import '../Custom.css';
import { useSelector, useDispatch  } from 'react-redux';
import type {RootState} from "../Redux/store";
import { deleteUser, getUsers } from '../Redux/epics';
import { useNavigate } from 'react-router';

function Userslist() {
    const users = useSelector((state: RootState) => state.users.Users);
    const dispatch = useDispatch();

    const navigate = useNavigate();

    useEffect(() => {
      dispatch(getUsers());
  }, []);

  const handleUserDelete = (id: number) => {
    dispatch(deleteUser(id));
  }
  
  const handleUserDetails = (id: number) => {
    navigate(id)
  }

  return (
    <div className='Userslist d-flex align-items-center flex-column m-1'>
        <h1>Users</h1>
        <Card style={{ width: '18rem' }} className='w-75'>
            <Card.Body>
                <Table striped bordered hover className='m-0'>
                    <thead>
                        <tr>
                        <th>Login</th>
                        <th>Password</th>
                        <th>Full Name</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                            {
                                users.map((user) => 
                                    <tr key={user.id}>
                                    <td>{user.login}</td>
                                    <td>{user.password}</td>
                                    <td>{user.fullName}</td>
                                    <td>
                                        <Button  onClick={() => handleUserDetails(user.id)}>details</Button>
                                        <Button onClick={() => handleUserDelete(user.id)}>delete</Button>
                                    </td>
                                    </tr>
                                )
                            }
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    </div>
  );
}

export default Userslist;
