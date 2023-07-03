import React from 'react';
import {Container, Nav, Navbar, NavDropdown, Button, Card, Table } from "react-bootstrap";
import { Link } from 'react-router-dom';
import '../Custom.css';

function AppNavbar() {
  return (
    <Navbar expand="lg" bg='green1' data-bs-theme="dark">
      <Container>
        <Navbar.Brand><Link to="/Home" style={{color: 'inherit', textDecoration: 'none'}}>TimeTracker</Link></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link to="/Users" style={{color: 'inherit', textDecoration: 'none'}}>Users</Link>
          </Nav>
          <Nav>
            <Link to="/Login" style={{color: 'inherit', textDecoration: 'none'}}>Login</Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
