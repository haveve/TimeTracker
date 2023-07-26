import {Button, Col, Form, InputGroup, ListGroup, ListGroupItem, Pagination, Row} from "react-bootstrap";
import {Link} from "react-router-dom";

import React, {useEffect, useState} from "react";
import {RootState} from "../Redux/store";
import {useDispatch, useSelector} from "react-redux";
import {addApprover, deleteApprover, getApprovers, getUsers, getUsersBySearch} from "../Redux/epics";
import {User} from "../Redux/Types/User";
import {Console} from "inspector";
import {ApproverNode} from "../Redux/Types/ApproverNode";
import {RequestAddApprover, RequestDeleteApprover} from "../Redux/Requests/VacationRequests";
import app from "../App";


export default function ApproversSetup() {

    const [rerender, setRerender] = useState(0);
    const [showFirstList, setShowFirstList] = useState(true);

    const [search, setSearch] = useState("");
    let userList = useSelector((state: RootState) => state.users.UsersBySearch);
    const initUser = {} as User;
    const [requester, setRequester] = useState<User>(initUser);


    const approversList = useSelector((state: RootState) => state.vacation.approvers);


    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getUsersBySearch(search));
        if (requester !== undefined && requester.id !== undefined && requester.id > 0) {
            dispatch(getApprovers(requester.id));
        }

    }, [search, requester, rerender]);
    const PickClickHandler = (event: React.MouseEvent, user: User) => {
        setRequester(user);
        setSearch("");
        setShowFirstList(false);
    }
    const AddApproverClickHandler = (event: React.MouseEvent, user: User) => {
        RequestAddApprover({requesterId: Number(requester.id), approverId:Number(user.id)}).subscribe();
    }
    const UnPickClickHandler = (event: React.MouseEvent) => {
        setShowFirstList(true);
    }
    const RemoveClickHandler = (event: React.MouseEvent, user: User) => {
        //setDeletionApprover(user);
        const approverNode = {approverId: user.id, requesterId: requester.id} as ApproverNode;

        RequestDeleteApprover(approverNode).subscribe();
        setRerender(rerender + 1);
    }
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            setShowFirstList(true);
            HandleSearch();
        }
    }
    const HandleSearch = () => {
        setShowFirstList(true);
        dispatch(getUsersBySearch(search));
    }


    return (<>
        <div className='Userslist d-flex align-items-center flex-column mt-5 h-75'>
            <h5>Select the user for which you will configure the list of approvers</h5>
            <div className="mb-3 w-75 d-flex">
                <Row className='m-0 p-0 w-100' style={{justifyContent: "center"}}>
                    <Col className='m-0 p-0 me-2' sm={7}>
                        <InputGroup>
                            <Form.Control
                                placeholder="Search"
                                aria-describedby="Search"
                                value={search}
                                onChange={e => {
                                    setSearch(e.target.value);
                                    setShowFirstList(true);
                                }}
                                onKeyDown={e => handleKeyDown(e)}
                            />
                            <Button variant="outline-secondary" id="Search" onClick={() => HandleSearch()}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                     className="bi bi-search mb-1" viewBox="0 0 16 16">
                                    <path
                                        d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                </svg>
                            </Button>
                        </InputGroup>
                    </Col>

                </Row>
            </div>

            <ListGroup className="w-75 d-flex">
                {
                    showFirstList ?
                        userList.map((user) =>

                            <ListGroupItem key={user.id}
                                           className='d-flex flex-row align-items-center justify-content-between rounded-2 mb-1'>
                                <div className='w-75'>
                                    <p className='m-0 fs-5'>{user.fullName}</p>
                                </div>
                                <Button
                                    variant="outline-primary"
                                    onClick={(event) => PickClickHandler(event, user)}>
                                    Pick
                                </Button>
                            </ListGroupItem>
                        )
                        :
                        <ListGroupItem key={requester.id}
                                       className='d-flex flex-row bg-danger-subtle align-items-center justify-content-between rounded-2 mb-1'>
                            <div className='w-75'>
                                <p className='m-0 fs-5'>{requester.fullName}</p>
                            </div>
                            <Button
                                variant="outline-primary"
                                onClick={(event) => UnPickClickHandler(event)}>
                                Pick other person
                            </Button>
                        </ListGroupItem>
                }
            </ListGroup>

            {showFirstList ? true :
                <>
                    <h5>Selected approvers</h5>
                    <ListGroup>
                        {
                            approversList.map((user) =>

                                <ListGroupItem key={user.id}
                                               className='d-flex flex-row align-items-center justify-content-between rounded-2 mb-1'>
                                    <div className='w-75'>
                                        <p className='m-0 fs-5'>{user.fullName}</p>
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        onClick={(event) => RemoveClickHandler(event, user)}>
                                        Remove from approvers
                                    </Button>
                                </ListGroupItem>
                            )
                        }
                    </ListGroup>


                    <h5>Select approvers for picked user</h5>
                    <div className="mb-3 w-75 d-flex">
                        <Row className='m-0 p-0 w-100' style={{justifyContent: "center"}}>
                            <Col className='m-0 p-0 me-2' sm={7}>
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Search"
                                        aria-describedby="Search"
                                        value={search}
                                        onChange={e => {
                                            setSearch(e.target.value);
                                            setShowFirstList(true);
                                        }}
                                        onKeyDown={e => handleKeyDown(e)}
                                    />
                                    <Button variant="outline-secondary" id="Search" onClick={() => HandleSearch()}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                             fill="currentColor"
                                             className="bi bi-search mb-1" viewBox="0 0 16 16">
                                            <path
                                                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                        </svg>
                                    </Button>
                                </InputGroup>
                            </Col>

                        </Row>
                    </div>
                    <ListGroup className="w-50 d-flex">
                        {userList.map((user) => {
                             {
                                 console.log(user)
                                 console.log(approversList[0])
                                if(user=== approversList[0])
                                    console.log(true);
                                return (<ListGroupItem key={user.id}
                                                       className='d-flex flex-row align-items-center justify-content-between rounded-2 mb-1'>
                                    <div className='w-75'>
                                        <p className='m-0 fs-5'>{user.fullName}</p>
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        onClick={(event) => PickClickHandler(event, user)}>
                                        Add
                                    </Button>
                                </ListGroupItem>)
                            }
                        })}
                    </ListGroup>
                </>
            }


        </div>
    </>)
}