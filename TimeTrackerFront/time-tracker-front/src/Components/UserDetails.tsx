import React, { useEffect } from 'react';
import {Container, Button, Card, Table } from "react-bootstrap";
import { useParams } from 'react-router';
import { useSelector, useDispatch  } from 'react-redux';
import type {RootState} from "../Redux/store";
import '../Custom.css';
import { getUsers } from '../Redux/epics';

function UserDetails() {
    const { userId = "" } = useParams();
    const user = useSelector((state: RootState) => state.users.Users).find(u => u.id == parseInt(userId));
    const dispatch = useDispatch();

    console.log()

  return (
    <div className='UserDetails d-flex align-items-center flex-column m-1'>
        <h1>User details</h1>
        <Card style={{ width: '18rem' }} className='w-75'>
            <Card.Body>
                {user?.login}
                {user?.password}
                {user?.fullName}
            </Card.Body>
        </Card>
    </div>
  );
}

export default UserDetails;
