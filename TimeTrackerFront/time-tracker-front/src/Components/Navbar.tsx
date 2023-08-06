import React, { useEffect, useState } from 'react';
import {
  Container,
  Col,
  Row,
  Nav,
  Navbar,
  NavDropdown,
  Button,
  Offcanvas,
  Form,
  ListGroup,
  ListGroupItem
} from "react-bootstrap";
import { useSelector, useDispatch } from 'react-redux';
import { Link, Outlet } from 'react-router-dom';
import TimeTracker from './TimeTracker';


import { GetLocation } from '../Redux/Requests/CalendarRequest';
import CheckModalWindow from './CheckModalWindow';
import NotificationModalWindow, { MasssgeType } from './NotificationModalWindow';
import { clearErroMassage as clearErroMassageTime } from '../Redux/Slices/TimeSlice';
import { deleteCookie, getCookie, setCookie } from '../Login/Api/login-logout';
import { getCurrentUser } from '../Redux/epics';
import { RootState } from '../Redux/store';
import { clearErroMassage as clearErroMassageUserList } from '../Redux/Slices/UserSlice';
import { setErrorStatusAndError, setLocation, changeLocation } from '../Redux/Slices/LocationSlice';

import '../Custom.css';
import { setErrorStatusAndError as setErroMassageLocation,clearErroMassage as clearErroMassageLocation, setloadingStatus as setloadingStatusLocation } from '../Redux/Slices/LocationSlice';
import { ErrorMassagePattern } from '../Redux/epics';
import { boolean } from 'yup';

