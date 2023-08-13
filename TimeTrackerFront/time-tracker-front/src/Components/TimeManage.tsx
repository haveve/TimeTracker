/// <reference types="react-scripts" />
import React, { useState } from 'react';
import { Container, Nav, Image, Alert, FloatingLabel, Modal, Accordion, Navbar, NavDropdown, Button, Offcanvas, Form, ListGroup, ListGroupItem, Card, Col, Row } from "react-bootstrap";
import '../Custom.css';
import { useSelector, useDispatch } from 'react-redux';
import { Time } from './../Redux/Types/Time';
import { useImmer } from 'use-immer';
import { TimeStringFromSeconds } from './TimeTracker';
import NotificationModalWindow from './NotificationModalWindow';
import { MasssgeType } from './NotificationModalWindow';
import CheckModalWindow from './CheckModalWindow';
import { User } from './../Redux/Types/User';
import { setloadingStatus } from './../Redux/Slices/UserSlice';
import { Session } from './../Redux/Types/Time';
import { RootState } from './../Redux/store';
import { IsSuccessOrIdle } from './TimeTracker';
import { updateTime, setErrorStatusAndError, setIdleStatus } from '../Redux/Slices/TimeSlice';
import { RequestUpdateDate } from '../Redux/Requests/TimeRequests';
import { ErrorMassagePattern } from '../Redux/epics';
import { locationOffset } from '../Redux/Slices/LocationSlice';
import { getStartOfWeekByCountry } from '../Redux/Slices/LocationSlice';

export const startLessEnd = "Start date of time period must be less then End"
export const existedStartDate = "There is occured error. Maybe you chose start date of session that already exist. If you could not resolved issue, turn to colsole and administrator"
export default function TimeManage(props: { isShowed: boolean, setShow: (show: boolean) => void, selected: Session, setSelected: (selected: null) => void }) {

    const [toUpdate, setToUpdate] = useState<Session>({ ...props.selected })
    const [error, setError] = useState("");
    const [success, SetSuccess] = useState("");

    const timeError = useSelector((state: RootState) => {
        return state.time.error
    })

    const timeStatus = useSelector((state: RootState) => {
        return state.time.status
    })

    const offSet = useSelector((state: RootState) => {
        return state.location.userOffset
    })

    const coutry = useSelector((state: RootState) => {
        return state.location.country
    })

    const dispatch = useDispatch()

    return <Modal show={props.isShowed}
        onHide={() => {
            props.setSelected(null)
            props.setShow(!props.isShowed)
        }}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        data-bs-theme="dark"
    >
        <Modal.Header closeButton>
            <Modal.Title>
                Time Manage
            </Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <Row>
                <Col>
                    <Form.Label>StartDate</Form.Label>
                    <input type="datetime-local"
                        value={new Date(toUpdate.startTimeTrackDate.getTime() + locationOffset * 60000).toISOString().slice(0, 16)}
                        className='w-100 h-50 bg-dark rounded-3 border-info p-2 text-light'
                        onChange={(e) => {
                            setToUpdate(up => {
                                const startTimeTrackDate = new Date(e.target.value)
                                return { ...up, startTimeTrackDate };
                            })
                        }}>

                    </input>
                </Col>
                <Col>
                    <Form.Label>EndDate</Form.Label>
                    <input type="datetime-local"
                        value={new Date(toUpdate.endTimeTrackDate!.getTime() + locationOffset * 60000).toISOString().slice(0, 16)}
                        className='w-100 h-50 bg-dark rounded-3 border-info p-2 text-light'
                        onChange={(e) => {
                            setToUpdate(up => {
                                const endTimeTrackDate = new Date(e.target.value)
                                return { ...up, endTimeTrackDate };
                            })
                        }}>
                    </input>
                </Col>
            </Row>
        </Modal.Body>

        <Modal.Footer>
            <Button variant='outline-secondary'
                onClick={
                    () => setToUpdate(props.selected)
                }>
                Cancel
            </Button>
            <Button variant='outline-success'
                onClick={() => {
                    if (toUpdate.endTimeTrackDate!.getTime() <= toUpdate.startTimeTrackDate!.getTime()) {
                        setError(startLessEnd)
                        return;
                    }
                    RequestUpdateDate({...props.selected}, {...toUpdate}, offSet,getStartOfWeekByCountry(coutry)).subscribe({
                        next: (value) => {
                            SetSuccess('Session was succesfully updated')
                            dispatch(updateTime({
                                ...value
                            }))
                        },
                        error: (error: string) => {
                            if (error === "SQL")
                                dispatch(setErrorStatusAndError(existedStartDate))
                            else
                                dispatch(setErrorStatusAndError(ErrorMassagePattern))
                        }
                    })
                    dispatch(setIdleStatus());

                }}>
                Submit
            </Button>
        </Modal.Footer>
        <NotificationModalWindow isShowed={error !== ""} dropMassege={setError} messegeType={MasssgeType.Error}>{error}</NotificationModalWindow>
        <NotificationModalWindow isShowed={timeError === "" && IsSuccessOrIdle(timeStatus) && success !== ""} dropMassege={SetSuccess} messegeType={MasssgeType.Success}>{success}</NotificationModalWindow>
    </Modal>
}
