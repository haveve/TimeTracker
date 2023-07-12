import React, { useEffect, useState } from 'react';
import { ListGroup, Pagination } from "react-bootstrap";
import '../Custom.css';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import { deleteUser, getPagedUsers, getUsers } from '../Redux/epics';
import { Link } from 'react-router-dom';
import { Page } from '../Redux/Types/Page';

function Userslist() {
    const first = 1;
    const [after, setAfter] = useState(0);
    const page = useSelector((state: RootState) => state.users.UsersPage);
    const dispatch = useDispatch();

    useEffect(() => {
        const page: Page = {
            first: first,
            after: after
        }
        dispatch(getPagedUsers(page));
    }, [after]);

    return (
        <div className='Userslist d-flex align-items-center flex-column mt-5 h-75'>
            <h5>Users</h5>
            <ListGroup className='w-50 d-flex'>
                {
                    page.userList?.map((user) =>
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
            <Pagination className='mt-auto'>
                <Pagination.First onClick={() => setAfter(0)} />
                <Pagination.Prev onClick={() => {if(page.pageIndex != 0) setAfter(after - first)}} />
                {page.pageIndex < 3 ? <></> : (
                    <Pagination.Item onClick={() => setAfter(after - first * 3)}>{page.pageIndex - 2}</Pagination.Item>
                )
                }
                <Pagination.Ellipsis />
                {page.pageIndex === 0 ? <></> : (
                    <Pagination.Item onClick={() => setAfter(after - first)}>{page.pageIndex}</Pagination.Item>
                )
                }
                <Pagination.Item active>{page.pageIndex + 1}</Pagination.Item>
                {page.pageIndex === page.totalCount - 1 ? <></> : (
                    <Pagination.Item onClick={() => setAfter(after + first)}>{page.pageIndex + 2}</Pagination.Item>
                )
                }
                <Pagination.Ellipsis />
                {page.totalCount - 1 - page.pageIndex < 3 ? <></> : (
                    <Pagination.Item onClick={() => setAfter(after + first * 3)}>{page.pageIndex + 4}</Pagination.Item>
                )
                }
                <Pagination.Item disabled>{page.totalCount}</Pagination.Item>
                <Pagination.Next onClick={() => {if(page.pageIndex != page.totalCount - 1) setAfter(after + first)}} />
                <Pagination.Last onClick={() => setAfter((page.totalCount - 1) * first)} />
            </Pagination>
        </div>
    );
}

export default Userslist;
