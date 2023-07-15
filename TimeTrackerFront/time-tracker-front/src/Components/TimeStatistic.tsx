/// <reference types="react-scripts" />
import React, { useState } from 'react';
import { Container, Nav, Image, Accordion, Navbar, NavDropdown, Button, Offcanvas, Form, ListGroup, ListGroupItem, Card, Col, Row } from "react-bootstrap";
import '../Custom.css';
import '../TimeTrack.css'
import picture from '../Pictures/clock-picture-very-awsome.png'
import { Link, Outlet } from 'react-router-dom';
import { Subscription, timer } from 'rxjs';
import Clock from 'react-clock';
import '../Clock.css'
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import { setTimeE } from '../Redux/epics';
import { useEffect } from 'react';
import TimeTracker, { TimeStringFromSeconds } from './TimeTracker'


export default function TimeStatistic() {

    const time = useSelector((state: RootState) => state.time.time);

    return <Container fluid className='p-0 m-0 h-100'>
            <Row className='justify-content-between flex flex-row p-0 m-0 h-100'>
                <Col className='  p-0 m-0 pt-2'>
                    <Row className='  p-0 m-0'>
                    <Col>
                        <Card>
                            <Card.Body className='d-flex flex-row p-0 justify-content-between time-card-color1 rounded'>
                                <div className='p-3 pe-0'><p className='garamond-font time-stat-title-font-size'>Time in Day</p> <span className='garamond-font time-stat-content-font-size'>{TimeForStatisticFromSeconds(time.time.daySeconds)}</span></div>
                                <Image height={90} src={picture}></Image>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                        <Card>
                            <Card.Body className='d-flex flex-row justify-content-between p-0 time-card-color2 rounded'>
                                <div className='p-3 pe-0'><p className='garamond-font time-stat-title-font-size'>Time in Week</p> <span className='garamond-font time-stat-content-font-size'>{TimeForStatisticFromSeconds(time.time.weekSeconds)}</span></div>
                                <Image height={90} src={picture}></Image>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                        <Card>
                            <Card.Body className='d-flex flex-row p-0 justify-content-between time-card-color3 rounded'>
                                <div className='p-3 pe-0'><p className='garamond-font time-stat-title-font-size'>Time in Month</p> <span className='garamond-font time-stat-content-font-size'>{TimeForStatisticFromSeconds(time.time.monthSeconds)}</span></div>
                                <Image height={90} src={picture}></Image>
                            </Card.Body>
                        </Card>
                    </Col>
                    </Row>
                </Col>
                <Col className='p-0 m-0 h-100' md={3} lg={3}>
                    <TimeTracker />
                </Col>
            </Row>
        </Container>
}

export function TimeForStatisticFromSeconds(seconds: number) {
    const time = TimeStringFromSeconds(seconds);
    return `${time.hours}h ${time.minutes < 10 ? 0 : ''}${time.minutes}m`
}