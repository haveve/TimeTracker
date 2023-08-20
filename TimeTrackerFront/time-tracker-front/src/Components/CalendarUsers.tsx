import React, { useEffect, useState } from 'react';
import { ListGroup, Pagination, Form, InputGroup, Button, Row, Col, Overlay, Tooltip, Modal } from "react-bootstrap";
import '../Custom.css';
import { GetCalendarUsers, CalendarUserPage } from '../Redux/Requests/CalendarRequest';
import { ErrorMassagePattern } from '../Redux/epics';
import NotificationModalWindow, { MasssgeType } from './NotificationModalWindow';

function CalendarUserslist(props: { isShowed: boolean, setShowed: (value: boolean) => void, setUserIndex: (id: number | null) => void }) {
    const itemsInPage = 4;
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [calendarUserList, setCalendarUserList] = useState<CalendarUserPage>({ count: 0, calendarUsers: [] });

    const [error, setError] = useState('');

    useEffect(() => {
        GetCalendarUsers(page, itemsInPage, search).subscribe({
            next: (value) => setCalendarUserList(value),
            error: () => setError(ErrorMassagePattern)
        })
    }, [page, search])

    return (
        <Modal
            centered
            size='xl'
            show={props.isShowed}
            onHide={() => props.setShowed(!props.isShowed)}
            data-bs-theme="dark"
        >
            <Modal.Header closeButton>
                <Modal.Title>Select User Calendar</Modal.Title>
            </Modal.Header>
            <div className='Userslist d-flex align-items-center flex-column mt-3 h-75'>
                <div className="mb-3 w-75 d-flex">
                    <Row className='m-0 p-0 w-100'>
                        <Col className='m-0 p-0 me-2' sm={7}>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Search"
                                    aria-describedby="Search"
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col className='justify-content-end gap-2 d-flex m-0 p-0'>
                            <Button variant='outline-success' onClick={() => props.setUserIndex(-1)}>
                                Manage Calendar
                            </Button>
                            <Button variant='outline-success' onClick={() => props.setUserIndex(null)}>
                                Back to me
                            </Button>
                        </Col>
                    </Row>
                </div>
                <ListGroup className='w-75 d-flex gap-1'>
                    {
                        calendarUserList.calendarUsers?.map((user) =>
                            <ListGroup.Item key={user.id} className='d-flex flex-row align-items-center justify-content-between rounded-2 mb-1'>
                                <div className='w-50'>
                                    <p className='m-0 fs-5'>{user.fullName}</p>
                                    <p className='m-0 fs-5'>{user.email}</p>
                                </div>
                                <Button variant='outline-success' onClick={() => props.setUserIndex(user.id)}>
                                    Select
                                </Button>
                            </ListGroup.Item>
                        )
                    }
                </ListGroup>
                {calendarUserList.count > 0 ?
                    <Pagination className='mt-auto'>
                        <Pagination.First onClick={() => setPage(0)} />
                        <Pagination.Prev onClick={() => { if (page != 0) setPage(n => n - 1) }} />
                        <Pagination.Item active>{page + 1}</Pagination.Item>
                        <Pagination.Next onClick={() => { if (page != Math.ceil(calendarUserList.count / itemsInPage) - 1) setPage(n => n + 1) }} />
                        <Pagination.Last onClick={() => setPage(Math.ceil(calendarUserList.count / itemsInPage) - 1)} />
                    </Pagination>
                    : <p>No users found</p>
                }
                <NotificationModalWindow isShowed={error !== ""} dropMassege={setError} messegeType={MasssgeType.Error}>{error}</NotificationModalWindow>
            </div>
        </Modal>
    );
}

export default CalendarUserslist;