function AppNavbar() {
  const errorTime = useSelector((state: RootState) => state.time.error ? state.time.error : "");
  const errorUserList = useSelector((state: RootState) => state.users.error ? state.users.error : "");

  const errorLocation = useSelector((state: RootState) => state.location.error ? state.location.error : "");

  const listOfTimeZones = useSelector((state:RootState)=>{
    return state.location.listOfTimeZones
  })
  const geoOffset = useSelector((state:RootState)=>{
    return state.location.userOffset
  })

  const [canUserApi, setCanUserApi] = useState("")


  const dispatch = useDispatch();
  useEffect(() => {
    const canUseUserIp = getCookie("canUseUserIp")

    if (canUseUserIp && canUseUserIp === "true") {
      GetLocation().subscribe({
        next: (value) => {

          dispatch(setLocation({
            oldOffset:geoOffset,
            userOffset: value.timezone.gmt_offset * 60,
            timeZone: {
              name: `${value.city} (${value.country_code})`,
              value: value.timezone.gmt_offset * 60
            }
          }))
          setCookie({ name: "canUseUserIp", value: 'true' })
        },
        error: () => setErroMassageLocation(ErrorMassagePattern)
      })
    }
    else if(!canUseUserIp){
      setCanUserApi("Can we use your IP to locate you?")
    }

var id = getCookie("user_id");
dispatch(getCurrentUser(parseInt(id!)));
  }, []);
let user = useSelector((state: RootState) => state.currentUser.User);

return (
  <Container fluid className='p-0 m-0 h-100'>
    <Navbar expand={false} className="bg-black height-header">
      <Container fluid className='justify-content-start'>
        <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-false`} />
        <Navbar.Brand as={Link} to={"/"} className='ms-1'>TimeTracker</Navbar.Brand>
        <Button variant='dark' onClick={()=>{
                    const list = listOfTimeZones.filter(l => l.value === geoOffset)
                    const name = list[1]?list[1].name:list[0].name
                    const obj = listOfTimeZones.filter(l => l.name !== name)[0]
                    if(obj)
                    dispatch(changeLocation({oldOffSet:geoOffset,newOffSet:obj.value}))
                }}> 
                {(function () {
                    const list = listOfTimeZones.filter(l => l.value === geoOffset)
                    return list[1]?list[1].name:list[0].name
                })()}
            </Button>
        <Nav.Link as={Link} to={user ? "/User/" + user.login : "/Login"} className='ms-auto'>{user ? user.login : "sign in"}</Nav.Link>
        <Navbar.Offcanvas
          id={`offcanvasNavbar-expand-false`}
          aria-labelledby={`offcanvasNavbarLabel-expand-false`}
          placement="start"
          data-bs-theme="dark"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id={`offcanvasNavbarLabel-expand-false`}>
              TimeTracker
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              <ListGroup>
                <ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'><Nav.Link as={Link} to={"/Users"} className='m-0'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-people me-1 mb-1" viewBox="0 0 16 16">
                    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816ZM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
                  </svg>
                  Users
                </Nav.Link></ListGroup.Item>
                <ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'><Nav.Link as={Link} to={"/CreateUser"} className='m-0'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus me-1 mb-1" viewBox="0 0 16 16">
                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                    <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z" />
                  </svg>
                  Create user
                </Nav.Link></ListGroup.Item>
                <ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'>
                  <Nav.Link as={Link} to={"/Calendar"} className='m-0'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar me-1 mb-1" viewBox="0 0 16 16">
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                    </svg>
                    Calendar
                  </Nav.Link>
                </ListGroup.Item>
                <ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'>
                  <Nav.Link as={Link} to={"/ApproversSetup"} className='m-0'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                      fill="currentColor" className="bi bi-person-plus me-1 mb-1"
                      viewBox="0 0 16 16">
                      <path
                        d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                      <path fillRule="evenodd"
                        d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z" />
                    </svg>
                    Setup approvers
                  </Nav.Link>
                </ListGroup.Item>
              </ListGroup>
            </Nav>
          </Offcanvas.Body>
          <Nav className="justify-content-center ps-2 mb-3 flex flex-grow-1">
            <ListGroup className="justify-content-end flex flex-grow-1 pe-3 ">
              <ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'><Nav.Link as={Link} to={"/Login"} className='m-0'
                onClick={() => {
                  deleteCookie("access_token");
                  deleteCookie("canUseUserIp");
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-left me-1 mb-1" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z" />
                  <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z" />
                </svg>
                Logout</Nav.Link></ListGroup.Item>
            </ListGroup>
          </Nav>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
    <Row className='justify-content-end p-0 m-0 height-main h-100 '>
      <Col className='p-0 m-0 h-100 '>
        <Outlet />
      </Col>
    </Row >
    <CheckModalWindow isShowed={canUserApi !== ""} dropMassege={setCanUserApi} messegeType={MasssgeType.Warning} agree={() => {
      GetLocation().subscribe({
        next: (value) => {

          dispatch(setLocation({
            oldOffset:geoOffset,
            userOffset: value.timezone.gmt_offset * 60,
            timeZone: {
              name: `${value.city} (${value.country_code})`,
              value: value.timezone.gmt_offset * 60
            }
          }))
          setCookie({ name: "canUseUserIp", value: 'true' })
        },
        error: () => setErroMassageLocation(ErrorMassagePattern)
      })
    }} reject={() => {
      setCookie({ name: "canUseUserIp", value: 'false' })
    }}>{canUserApi}</CheckModalWindow>
    <NotificationModalWindow isShowed={errorTime !== ""} dropMassege={() => dispatch(clearErroMassageTime())} messegeType={MasssgeType.Error}>{errorTime}</NotificationModalWindow>
    <NotificationModalWindow isShowed={errorUserList !== ""} dropMassege={() => dispatch(clearErroMassageUserList())} messegeType={MasssgeType.Error}>{errorUserList}</NotificationModalWindow>
    <NotificationModalWindow isShowed={errorLocation !== ""} dropMassege={() => dispatch(clearErroMassageLocation())} messegeType={MasssgeType.Error}>{errorLocation}</NotificationModalWindow>

  </Container>
);
}

export default AppNavbar;
