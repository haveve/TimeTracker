/// <reference types="react-scripts" />
import React, { useState } from 'react';
import { Container, Nav, Image, Accordion, Navbar, NavDropdown, Button, Offcanvas, Form, ListGroup, ListGroupItem, Card, Col, Row } from "react-bootstrap";
import '../Custom.css';
import '../TimeTrack.css'
import picture from '../Pictures/time-tracker-bg-pictures-removebg.png'
import { Link, Outlet } from 'react-router-dom';
import { Subscription, timer } from 'rxjs';
import Clock from 'react-clock';
import '../Clock.css'
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import { setTimeE } from '../Redux/epics';
import { useEffect } from 'react';
import { setloadingStatus, setIdleStatus, statusType, setErrorStatusAndError } from '../Redux/Slices/TimeSlice';
import { RequestSetStartDate, RequestSetEndDate, RequestGetToken } from '../Redux/Requests/TimeRequests';
import { ErrorMassagePattern } from '../Redux/epics';
import { changeTimerState  } from '../Redux/Slices/TimeSlice';

export default function TimeTracker() {
    const [buttonMassage, setButtonMassage] = useState("Start");
    const [unsubTimer, setUnsubTimer] = useState(new Subscription());
    const [localTimeInSeconds, setLocalTimeInSeconds] = useState(0)


    const dispatch = useDispatch();
    const status = useSelector((state: RootState) => {
        return state.time.status;
    });

    const isStarted = useSelector((state: RootState) => {
        return state.time.time.isStarted;
    });

    useEffect(()=>{        
        dispatch(setloadingStatus());
        dispatch(setTimeE());

    },[])
    useEffect(() => {
        if (isStarted) {
            const subscriber = timer(0, 1000).subscribe(n => {
                setLocalTimeInSeconds(n=>n+1);
            });
            setUnsubTimer(subscriber);
            unsubTimer.unsubscribe();
        }
        setButtonMassage(isStarted ? "End":"Start")

    },[isStarted])

    const isSuccessOrIdle = IsSuccessOrIdle(status);
    const clockTime = TimeStringFromSeconds(localTimeInSeconds);

    return <Card className='rounded-0 border-0 d-flex flex-column h-100'>
        <Row className='p-0 m-0 justify-content-center'>
            <Clock size={190} value={new Date(localTimeInSeconds * 1000)} ></Clock>
        </Row>
        <Card.Body className='text-center time-track-font'>{clockTime.stringTime}</Card.Body>
        <Button variant={isSuccessOrIdle ? "success" : "dark"} disabled={isSuccessOrIdle ? false : true} className='m-5 my-0 ' onClick={() => {

            if (!isStarted) {
                RequestGetToken().subscribe({
                    next: (token) => {
                        RequestSetStartDate(token).subscribe({
                            next: () => { dispatch(setIdleStatus()); },
                            error: () => { unsubTimer.unsubscribe(); dispatch(setErrorStatusAndError(ErrorMassagePattern)) }
                        });
                    },
                    error: () => { unsubTimer.unsubscribe(); dispatch(setErrorStatusAndError(ErrorMassagePattern)) }

                })
            }
            else {
                RequestGetToken().subscribe({
                    next: (token) => {
                        RequestSetEndDate(token).subscribe({
                            next: () => { dispatch(setIdleStatus()) },
                            error: () => { dispatch(setErrorStatusAndError(ErrorMassagePattern)) }
                        });
                    },
                    error: () => {dispatch(setErrorStatusAndError(ErrorMassagePattern))}
                });
                unsubTimer.unsubscribe();
            }
            
            dispatch(changeTimerState());
        }}>{buttonMassage}</Button>
        <Image src={picture}></Image>
    </Card>
}


export function TimeStringFromSeconds(seconds: number): timeClockType {
    const hours = Math.floor(seconds / (60 * 60));
    const minutes = Math.floor((seconds - hours * 60 * 60) / 60);
    const second = seconds - hours * 60 * 60 - minutes * 60;

    return {
        hours,
        minutes,
        seconds: second,
        stringTime: `${hours < 10 ? 0 : ''}${hours}:${minutes < 10 ? 0 : ''}${minutes}:${second < 10 ? 0 : ''}${second}`
    };
}

export type timeClockType = {
    hours: number,
    minutes: number,
    seconds: number,
    stringTime: string
};

export function IsSuccessOrIdle(status: statusType) {
    if (status == "success") {
        return true;
    }
    if (status == "idle")
        return true;
    return false;
}