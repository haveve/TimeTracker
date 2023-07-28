/// <reference types="react-scripts" />
import React, { useState, useRef, useEffect } from 'react';
import { Container, Nav, Image, Alert, InputGroup, FloatingLabel, Modal, Accordion, Navbar, NavDropdown, Button, Offcanvas, Form, ListGroup, ListGroupItem, Card, Col, Row } from "react-bootstrap";
import '../Custom.css';
import NotificationModalWindow, { MasssgeType } from './NotificationModalWindow';
import { TimeStringFromSeconds } from './TimeTracker';
import { CalendarDay } from '../Redux/Types/Calendar';
import { ErrorMassagePattern } from '../Redux/epics';
import { GetEvents, addEventRange, addEvent, UpdateEvent, DeleteEvent, GetLocation } from '../Redux/Requests/CalendarRequest';
import { DateTime } from 'luxon';
import CheckModalWindow from "./CheckModalWindow"
import CalendarUserslist from './CalendarUsers';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import allLocales from '@fullcalendar/core/locales-all';
import { Subscription } from 'rxjs';
import moment from 'moment';

export const uncorrectTitleError = `length of your title is less than 0 and higher than 55`
export const uncorrectTimeError = `start end end dates must be correct. Theirs' values of hours must be <= 24 and >=0, minutes <=60 and >=0 and startDate must be less than endDate `
export const successfullyCreated = `your range of time was successfully created`
export const successfullyDeleted = `your range of time was successfully deleted`
export const successfullyUpdated = `your range of time was successfully updated`
export const uncoredStartDate = `you can create two date range with the same start date`
export const uncorrectDayError = `start end end days' must be correct. Theirs' values of days must be <= days in month and >0, months <=12 and >0 and from day must be less than to day `

export enum MonthOrWeek {
    Month = "MONTH",
    Week = "WEEK"
}

export const locationOffset = moment().utcOffset();

