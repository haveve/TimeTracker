import React, { useEffect } from 'react';
import { Container, Button, Card } from "react-bootstrap";
import { useParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import '../Custom.css';
import { getUsers } from '../Redux/epics';

function UserDetails() {
  const { userId = "" } = useParams();
  const user = useSelector((state: RootState) => state.users.Users).find(u => u.id == parseInt(userId));
  const dispatch = useDispatch();

  return (
    <div className='UserDetails d-flex align-items-center flex-column m-1'>
      <Card style={{ width: '18rem' }} className='w-75'>
        <Card.Body>
          <div>
            <p className='m-0 fs-5'>{user?.fullName}</p>
            <p className="link-offset-2 link-underline link-underline-opacity-0 fs-6">@{user?.login}</p>
          </div>
          <p className='m-0'>Worker</p>
        </Card.Body>
      </Card>
    </div>
  );
}

export default UserDetails;
