import React, { useEffect } from 'react';
import { ListGroup } from "react-bootstrap";
import '../Custom.css';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import { deleteUser, getUsers } from '../Redux/epics';
import { Link } from 'react-router-dom';

function Userslist() {
    const users = useSelector((state: RootState) => state.users.Users);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getUsers());
    }, []);

    return (
        <div className='Userslist d-flex align-items-center flex-column m-1'>
            <h5>Users</h5>
            <ListGroup className='w-50 d-flex'>
                {
                    users.map((user) =>
                        <ListGroup.Item key={user.id} className='d-flex flex-row align-items-center justify-content-between rounded-2 mb-1'>
                            <div>
                                <p className='m-0 fs-5'>{user.fullName}</p>
                                <Link to={"/Users/" + user.id} className="link-offset-2 link-underline link-underline-opacity-0 fs-6">@{user.login}</Link>
                            </div>
                            <p className='m-0'>Worker</p>
                        </ListGroup.Item>

                    )
                }
            </ListGroup>

        </div>
    );
}

export default Userslist;