export default function Calendar() {

    const startArray: CalendarDay[] = [];
    const [changedDay, setChangedDay] = useState(new Date())
    const [calendarDays, setCalendarDays] = useState(startArray)
    const [isVisible, setIsVisible] = useState(false);
    const calendarRef = useRef<FullCalendar>(null);
    const [startDateString, setStartDateString] = useState("");
    const [endDateString, setEndDateString] = useState("");
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [canUserApi, setCanUserApi] = useState("Can we use your IP to locate you?")
    const [geoOffset, setGeoOffset] = useState(officeTimeZone[new Date().getMonth()] * 60);

    const [listOfTimeZones, setListOfTimeZones] = useState([{ name: "Office(Kyiv)", value: officeTimeZone[new Date().getMonth()] * 60 }])

    const [toDelete, setToDelete] = useState<Date | null>(null)

    const [toUpdate, setToUpdate] = useState<Date | null>(null)
    const [startDateStringToUpdate, setStartDateStringToUpdate] = useState("");
    const [endDateStringToUpdate, setEndDateStringToUpdate] = useState("");
    const [titleToUpdate, setTitleToUpdate] = useState("");

    const [ignoreDateStartToUp, setIgnoreStartDateToUp] = useState(false)
    const [ignoreTitleToUp, setIgnoreTitleToUp] = useState(false)
    const [ignoreDateEndToUp, setIgnoreDateEndToUp] = useState(false)

    const [startDateStringRange, setStartDateStringRange] = useState("");
    const [endDateStringRange, setEndDateStringRange] = useState("");
    const [titleRange, setTitleRange] = useState("");
    const [startRangeDay, setStartRangeDay] = useState("");
    const [endRangeDay, setEndRangeDay] = useState("");

    const [mOrW, setMOrW] = useState(MonthOrWeek.Month);
    const [navigateDate, setNavigateDate] = useState(new Date())

    const [prevRequest, setPrevRequest] = useState(new Subscription())

    const [userId, setUserId] = useState<number|null>(null)
    const [isShowedUserList,setShowedUserList] = useState(false)
    useEffect(() => {
        //If user accept track her location, finding gap between his location and
        //local time(location that estimate browser) in other way, finding gap
        //between location of company office and local time(location that estimate browser)
        //When we send data, cast it to local time(location that estimate browser) by hand
        prevRequest.unsubscribe();
        setCalendarDays([])
        setPrevRequest(
            GetEvents(navigateDate, mOrW,userId).subscribe({
                next: (events) => {
                    events.forEach(value => {
                        value.end = new Date(moment(value.end).toDate().getTime() + geoOffset * 60000)
                        value.start = new Date(moment(value.start).toDate().getTime() + geoOffset * 60000)
                    })
                    setCalendarDays(events)
                },
                error: () => setError(ErrorMassagePattern)
            }))

    }, [mOrW, navigateDate, geoOffset,userId])

    const createSubmitHandle = () => {
        const startDate = IsCorrectTime(startDateString, setError);
        if (startDate === -1.5)
            return;

        const endDate = IsCorrectTime(endDateString, setError);
        if (endDate === -1.5)
            return;

        if (startDate >= endDate) {
            setError(uncorrectTimeError)
            return;
        }

        if (title === "" || title.length > 55) {
            setError(uncorrectTitleError);
            return;
        }

        const newRange: CalendarDay = {
            title,
            end: new Date(changedDay.getTime() + endDate * 60000),
            start: new Date(changedDay.getTime() + startDate * 60000)
        }

        if (!calendarDays.every(cd => cd.start.toISOString() !== newRange.start.toISOString())) {
            setError(uncoredStartDate);
            return;
        }

        addEvent(newRange, geoOffset).subscribe({
            next: () => {
                setCalendarDays(cd => [...cd, newRange])
                setSuccess(successfullyCreated);
            },
            error: () => {
                setError(ErrorMassagePattern)
            }
        })

    }

    const handleDelete = () => {
        if (!toDelete)
            return

        DeleteEvent(toDelete, geoOffset).subscribe({
            next: () => {
                setToDelete(null)
                setCalendarDays(cd => [...cd.filter(cd => cd.start.toISOString() !== toDelete.toISOString())])
                setSuccess(successfullyDeleted);
            },
            error: () => {
                setToDelete(null)
                setError(ErrorMassagePattern)
            }
        })
    }

    const updateSubmitHandle = () => {
        if (!toUpdate)
            return;

        var startDate = 0;
        if (!ignoreDateStartToUp) {
            startDate = IsCorrectTime(startDateStringToUpdate, setError);
            if (startDate === -1.5)
                return;
        }

        var endDate = 0
        if (!ignoreDateEndToUp) {
            endDate = IsCorrectTime(endDateStringToUpdate, setError);
            if (endDate === -1.5)
                return;
        }

        if (!ignoreTitleToUp) {
            if (titleToUpdate === "" || titleToUpdate.length > 55) {
                setError(uncorrectTitleError);
                return;
            }
        }
        const newRange: CalendarDay = {
            title: titleToUpdate,
            end: new Date(changedDay.getTime() + endDate * 60000),
            start: new Date(changedDay.getTime() + startDate * 60000)
        }
        var date = calendarDays.filter(cd => cd.start.toISOString() === toUpdate.toISOString())[0]
        if (ignoreDateEndToUp) {
            if (newRange.start.getTime() >= date.end.getTime()) {
                setError(uncorrectTimeError)
                return;
            }
            newRange.end = date.end;
        }

        if (ignoreDateStartToUp) {
            if (newRange.end.getTime() <= date.start.getTime()) {
                setError(uncorrectTimeError)
                return;
            }
            newRange.start = date.start;
        }

        if (newRange.start.getTime() >= newRange.end.getTime()) {
            setError(uncorrectTimeError)
            return;
        }

        if (ignoreTitleToUp) {
            newRange.title = date.title;
        }
        UpdateEvent(toUpdate, newRange, geoOffset).subscribe({
            next: () => {
                setCalendarDays(cd => {
                    let newArray = cd.filter(cd => cd.start.toISOString() !== date.start.toISOString())
                    return [...newArray, newRange]
                })
                setSuccess(successfullyUpdated);
            },
            error: () => setError(ErrorMassagePattern)
        })

    }

    const CreateRangeHandle = () => {
        const StartDay = IsCorrectDate(startRangeDay, setError);
        if (StartDay === -1.5)
            return

        const EndDay = IsCorrectDate(endRangeDay, setError);
        if (EndDay === -1.5)
            return

        if (EndDay.getTime() < StartDay.getTime())
            return

        var startDate = IsCorrectTime(startDateStringRange, setError);
        if (startDate === -1.5)
            return;

        var endDate = IsCorrectTime(endDateStringRange, setError);
        if (endDate === -1.5)
            return;

        if (startDate >= endDate) {
            setError(uncorrectTimeError)
            return;
        }

        if (titleRange === "" || titleRange.length > 55) {
            setError(uncorrectTitleError);
            return;
        }

        var newRange: CalendarDay = {
            title: titleRange,
            start: StartDay,
            end: EndDay
        }

        var newArray: CalendarDay[] = [];
        for (let i = 0; newRange.start.getTime() <= newRange.end.getTime(); i++) {

            const newDay = {
                title: newRange.title,
                start: new Date(newRange.start.getTime() + startDate * 60000),
                end: new Date(newRange.start.getTime() + endDate * 60000)
            }

            if (newDay.start.getDay() !== 0 && newDay.start.getDay() !== 6 && calendarDays.every(cd => cd.start.toISOString() !== newDay.start.toISOString()))
                newArray = [...newArray, newDay]

            newRange.start.setDate(newRange.start.getDate() + 1);
        }

        addEventRange(newArray, geoOffset).subscribe({
            next: () => {
                newArray = [...calendarDays, ...newArray]
                setCalendarDays(newArray)
                setSuccess(successfullyCreated);
            },
            error: () => setError(ErrorMassagePattern)
        })

    }

    const [selectedAction, setSelectedAction] = useState(0);
    const [buttonText, setButtonText] = useState('Create');
    const [buttonType, setButtonType] = useState('outline-success')


    const getSubmmitHandler = () => {
        switch (selectedAction) {
            case -1: return CreateRangeHandle
            case 0: return createSubmitHandle
            case 1: return handleDelete
            case 2: return updateSubmitHandle
        }
    }

    const handleBackToMonthClick = () => {
        const calendarApi = calendarRef.current!.getApi();
        setNavigateDate(calendarApi.getDate())
        setMOrW(MonthOrWeek.Month);
        calendarApi.changeView('dayGridMonth');

    };

    const handleBackToWeekClick = () => {
        const calendarApi = calendarRef.current!.getApi();
        setNavigateDate(calendarApi.getDate())
        setMOrW(MonthOrWeek.Week);
        calendarApi.changeView('timeGridWeek');
    };

    const handlePrevClick = () => {
        const calendarApi = calendarRef.current!.getApi();
        var localNav = new Date();
        switch (mOrW) {
            case MonthOrWeek.Month: setNavigateDate(d => {
                if (d.getTime() > new Date(2023, 0, 31).getTime()) {
                    localNav = new Date(d.setMonth(d.getMonth() - 1)); return localNav;
                }
                return d;
            }); break;
            case MonthOrWeek.Week: setNavigateDate(d => {
                if (d.getTime() > new Date(2023, 0, 31).getTime()) {
                    localNav = new Date(d.getTime() - 604800000); return localNav;
                }
                return d;
            }); break;
        }
        calendarApi.prev();
    };

    const handleNextClick = () => {
        const calendarApi = calendarRef.current!.getApi();
        var localNav = new Date();
        switch (mOrW) {
            case MonthOrWeek.Month: setNavigateDate(d => {
                if (d.getTime() < new Date(2023, 11, 1).getTime()) {
                    localNav = new Date(d.setMonth(d.getMonth() + 1));
                    return localNav;
                }
                return d
            }); break;
            case MonthOrWeek.Week: setNavigateDate(d => { if (d.getTime() <= new Date(2023, 11, 1).getTime()) { localNav = new Date(d.getTime() + 604800000); return localNav; } return d }); break;
        }
        calendarApi.next();
    };

    const handleBackToday = () => {
        const calendarApi = calendarRef.current!.getApi();
        setNavigateDate(new Date())
        calendarApi.today()
    }

    return <> <FullCalendar
        dayHeaderClassNames={['calendar-head-color']}
        height={"100%"}
        ref={calendarRef}
        dayCellContent={(info) => {
            if (info.date.getDay() == 0 || info.date.getDay() == 6)
                return <div className='text-decoration-none text-danger'>{info.dayNumberText}</div>

            return <div className='text-decoration-none text-primary'>{info.dayNumberText}</div>
        }}
        locales={allLocales}
        locale={(function () {
            const locale = Intl.DateTimeFormat().resolvedOptions().locale
            return locale === "ru" ? "uk" : locale
        })()}
        initialView="dayGridMonth"
        plugins={[dayGridPlugin, timeGridPlugin, bootstrap5Plugin, interactionPlugin]}
        events={
            calendarDays.map(day => ({
                title: day.title,
                start: day.start,
                end: day.end,
                color: 'green',
                textColor: 'white'
            }))}
        validRange={{
            start: '2023-01-01',
            end: '2023-12-31'
        }}
        dateClick={(info) => {
            if (info.date.getDay() != 0 && info.date.getDay() != 6&&!userId) {
                setIsVisible(n => !n)
                setChangedDay(info.date)
            }
        }}

        eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit'
        }}

        slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit'
        }}

        customButtons={{
            backToMonthButton: {
                text: 'month',
                click: handleBackToMonthClick
            },
            backToWeekButton: {
                text: 'week',
                click: handleBackToWeekClick
            },
            prevButton: {
                text: '<',
                click: handlePrevClick
            },
            nextButton: {
                text: '>',
                click: handleNextClick
            },
            todayButton: {
                text: 'today',
                click: handleBackToday
            },
            yourLocation: {
                text: (function () {
                    const list = listOfTimeZones.filter(l => l.value === geoOffset)
                    return list[1]?list[1].name:list[0].name
                })(),
                click: ()=>{
                    const list = listOfTimeZones.filter(l => l.value === geoOffset)
                    const name = list[1]?list[1].name:list[0].name
                    const obj = listOfTimeZones.filter(l => l.name !== name)[0]
                    if(obj)
                    setGeoOffset(obj.value)
                }
            },
            othersButton: {
                text: 'others',
                click: ()=>setShowedUserList(n=>!n)
            }
        }}
        headerToolbar={{
            center: 'title',
            left: 'prevButton,nextButton,todayButton yourLocation',
            right: 'othersButton backToMonthButton,backToWeekButton'
        }}
    />
        <Modal
            data-bs-theme="dark"
            show={isVisible}
            onHide={() => {
                setIsVisible(n => !n)
                setStartDateString("");
                setEndDateString("");
                setTitle("");
                setSelectedAction(0)
                setButtonText('Create')
                setButtonType('outline-success')
                setTitleToUpdate("")
                setToUpdate(null)
                setToDelete(null)
                setTitleToUpdate("")
                setStartDateStringToUpdate("")
                setEndDateStringToUpdate("")
                setIgnoreDateEndToUp(false)
                setIgnoreStartDateToUp(false)
                setIgnoreTitleToUp(false)
                setEndRangeDay("");
                setStartRangeDay("");
                setTitleRange("");
                setStartDateStringRange("")
                setEndDateStringRange("")

            }}
            centered>
            <Modal.Header closeButton>
                <div className='d-flex p-0 m-0 flex-row justify-content-between w-100'>
                    <div className='p-0 pt-2'>Period time manage for {`${changedDay.toDateString()}`}</div>
                    <Form.Select value={selectedAction} className='w-25' onChange={(e) => {
                        switch (parseInt(e.target.value)) {
                            case -1: HandleChangeAction(['Create', 'outline-success'], [setButtonText, setButtonType]); break;
                            case 0: HandleChangeAction(['Create', 'outline-success'], [setButtonText, setButtonType]); break;
                            case 1: HandleChangeAction(['Delete', 'outline-danger'], [setButtonText, setButtonType]); break;
                            case 2: HandleChangeAction(['Update', 'outline-success'], [setButtonText, setButtonType]); break;
                        }
                        setSelectedAction(parseInt(e.target.value))
                    }}><option value={-1}>create range</option>
                        <option value={0}>create</option>
                        <option value={1}>delete</option>
                        <option value={2}>update</option></Form.Select>
                </div>
            </Modal.Header>
            <Modal.Body>
                {selectedAction === -1 &&
                    <Row className='d-flex flex-column justify-content-between'>

                        <Col className='d-flex flex-row justify-content-center w-100 text-secondary'>
                            <Form.Label>Range options</Form.Label>
                        </Col>
                        <Col className='d-flex flex-row justify-content-between'>
                            <FloatingLabel label="from day">
                                <Form.Control type='text' onChange={(e) => setStartRangeDay(e.target.value)} value={startRangeDay}></Form.Control>
                            </FloatingLabel>
                            <FloatingLabel label="until day">
                                <Form.Control type='text' onChange={(e) => setEndRangeDay(e.target.value)} value={endRangeDay}></Form.Control>
                            </FloatingLabel>
                        </Col>
                        <Col className='text-center'>
                            <Form.Label className='text-muted small'>format DD/MM (for exmaple 01/12)</Form.Label>
                        </Col>
                        <Col className='d-flex flex-row justify-content-center w-100 mt-3 text-secondary'>
                            <Form.Label>Period time options</Form.Label>
                        </Col>
                        <Col className='mb-3'>
                            <FloatingLabel label="with title">
                                <Form.Control type='text' onChange={(e) => setTitleRange(e.target.value)} value={titleRange}></Form.Control>
                            </FloatingLabel>
                        </Col>
                        <Col className='d-flex flex-row justify-content-between'>
                            <FloatingLabel label="from">
                                <Form.Control type='text' onChange={(e) => setStartDateStringRange(e.target.value)} value={startDateStringRange}></Form.Control>
                            </FloatingLabel>
                            <FloatingLabel label="until">
                                <Form.Control type='text' onChange={(e) => setEndDateStringRange(e.target.value)} value={endDateStringRange}></Form.Control>
                            </FloatingLabel>
                        </Col>
                        <Col className='text-center'>
                            <Form.Label className='text-muted small'>format hh:mm (for exmaple 45:32)</Form.Label>
                        </Col>
                    </Row>}
                {selectedAction === 0 &&
                    <Row className='d-flex flex-column justify-content-between'>
                        <Col className='mb-3'>
                            <FloatingLabel label="with title">
                                <Form.Control type='text' onChange={(e) => setTitle(e.target.value)}></Form.Control>
                            </FloatingLabel>
                        </Col>
                        <Col className='d-flex flex-row justify-content-between'>
                            <FloatingLabel label="from">
                                <Form.Control type='text' onChange={(e) => setStartDateString(e.target.value)}></Form.Control>
                            </FloatingLabel>
                            <FloatingLabel label="until">
                                <Form.Control type='text' onChange={(e) => setEndDateString(e.target.value)}></Form.Control>
                            </FloatingLabel>
                        </Col>
                        <Col className='text-center'>
                            <Form.Label className='text-muted small'>format hh:mm (for exmaple 45:32)</Form.Label>
                        </Col>
                    </Row>
                }{
                    selectedAction === 1 &&
                    <Row>
                        <Form.Select onChange={(e) => setToDelete(new Date(Date.parse(e.target.value)))}>
                            <option value="">select range to delete</option>
                            {calendarDays.filter((cd) => cd.start.toDateString() === changedDay.toDateString())
                                .map((cd) => <option key={cd.start.toISOString()} value={cd.start.toISOString()}>{`title: ${cd.title} start: ${cd.start.toLocaleString()}`}</option>)}
                        </Form.Select>
                    </Row>
                }{
                    selectedAction === 2 &&
                    <Row className='d-flex flex-column justify-content-between'>
                        <Col className='mb-3'>
                            <Form.Select value={toUpdate?.toISOString()} onChange={(e) => {
                                const day = calendarDays.filter(cd => cd.start.toISOString() === e.target.value)[0]
                                setTitleToUpdate(day.title)
                                setStartDateStringToUpdate(TimeForCalendarFromSeconds(day.start.getHours() * 60 * 60 + day.start.getMinutes() * 60))
                                setEndDateStringToUpdate(TimeForCalendarFromSeconds(day.end.getHours() * 60 * 60 + day.end.getMinutes() * 60))
                                setToUpdate(new Date(Date.parse(e.target.value)))
                            }}>
                                <option value="">select range to update</option>
                                {calendarDays.filter((cd) => cd.start.toDateString() === changedDay.toDateString())
                                    .map((cd) => <option key={cd.start.toISOString()} value={cd.start.toISOString()}>{`title: ${cd.title} start: ${cd.start.toLocaleString()} `}</option>)}
                            </Form.Select>
                        </Col>
                        <Col className='mb-3'>
                            <InputGroup>
                                <InputGroup.Checkbox onChange={() => setIgnoreTitleToUp(n => !n)}></InputGroup.Checkbox>
                                <FloatingLabel label="with title">
                                    <Form.Control type='text' disabled={ignoreTitleToUp} onChange={(e) => setTitleToUpdate(e.target.value)} value={titleToUpdate}></Form.Control>
                                </FloatingLabel>
                            </InputGroup>
                        </Col>
                        <Col className='d-flex flex-row justify-content-between'>
                            <InputGroup>
                                <InputGroup.Checkbox onChange={() => setIgnoreStartDateToUp(n => !n)}></InputGroup.Checkbox>
                                <FloatingLabel label="from">
                                    <Form.Control type='text' disabled={ignoreDateStartToUp} onChange={(e) => setStartDateStringToUpdate(e.target.value)} value={startDateStringToUpdate}></Form.Control>
                                </FloatingLabel>
                            </InputGroup>
                            <InputGroup className='ps-2'>
                                <InputGroup.Checkbox onChange={() => setIgnoreDateEndToUp(n => !n)}></InputGroup.Checkbox>
                                <FloatingLabel label="until">
                                    <Form.Control type='text' disabled={ignoreDateEndToUp} onChange={(e) => setEndDateStringToUpdate(e.target.value)} value={endDateStringToUpdate}></Form.Control>
                                </FloatingLabel>
                            </InputGroup>
                        </Col>
                        <Col className='text-center'>
                            <Form.Label className='text-muted small'>format hh:mm (for exmaple 45:32)</Form.Label>
                        </Col>
                    </Row>
                }
            </Modal.Body>
            <Modal.Footer>
                <Row>
                    <Col className='gap-2 d-flex'>
                        <Button variant={buttonType}
                            onClick={getSubmmitHandler()}
                        >
                            {buttonText}
                        </Button>
                    </Col>
                </Row>
            </Modal.Footer>
        </Modal>
        <CheckModalWindow isShowed={canUserApi !== ""} dropMassege={setCanUserApi} messegeType={MasssgeType.Warning} agree={() => {
            GetLocation().subscribe({
                next: (value) => {
                    setGeoOffset(value.timezone.gmt_offset * 60)
                    setListOfTimeZones(list => {
                        return [...list, {
                            name: `${value.city} (${value.country_code})`,
                            value: value.timezone.gmt_offset * 60
                        }]
                    })
                },
                error: () => setError(ErrorMassagePattern)
            })
        }} reject={() => {

        }}>{canUserApi}</CheckModalWindow>
        <CalendarUserslist isShowed = {isShowedUserList} setShowed={setShowedUserList} setUserIndex={setUserId}></CalendarUserslist>
        <NotificationModalWindow isShowed={error !== ""} dropMassege={setError} messegeType={MasssgeType.Error}>{error}</NotificationModalWindow>
        <NotificationModalWindow isShowed={success !== ""} dropMassege={setSuccess} messegeType={MasssgeType.Success}>{success}</NotificationModalWindow>
    </>
}

