import React from 'react';
import { Container, Col, Row, Nav, Navbar, NavDropdown, Button, Offcanvas, Form, ListGroup, ListGroupItem } from "react-bootstrap";
import '../Custom.css';
import { Link, Outlet } from 'react-router-dom';
import TimeTracker from './TimeTracker';
import { deleteCookie } from '../Login/Api/login-logout';
import NotificationModalWindow, { MasssgeType } from './NotificationModalWindow';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { clearErroMassage } from '../Redux/Slices/TimeSlice';

function AppNavbar() {
  const user = JSON.parse(localStorage.getItem("User")!);
  const error = useSelector((state:RootState)=>state.time.error?state.time.error:"");
  const dispatcher = useDispatch();

  return (
    <Container fluid className='p-0 h-100'>
      <Navbar expand={false} className="bg-black height-header">
        <Container fluid className='justify-content-start'>
          <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-false`} />
          <Navbar.Brand as={Link} to={"/"} className='ms-1'>TimeTracker</Navbar.Brand>
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
                  <ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'><Nav.Link as={Link} to={"/Users"} className='m-0'>Users</Nav.Link></ListGroup.Item>
                  <ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'><Nav.Link as={Link} to={"/CreateUser"} className='m-0'>Create user</Nav.Link></ListGroup.Item>
                </ListGroup>
              </Nav>
            </Offcanvas.Body>
            <Nav className="justify-content-center ps-2 mb-3 flex flex-grow-1">
                <ListGroup className="justify-content-end flex flex-grow-1 pe-3 ">
                  <ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'><Nav.Link as={Link} to={"/Login"} className='m-0'
                    onClick={() => {
                      deleteCookie("access_token");
                    }}>Logout</Nav.Link></ListGroup.Item>
                </ListGroup>
              </Nav>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      <Row className='justify-content-end p-0 m-0 height-main'>
        <Col className='p-0 m-0 h-100'>
          <Outlet />
        </Col>
      </Row >
      <NotificationModalWindow isShowed = {error !== ""} dropMassege={()=>dispatcher(clearErroMassage())} messegeType={MasssgeType.Error}>{error}</NotificationModalWindow>
    </Container>
  );
}

export default AppNavbar;
