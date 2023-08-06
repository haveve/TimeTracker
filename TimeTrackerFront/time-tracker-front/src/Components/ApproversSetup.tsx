import {Button, Col, Form, InputGroup, ListGroup, ListGroupItem, Pagination, Row} from "react-bootstrap";

import React, {useCallback, useEffect, useReducer, useState} from "react";
import {RootState} from "../Redux/store";
import {useDispatch, useSelector} from "react-redux";
import {addApprover, addApproverEpic, deleteApprover, getApprovers, getUsers, getUsersBySearch} from "../Redux/epics";
import {User} from "../Redux/Types/User";
import {ApproverNode} from "../Redux/Types/ApproverNode";
import {forEach} from "react-bootstrap/ElementChildren";
import {useNavigate} from "react-router-dom";


export default function ApproversSetup() {


  const [requesterPicked, setRequesterPicked] = useState(false);

  const [search, setSearch] = useState("");

  let userList = useSelector((state: RootState) => state.users.UsersBySearch);
  const initUser = {id: -1} as User;
  const [requester, setRequester] = useState<User>(initUser);


  const approversList = useSelector((state: RootState) => state.vacation.approvers);

  if (requester.id !== initUser.id) {
    userList = userList.filter((item) => !approversList.some((el) => el.id === item.id));
    userList = userList.filter((item) => item.id !== requester.id);
  }

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUsersBySearch(search));
    if (requester !== undefined && requester.id !== undefined && requester.id > 0) {
      dispatch(getApprovers(requester.id));
    }

  }, [search, requester, dispatch]);
  const PickClickHandler = (event: React.MouseEvent, user: User) => {
    setRequester(user);
    setSearch("");
    setRequesterPicked(true);
  }
  const AddApproverClickHandler = (event: React.MouseEvent, user: User) => {
    const approverNode = {approverId: user.id, requesterId: requester.id} as ApproverNode;
    dispatch(addApprover(approverNode));
  }
  const UnPickClickHandler = (event: React.MouseEvent) => {
    setRequesterPicked(false);
    setRequester(initUser);
  }
  const RemoveClickHandler = (event: React.MouseEvent, user: User) => {
    const approverNode = {approverId: user.id, requesterId: requester.id} as ApproverNode;
    dispatch(deleteApprover(approverNode));
  }
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      HandleSearch();
    }
  }
  const HandleSearch = () => {
    dispatch(getUsersBySearch(search));
  }


  return (<>
    <Button variant='dark' className='ms-2 me-auto' onClick={() => navigate(-1)}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
           className="bi bi-arrow-90deg-left" viewBox="0 0 16 16">
        <path fillRule="evenodd"
              d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z"/>
      </svg>
    </Button>
    {requesterPicked ?
      <div className='Userslist d-flex align-items-center flex-column mt-5 h-75'>

        <ListGroup className="w-75 d-flex">
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
        </ListGroup>
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

        <h5>Select approvers for person</h5>
        <Row className='mb-3 w-75 d-flex m-0 p-0 w-100' style={{justifyContent: "center"}}>
          <Col className='m-0 p-0 me-2' sm={7}>
            <InputGroup>
              <Form.Control
                placeholder="Search"
                aria-describedby="Search"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
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

        <ListGroup className={"w-75 d-flex"}>
          {userList.map((user) =>

            <ListGroupItem key={user.id}
                           className='d-flex flex-row align-items-center justify-content-between rounded-2 mb-1'>
              <div className='w-75'>
                <p className='m-0 fs-5'>{user.fullName}</p>
              </div>
              <Button
                variant="outline-primary"
                onClick={(event) => AddApproverClickHandler(event, user)}>
                Pick
              </Button>
            </ListGroupItem>
          )}
        </ListGroup>
      </div>
      :
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
                    setRequesterPicked(false);
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
        <ListGroup className={"w-75 d-flex"}>
          {userList.map((user) =>

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
          )}
        </ListGroup>
      </div>
    }

  </>)
}