export function IsCorrectTime(str: string, setError: (error: string) => void) {
    const timeStr = str.split(':');
    const numberTimeArray = timeStr.map(function (element) {
        return Number.parseInt(element);
    });
    const hours = numberTimeArray[0];
    const minutes = numberTimeArray[1];

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        setError(uncorrectTimeError)
        return -1.5;
    }

    if (hours < 0 || minutes < 0) {
        setError(uncorrectTimeError);
        return -1.5;
    }

    if (hours > 24) {
        setError(uncorrectTimeError);
        return -1.5;
    }

    if (minutes > 60) {
        setError(uncorrectTimeError)
        return -1.5;
    }
    return hours * 60 + minutes
}

export function HandleChangeAction(params: any[], sets: ((params: any) => void)[]) {

    for (let i = 0; i < params.length && i < sets.length; i++) {
        sets[i](params[i])
    }
}

export function TimeForCalendarFromSeconds(seconds: number) {
    const time = TimeStringFromSeconds(seconds);
    return `${time.hours}:${time.minutes < 10 ? 0 : ''}${time.minutes}`
}

export function IsCorrectDate(str: string, setError: (error: string) => void) {
    const dateStr = str.split('/');
    const numberTimeArray = dateStr.map(function (element) {
        return Number.parseInt(element);
    });
    const day = numberTimeArray[0];
    const month = numberTimeArray[1];

    if (Number.isNaN(day) || Number.isNaN(month)) {
        setError(uncorrectTimeError)
        return -1.5;
    }

    if (day < 0 || month < 0) {
        setError(uncorrectTimeError);
        return -1.5;
    }


    if (month > 12) {
        setError(uncorrectTimeError)
        return -1.5;
    }
    if (day > daysInMonth[month - 1]) {
        setError(uncorrectTimeError);
        return -1.5;
    }

    return new Date(2023, month - 1, day)
}

export const daysInMonth = [
    31, // January
    28, // February (non-leap year)
    31, // March
    30, // April
    31, // May
    30, // June
    31, // July
    31, // August
    30, // September
    31, // October
    30, // November
    31  // December
];

const officeTimeZone = [
    // January - Eastern European Time (EET) - UTC+2:00
    2,
    // February - Eastern European Time (EET) - UTC+2:00
    2,
    // March - Eastern European Time (EET) - UTC+2:00
    2,
    // April - Eastern European Summer Time (EEST) - UTC+3:00
    3,
    // May - Eastern European Summer Time (EEST) - UTC+3:00
    3,
    // June - Eastern European Summer Time (EEST) - UTC+3:00
    3,
    // July - Eastern European Summer Time (EEST) - UTC+3:00
    3,
    // August - Eastern European Summer Time (EEST) - UTC+3:00
    3,
    // September - Eastern European Summer Time (EEST) - UTC+3:00
    3,
    // October - Eastern European Time (EET) - UTC+2:00
    2,
    // November - Eastern European Time (EET) - UTC+2:00
    2,
    // December - Eastern European Time (EET) - UTC+2:00
    2
];
