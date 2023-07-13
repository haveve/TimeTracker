import React, { useEffect, useState } from 'react';
import { ListGroup, Pagination, Form, InputGroup, Button } from "react-bootstrap";
import '../Custom.css';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import { deleteUser, getPagedUsers, getUsers } from '../Redux/epics';
import { Link } from 'react-router-dom';
import { Page } from '../Redux/Types/Page';

function Userslist() {
    const first = 5;
    const [after, setAfter] = useState(0);
    const [search, setSearch] = useState('');
    const [orderfield, setOrderfield] = useState('');
    const [order, setOrder] = useState("ASC");
    const page = useSelector((state: RootState) => state.users.UsersPage);
    const dispatch = useDispatch();

    useEffect(() => {
        const page: Page = {
            first: first,
            after: after,
            search: search,
            orderfield: orderfield,
            order: order
        }
        dispatch(getPagedUsers(page));
    }, [after, orderfield, order]);

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
            orderfield: orderfield,
            order: order
        }
        dispatch(getPagedUsers(page));
    }
    return (
        <div className='Userslist d-flex align-items-center flex-column mt-5 h-75'>
            <h5>Users</h5>
            <div className="mb-3 w-50 d-flex">
                <InputGroup className="w-50 me-2">
                    <Form.Control
                        placeholder="Search"
                        aria-describedby="Search"
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => handleKeyDown(e)}
                    />
                    <Button variant="outline-secondary" id="Search" onClick={HandleSearch}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-search mb-1" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                        </svg>
                    </Button>
                </InputGroup>
                <InputGroup className="w-50 ">
                    <Form.Select onChange={e => { setOrderfield(e.target.value); console.log(e.target.value) }}>
                        <option value="">Sort by</option>
                        <option value="Login">Login</option>
                        <option value="FullName">Name</option>
                    </Form.Select>

                    <Button variant="outline-secondary" onClick={() => {order === "ASC" ? setOrder("DESC") : setOrder("ASC")}}>
                        {order === "ASC" ? 
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-sort-down mb-1" viewBox="0 0 16 16" >
                            <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z" />
                        </svg> :
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-sort-up mb-1" viewBox="0 0 16 16">
                            <path d="M3.5 12.5a.5.5 0 0 1-1 0V3.707L1.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 3.707V12.5zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z" />
                        </svg>
                        }
                    </Button>
                </InputGroup>
            </div>


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
            {page.totalCount > 0 ?
                <Pagination className='mt-auto'>
                    <Pagination.First onClick={() => setAfter(0)} />
                    <Pagination.Prev onClick={() => { if (page.pageIndex != 0) setAfter(after - first) }} />
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
                    <Pagination.Next onClick={() => { if (page.pageIndex != page.totalCount - 1) setAfter(after + first) }} />
                    <Pagination.Last onClick={() => setAfter((page.totalCount - 1) * first)} />
                </Pagination>
                : <p>No users found</p>
            }
        </div>
    );
}

export default Userslist;
