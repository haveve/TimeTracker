import React, { useEffect, useState, useRef } from 'react';
import { ListGroup, Pagination, Form, InputGroup, Button, Row, Col, Overlay } from "react-bootstrap";
import '../Custom.css';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import { getPagedUsers, getUsers } from '../Redux/epics';
import { Link, useNavigate } from 'react-router-dom';
import { Page } from '../Redux/Types/Page';
import { TimeForStatisticFromSeconds } from './TimeStatistic';

function PermissionError() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return (
        <div className='UserDetails d-flex align-items-center flex-column m-1'>
            <Button variant='dark' className='ms-2 me-auto' onClick={() => navigate("/Users")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-90deg-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z" />
                </svg>
            </Button>
            <div className='Userslist d-flex align-items-center flex-column mt-5 h-75'>

                <h1>Permission denied</h1>
                <p>You don`t have permission to visit this page</p>
            </div>
        </div>

    );
}

export default PermissionError;
