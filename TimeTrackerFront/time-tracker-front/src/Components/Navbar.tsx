import React from 'react';
import {Container, Nav, Navbar, NavDropdown, Button, Offcanvas, Form, ListGroup, ListGroupItem } from "react-bootstrap";
import '../Custom.css';
 import { Link, Outlet } from 'react-router-dom';

function AppNavbar() {
  return (
    <>
      <Navbar expand={false} className="bg-black mb-3">
          <Container fluid className='justify-content-start'>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-false`}/>
            <Navbar.Brand as={Link} to={"/"} className='ms-1'>TimeTracker</Navbar.Brand>
            <Nav.Link as={Link} to={"/User"} className='ms-auto'>User</Nav.Link>
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
                    <ListGroup.Item action className='border-0 rounded-1 p-0 ps-2'><Nav.Link as={Link} to={"/Login"} className='m-0'>Login</Nav.Link></ListGroup.Item>
                  </ListGroup>
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
      </Navbar>
      <Outlet />
    </>
  );
}

export default AppNavbar;
