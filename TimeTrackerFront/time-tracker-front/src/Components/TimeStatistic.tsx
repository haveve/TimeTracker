/// <reference types="react-scripts" />
import React, { useState } from 'react';
import { Container, Nav, Image, Dropdown, Pagination, Accordion, Navbar, NavDropdown, Button, Offcanvas, Form, ListGroup, ProgressBar, Card, Col, Row, Alert } from "react-bootstrap";
import '../Custom.css';
import '../TimeTrack.css'
import picture from '../Pictures/clock-picture-very-awsome.png'
import dayImg from '../Pictures/day-session-img.png'
import weekImg from '../Pictures/week-session-img.png'
import monthImg from '../Pictures/month-session-img.png'
import { Link, Outlet } from 'react-router-dom';
import { Subscription, timer } from 'rxjs';
import Clock from 'react-clock';
import '../Clock.css'
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import { setTimeE } from '../Redux/epics';
import { useEffect } from 'react';
import TimeTracker, { TimeStringFromSeconds } from './TimeTracker'
import { RequestGetTotalWorkTime } from '../Redux/Requests/TimeRequests';
import { getCookie } from '../Login/Api/login-logout';
import { CalendarUserPage } from '../Redux/Requests/CalendarRequest';
import { TimeMark } from '../Redux/Types/Time';
import { setloadingStatus } from '../Redux/Slices/TimeSlice';

export const itemsInPage = 3;

export default function TimeStatistic() {
    const [totalWorkTime, setTotalWorkTime] = useState(0);
    const [timeMarks, setTimeMarks] = useState<TimeMark[]>([]);

    const [page, setPage] = useState(0);
    const [error, setError] = useState('');

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setloadingStatus());
        dispatch(setTimeE(timeMarks, page, itemsInPage));

    }, [])

    useEffect(() => {
        dispatch(setTimeE(timeMarks, page, itemsInPage));

    }, [page,timeMarks])

    useEffect(() => {
        RequestGetTotalWorkTime(parseInt(getCookie("user_id")!)).subscribe((x) => {
            setTotalWorkTime(x);
        })
    }, []);

    const time = useSelector((state: RootState) => state.time.time);

    return <Container fluid className='p-0  m-0 h-100'>
        <Row className='justify-content-between p-0 m-0 h-100'>
            <Col className=' p-0 m-0 pt-2'>
                <Row className='p-0 m-0'>
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
                <Row className='p-0 m-0 pt-2'>
                    <Col>
                        <Card>
                            <Card.Body className='d-flex p-0 '>
                                <div className='d-flex flex-row w-100 justify-content-between p-3'>
                                    <ProgressBar now={(time.time.monthSeconds / totalWorkTime) * 100} animated className='w-75 h-100' variant='success' />
                                    <div className='w-25 text-center'>
                                        {TimeForStatisticFromSeconds(time.time.monthSeconds)} / {TimeForStatisticFromSeconds(totalWorkTime)}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row className='mt-2 p-0 m-0'>
                    <Row className='flex flex-column p-0 m-0 justify-content-center'>
                        <Col className='h3 text-center text-secondary gap-2 d-flex flex-row justify-content-center'>
                            <Col xs={7} className='d-flex flex-row justify-content-end'> Time session</Col>
                            <Col className='d-flex flex-row justify-content-start'>
                                <Dropdown>
                                    <Dropdown.Toggle variant='dark'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-gear" viewBox="0 0 16 16">
                                            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
                                            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
                                        </svg>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu title='sdgd'>
                                        <div className='d-flex flex-row justify-content-start gap-2 ps-3' onChange={() => {
                                            if (timeMarks.some(t => t === TimeMark.Day))
                                                setTimeMarks(t => t.filter(t => t !== TimeMark.Day))
                                            else
                                                setTimeMarks(t => [...t, TimeMark.Day])
                                        }}>Today<Form.Check></Form.Check></div>
                                        <div className='d-flex flex-row justify-content-start gap-2 ps-3' onChange={() => {
                                            if (timeMarks.some(t => t === TimeMark.Week))
                                                setTimeMarks(t => t.filter(t => t !== TimeMark.Week))
                                            else
                                                setTimeMarks(t => [...t, TimeMark.Week])
                                        }}>Current Week<Form.Check></Form.Check></div>
                                        <div className='d-flex flex-row justify-content-start gap-2 ps-3'onChange={() => {
                                            if (timeMarks.some(t => t === TimeMark.Month))
                                                setTimeMarks(t => t.filter(t => t !== TimeMark.Month))
                                            else
                                                setTimeMarks(t => [...t, TimeMark.Month])
                                        }}>Current Month<Form.Check></Form.Check></div>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                        </Col>
                        {time.time.sessions.map(s => {
                            const image = <Image height={45} src={s.timeMark === TimeMark.Day ? dayImg : s.timeMark === TimeMark.Week ? weekImg : monthImg}></Image>
                            const bgColor = s.endTimeTrackDate ? "primary" : "danger";
                            const endDate = s.endTimeTrackDate ? s.endTimeTrackDate.toLocaleString() : "----------"
                            return <Col className={`m-0 `} ><Alert className={`pt-2 ps-2 mb-2 m-0`} variant={bgColor}>
                                <Row>
                                    <Col sm={1}>
                                        {image}
                                    </Col>
                                    <Col>
                                        <span>Start Date<br />{s.startTimeTrackDate.toLocaleString()}</span>
                                    </Col>
                                    <Col>
                                        <span>End Date<br /><span>{endDate}</span></span>
                                    </Col>
                                        <Col sm={2} className='d-flex align-items-center justify-content-end ' >
                                            <Button variant={`${s.endTimeTrackDate?"outline-info":"outline-danger"} h-75 my-2`} disabled = {s.endTimeTrackDate?false:true}>Edit</Button>
                                        </Col>
                                </Row>
                            </Alert></Col>
                        })}
                    </Row>
                    <Pagination className='mt-auto  justify-content-between p-0 m-0 d-flex'>
                        <Col className='mt-auto justify-content-start ms-4 p-0 m-0 d-flex'>
                            <Pagination.First onClick={() => setPage(0)} />
                            <Pagination.Prev onClick={() => { if (page != 0) setPage(n => n - 1) }} />
                        </Col>
                        <Pagination.Item active>{page + 1}</Pagination.Item>
                        <Col className='mt-auto justify-content-end me-4 p-0 d-flex'>
                            <Pagination.Next onClick={() => { if (page != Math.ceil(time.itemsCount / itemsInPage) - 1) setPage(n => n + 1) }} />
                            <Pagination.Last onClick={() => setPage(Math.ceil(time.itemsCount / itemsInPage) - 1)} />
                        </Col>
                    </Pagination>
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