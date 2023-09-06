/// <reference types="react-scripts" />
import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { InputGroup, FloatingLabel, Modal, Button, Form, Col, Row } from "react-bootstrap";
import '../../Custom.css';
import NotificationModalWindow, { MessageType } from '../Service/NotificationModalWindow';
import { TimeStringFromSeconds } from '../Time/TimeFunction';
import { CalendarDay, SpecialEventType } from '../../Redux/Types/Calendar';
import { ErrorMassagePattern } from '../../Redux/epics';
import {
    GetEvents,
    addEventRange,
    addEvent,
    UpdateEvent,
    DeleteEvent,
    DeleteGlobalEvent,
    UpdateGlobalEvent,
    addEventGlobalRange,
    addGlobalEvent
} from '../../Redux/Requests/CalendarRequest';
import { DateTime } from 'luxon';
import CalendarUserslist from './CalendarUsers';
import { RootState } from '../../Redux/store';
import { GlobalEventsViewModel } from '../../Redux/Types/Calendar';
import { GetGlobalCalendar } from '../../Redux/Requests/CalendarRequest';
import { TypeOfGlobalEvent } from '../../Redux/Types/Calendar';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import allLocales from '@fullcalendar/core/locales-all';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

export const uncorrectTitleError = `length of your title is less than 0 and higher than 55`
export const uncorrectTimeError = `start end end dates must be correct. Theirs' values of hours must be <= 24 and >=0, minutes <=60 and >=0 and startDate must be less than endDate `
export const successfullyCreated = `your range of time was successfully created`
export const successfullyDeleted = `your range of time was successfully deleted`
export const successfullyUpdated = `your range of time was successfully updated`
export const uncoredStartDate = `you can create two date range with the same start date`
export const uncorrectDayError = `start end end days' must be correct. Theirs' values of days must be <= days in month and >0, months <=12 and >0 and from day must be less than to day `

export const weekInMilSec = 604800000

export const maxCalendarDate = new Date(2030, 11, 31)
export const minCalendarDate = new Date(2023, 0, 1)

export const maxCalendarCompareDate = new Date(2030, 11, 1)
export const minCalendarCompareDate = new Date(2023, 0, 31)

export enum MonthOrWeek {
    Month = "MONTH",
    Week = "WEEK"
}

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

    const geoOffset = useSelector((state: RootState) => {
        return state.location.userOffset
    })

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

    const [userId, setUserId] = useState<number | null>(null)
    const [isShowedUserList, setShowedUserList] = useState(false)

    const [globalCalendar, setGlobalCalendar] = useState<GlobalEventsViewModel[]>([])
    const [globalRequest, setGlobalRequest] = useState(new Subscription())

    const [selectedTypeCreate, setSelectedTypeCreate] = useState<null | TypeOfGlobalEvent>(null)
    const [selectedTypeUpdate, setSelectedTypeUpdate] = useState<null | TypeOfGlobalEvent>(null)
    const [selectedTypeCreateRange, setSelectedTypeCreateRange] = useState<null | TypeOfGlobalEvent>(null)

    const [selectedAction, setSelectedAction] = useState(0);
    const [buttonText, setButtonText] = useState('');
    const [buttonType, setButtonType] = useState('outline-success')

    const {i18n,t} = useTranslation();

    useEffect(()=>{
        setButtonText(t('create'))
    },[i18n.language])

    useEffect(() => {
        //If user accept track her location, finding gap between his location and
        //local time(location that estimate browser) in other way, finding gap
        //between location of company office and local time(location that estimate browser)
        //When we send data, cast it to local time(location that estimate browser) by hand
        prevRequest.unsubscribe();
        globalRequest.unsubscribe();
        setCalendarDays([])
        setGlobalCalendar([])


        setGlobalRequest(GetGlobalCalendar(navigateDate, mOrW).subscribe({
            next: (gEvents) => {
                setGlobalCalendar([...gEvents.map(cg => {
                    cg.date = new Date(cg.date)
                    return cg
                })])
            },
            error: () => setError(ErrorMassagePattern)
        }))

        if (!userId || userId > 0) {
            setPrevRequest(
                GetEvents(navigateDate, mOrW, userId).subscribe({
                    next: (events) => {
                        events.forEach(value => {
                            if (!value.type) {
                                value.end = new Date(moment(value.end).toDate().getTime() + geoOffset * 60000)
                                value.start = new Date(moment(value.start).toDate().getTime() + geoOffset * 60000)
                            }
                        })
                        setCalendarDays(events)
                    },
                    error: () => setError(ErrorMassagePattern)
                }))
        }
    }, [mOrW, navigateDate, geoOffset, userId])

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
            start: new Date(changedDay.getTime() + startDate * 60000),
            type: null
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

    const handleGlobalDelete = () => {
        if (!toDelete)
            return

        DeleteGlobalEvent(toDelete).subscribe({
            next: () => {
                setToDelete(null)
                setGlobalCalendar(cd => [...cd.filter(cd => cd.date.toISOString() !== toDelete.toISOString())])
                setSuccess(successfullyDeleted);
            },
            error: () => {
                setToDelete(null)
                setError(ErrorMassagePattern)
            }
        })
    }

    const updateGlobalSubmitHandle = () => {

        if (!toUpdate)
            return;

        if (titleToUpdate.length > 55) {
            setError(uncorrectTitleError);
            return;
        }

        if (!selectedTypeUpdate) {
            setError(uncorrectTitleError);
            return;
        }

        const newRange: GlobalEventsViewModel = {
            name: titleToUpdate,
            date: toUpdate,
            typeOfGlobalEvent: selectedTypeUpdate
        }
        var date = globalCalendar.filter(cd => cd.date.toISOString() === toUpdate.toISOString())[0]

        UpdateGlobalEvent(toUpdate, newRange).subscribe({
            next: () => {
                setGlobalCalendar(cd => {
                    let newArray = cd.filter(cd => cd.date.toISOString() !== date.date.toISOString())
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
            end: EndDay,
            type: null
        }

        var newArray: CalendarDay[] = [];
        for (let i = 0; newRange.start.getTime() <= newRange.end.getTime(); i++) {

            const newDay = {
                title: newRange.title,
                start: new Date(newRange.start.getTime() + startDate * 60000),
                end: new Date(newRange.start.getTime() + endDate * 60000),
                type: null
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
            start: new Date(changedDay.getTime() + startDate * 60000),
            type: null
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

    const CreateGlobalRangeHandle = () => {
        const StartDay = IsCorrectDate(startRangeDay, setError);
        if (StartDay === -1.5)
            return

        const EndDay = IsCorrectDate(endRangeDay, setError);
        if (EndDay === -1.5)
            return

        if (titleRange.length > 55) {
            setError(uncorrectTitleError);
            return;
        }

        if (!selectedTypeCreateRange) {
            setError(uncorrectTitleError);
            return;
        }

        var newRange: CalendarDay = {
            title: titleRange,
            start: StartDay,
            end: EndDay,
            type: null
        }

        var newArray: GlobalEventsViewModel[] = [];
        for (let i = 0; newRange.start.getTime() <= newRange.end.getTime(); i++) {

            const newDay = {
                name: newRange.title,
                date: new Date(newRange.start.getTime()),
                typeOfGlobalEvent: selectedTypeCreateRange
            }

            if (newDay.date.getDay() !== 0 && newDay.date.getDay() !== 6 && globalCalendar.every(cd => cd.date.toISOString() !== newDay.date.toISOString()))
                newArray = [...newArray, newDay]

            newRange.start.setDate(newRange.start.getDate() + 1);
        }

        addEventGlobalRange(newArray).subscribe({
            next: () => {
                newArray = [...globalCalendar, ...newArray]
                setGlobalCalendar(newArray)
                setSuccess(successfullyCreated);
            },
            error: () => setError(ErrorMassagePattern)
        })

    }

    const createGlobalSubmitHandle = () => {

        if (title.length > 55) {
            setError(uncorrectTitleError);
            return;
        }

        if (!selectedTypeCreate) {
            setError(uncorrectTitleError);
            return;
        }

        const newRange: GlobalEventsViewModel = {
            name: title,
            date: changedDay,
            typeOfGlobalEvent: selectedTypeCreate
        }

        if (!globalCalendar.every(cd => cd.date.toISOString() !== newRange.date.toISOString())) {
            setError(uncoredStartDate);
            return;
        }

        if (newRange.typeOfGlobalEvent === TypeOfGlobalEvent.Celebrate) {

            const shortDayForCelebrate: GlobalEventsViewModel = {
                name: "",
                date: new Date(newRange.date.getTime() - 84600000),
                typeOfGlobalEvent: TypeOfGlobalEvent.ShortDay
            }

            addEventGlobalRange([newRange, shortDayForCelebrate]).subscribe({
                next: () => {
                    setGlobalCalendar([...globalCalendar, newRange, shortDayForCelebrate])
                    setSuccess(successfullyCreated);
                },
                error: () => setError(ErrorMassagePattern)
            })
            return;
        }

        addGlobalEvent(newRange).subscribe({
            next: () => {
                setGlobalCalendar(cd => [...cd, newRange])
                setSuccess(successfullyCreated);
            },
            error: () => {
                setError(ErrorMassagePattern)
            }
        })

    }


    const getSubmmitHandler = () => {
        if (userId == null || userId >= 0) {
            switch (selectedAction) {
                case -1:
                    return CreateRangeHandle
                case 0:
                    return createSubmitHandle
                case 1:
                    return handleDelete
                case 2:
                    return updateSubmitHandle
            }
        } else {
            switch (selectedAction) {
                case -1:
                    return CreateGlobalRangeHandle
                case 0:
                    return createGlobalSubmitHandle
                case 1:
                    return handleGlobalDelete
                case 2:
                    return updateGlobalSubmitHandle
            }
        }
    }

    const handleBackToMonthClick = () => {
        const calendarApi = calendarRef.current!.getApi();
        SwitchingCalendarFormat(setNavigateDate, setMOrW, calendarApi.getDate(), () => calendarApi.changeView('dayGridMonth'), MonthOrWeek.Month)
    };

    const handleBackToWeekClick = () => {
        const calendarApi = calendarRef.current!.getApi();
        SwitchingCalendarFormat(setNavigateDate, setMOrW, calendarApi.getDate(), () => calendarApi.changeView('timeGridWeek'), MonthOrWeek.Week)
    };

    const handlePrevClick = () => {
        const calendarApi = calendarRef.current!.getApi();
        ChangeCalendarPage(() => calendarApi.prev(), NextOrPrev.Prev, setNavigateDate, mOrW)
    };

    const handleNextClick = () => {
        const calendarApi = calendarRef.current!.getApi();
        ChangeCalendarPage(() => calendarApi.next(), NextOrPrev.Next, setNavigateDate, mOrW)
    };

    const handleBackToday = () => {
        const calendarApi = calendarRef.current!.getApi();
        setNavigateDate(new Date())
        calendarApi.today()
    }

    return <> <FullCalendar
        ref={calendarRef}
        dayHeaderClassNames={['calendar-head-color']}
        height={"100%"}
        dayCellContent={(info) => GetDaySellContent(info, globalCalendar)}
        locales={allLocales}
        locale={i18n.language}
        firstDay={moment().locale(GetUserBrowserLocation()).isoWeek()}
        initialView="dayGridMonth"
        plugins={[dayGridPlugin, timeGridPlugin, bootstrap5Plugin, interactionPlugin]}
        events={
            calendarDays.map(day => {
                return ({
                    title: day.title,
                    start: day.start,
                    end: day.end,
                    color: getEventColor(day.type),
                    textColor: 'white',
                    allDay: day.type ? true : false
                })
            })}
        validRange={{
            start: minCalendarDate,
            end: maxCalendarDate
        }}
        dateClick={(info) => {
            if (calendarDays.some(cd => GetDaysFromMilsec(cd.start.getTime()) <= GetDaysFromMilsec(info.date.getTime()) && GetDaysFromMilsec(cd.end.getTime()) >= GetDaysFromMilsec(info.date.getTime()) && cd.type)) {
                return;
            }
            if ((userId != null
                && userId > 0)
                || !IsChangableDay(info, globalCalendar, navigateDate)) {
                return;
            }
            setIsVisible(n => !n)
            setChangedDay(info.date)
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
                text: t("Calendar.monthButton"),
                click: handleBackToMonthClick
            },
            backToWeekButton: {
                text: t("Calendar.weekButton"),
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
                text: t("Calendar.todayButton"),
                click: handleBackToday
            },
            othersButton: {
                text: t("Calendar.othersButton"),
                click: () => setShowedUserList(n => !n)
            }
        }}
        headerToolbar={{
            center: 'title',
            left: 'prevButton,nextButton,todayButton',
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
                setButtonText(t('create'))
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
                    <div className='p-0 pt-2'> {t("Calendar.CalendarManage.title")}<br/>{`${ToDefautDateStrFormat(changedDay)}`}</div>
                    <Form.Select value={selectedAction} className='w-25' onChange={(e) => {
                        switch (parseInt(e.target.value)) {
                            case -1:
                                HandleChangeAction([t('create'), 'outline-success'], [setButtonText, setButtonType]);
                                break;
                            case 0:
                                HandleChangeAction([t('create'), 'outline-success'], [setButtonText, setButtonType]);
                                break;
                            case 1:
                                HandleChangeAction([t('delete'), 'outline-danger'], [setButtonText, setButtonType]);
                                break;
                            case 2:
                                HandleChangeAction([t('update'), 'outline-success'], [setButtonText, setButtonType]);
                                break;
                        }
                        setSelectedAction(parseInt(e.target.value))
                    }}>
                        <option value={-1}>{t('createRange')}</option>
                        <option value={0}>{t('create')}</option>
                        <option value={1}>{t('delete')}</option>
                        <option value={2}>{t('update')}</option>
                    </Form.Select>
                </div>
            </Modal.Header>
            {(userId == null || userId >= 0) ?
                <Modal.Body>
                    {selectedAction === -1 &&
                        <Row className='d-flex flex-column justify-content-between'>

                            <Col className='d-flex flex-row justify-content-center w-100 text-secondary'>
                                <Form.Label>Range options</Form.Label>
                            </Col>
                            <Col className='d-flex flex-row justify-content-between'>
                                <FloatingLabel label="from day">
                                    <Form.Control type='text' onChange={(e) => setStartRangeDay(e.target.value)}
                                        value={startRangeDay}></Form.Control>
                                </FloatingLabel>
                                <FloatingLabel label="until day">
                                    <Form.Control type='text' onChange={(e) => setEndRangeDay(e.target.value)}
                                        value={endRangeDay}></Form.Control>
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
                                    <Form.Control type='text' onChange={(e) => setTitleRange(e.target.value)}
                                        value={titleRange}></Form.Control>
                                </FloatingLabel>
                            </Col>
                            <Col className='d-flex flex-row justify-content-between'>
                                <FloatingLabel label="from">
                                    <Form.Control type='text' onChange={(e) => setStartDateStringRange(e.target.value)}
                                        value={startDateStringRange}></Form.Control>
                                </FloatingLabel>
                                <FloatingLabel label="until">
                                    <Form.Control type='text' onChange={(e) => setEndDateStringRange(e.target.value)}
                                        value={endDateStringRange}></Form.Control>
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
                                    <Form.Control type='text'
                                        onChange={(e) => setStartDateString(e.target.value)}></Form.Control>
                                </FloatingLabel>
                                <FloatingLabel label="until">
                                    <Form.Control type='text'
                                        onChange={(e) => setEndDateString(e.target.value)}></Form.Control>
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
                                    .map((cd) => <option key={cd.start.toISOString()}
                                        value={cd.start.toISOString()}>{`title: ${cd.title} start: ${cd.start.toLocaleString()}`}</option>)}
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
                                        .map((cd) => <option key={cd.start.toISOString()}
                                            value={cd.start.toISOString()}>{`title: ${cd.title} start: ${cd.start.toLocaleString()} `}</option>)}
                                </Form.Select>
                            </Col>
                            <Col className='mb-3'>
                                <InputGroup>
                                    <InputGroup.Checkbox onChange={() => setIgnoreTitleToUp(n => !n)}></InputGroup.Checkbox>
                                    <FloatingLabel label="with title">
                                        <Form.Control type='text' disabled={ignoreTitleToUp}
                                            onChange={(e) => setTitleToUpdate(e.target.value)}
                                            value={titleToUpdate}></Form.Control>
                                    </FloatingLabel>
                                </InputGroup>
                            </Col>
                            <Col className='d-flex flex-row justify-content-between'>
                                <InputGroup>
                                    <InputGroup.Checkbox
                                        onChange={() => setIgnoreStartDateToUp(n => !n)}></InputGroup.Checkbox>
                                    <FloatingLabel label="from">
                                        <Form.Control type='text' disabled={ignoreDateStartToUp}
                                            onChange={(e) => setStartDateStringToUpdate(e.target.value)}
                                            value={startDateStringToUpdate}></Form.Control>
                                    </FloatingLabel>
                                </InputGroup>
                                <InputGroup className='ps-2'>
                                    <InputGroup.Checkbox
                                        onChange={() => setIgnoreDateEndToUp(n => !n)}></InputGroup.Checkbox>
                                    <FloatingLabel label="until">
                                        <Form.Control type='text' disabled={ignoreDateEndToUp}
                                            onChange={(e) => setEndDateStringToUpdate(e.target.value)}
                                            value={endDateStringToUpdate}></Form.Control>
                                    </FloatingLabel>
                                </InputGroup>
                            </Col>
                            <Col className='text-center'>
                                <Form.Label className='text-muted small'>format hh:mm (for exmaple 45:32)</Form.Label>
                            </Col>
                        </Row>
                    }
                </Modal.Body> : <Modal.Body>
                    {selectedAction === -1 &&
                        <Row className='d-flex flex-column justify-content-between'>
                            <Col className='mb-3'>
                                <FloatingLabel label="with title">
                                    <Form.Control type='text' onChange={(e) => setTitleRange(e.target.value)}
                                        value={titleRange}>
                                    </Form.Control>
                                </FloatingLabel>
                            </Col>
                            <Col className='mb-3'>
                                <Form.Select onChange={(e) => {
                                    switch (e.target.value) {
                                        case "":
                                            setSelectedTypeCreateRange(null);
                                            break;
                                        case "CELEBRATE":
                                            setSelectedTypeCreateRange(TypeOfGlobalEvent.Celebrate);
                                            break;
                                        case "HOLIDAY":
                                            setSelectedTypeCreateRange(TypeOfGlobalEvent.Holiday);
                                            break;
                                        case "SHORT_DAY":
                                            setSelectedTypeCreateRange(TypeOfGlobalEvent.ShortDay);
                                            break;
                                    }
                                }} value={selectedTypeCreateRange == null ? "" : selectedTypeCreateRange.toString()}>
                                    <option value="">with type</option>
                                    <option value="CELEBRATE">Celebration</option>
                                    <option value="HOLIDAY">Holiday</option>
                                    <option value="SHORT_DAY">Short day</option>
                                </Form.Select>
                            </Col>
                            <Col className='d-flex flex-row justify-content-between'>
                                <FloatingLabel label="from day">
                                    <Form.Control type='text' onChange={(e) => setStartRangeDay(e.target.value)}
                                        value={startRangeDay}></Form.Control>
                                </FloatingLabel>
                                <FloatingLabel label="until day">
                                    <Form.Control type='text' onChange={(e) => setEndRangeDay(e.target.value)}
                                        value={endRangeDay}></Form.Control>
                                </FloatingLabel>
                            </Col>
                            <Col className='text-center'>
                                <Form.Label className='text-muted small'>format DD/MM (for exmaple 01/12)</Form.Label>
                            </Col>
                        </Row>}
                    {selectedAction === 0 &&
                        <Row className='d-flex flex-column justify-content-between'>
                            <Col className='mb-3'>
                                <FloatingLabel label="with title">
                                    <Form.Control type='text' onChange={(e) => setTitle(e.target.value)}></Form.Control>
                                </FloatingLabel>
                            </Col>
                            <Col className='mb-3'>
                                <Form.Select onChange={(e) => {
                                    switch (e.target.value) {
                                        case "":
                                            setSelectedTypeCreate(null);
                                            break;
                                        case "CELEBRATE":
                                            setSelectedTypeCreate(TypeOfGlobalEvent.Celebrate);
                                            break;
                                        case "HOLIDAY":
                                            setSelectedTypeCreate(TypeOfGlobalEvent.Holiday);
                                            break;
                                        case "SHORT_DAY":
                                            setSelectedTypeCreate(TypeOfGlobalEvent.ShortDay);
                                            break;
                                    }
                                }} value={selectedTypeCreate == null ? "" : selectedTypeCreate.toString()}>
                                    <option value="">with type</option>
                                    <option value="CELEBRATE">Celebration</option>
                                    <option value="HOLIDAY">Holiday</option>
                                    <option value="SHORT_DAY">Short day</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    }{
                        selectedAction === 1 &&
                        <Row>
                            {globalCalendar.filter((cd) => cd.date.toDateString() === changedDay.toDateString())
                                .map((cd) => {
                                    if (!toDelete)
                                        setToDelete(cd.date);
                                    return <></>
                                })}
                        </Row>
                    }{
                        selectedAction === 2 &&
                        <Row className='d-flex flex-column justify-content-between'>
                            <Col className='mb-3'>
                                {globalCalendar.filter((cd) => cd.date.toDateString() === changedDay.toDateString())
                                    .map((cd) => {
                                        if (!toUpdate) {
                                            setTitleToUpdate(cd.name)
                                            setToUpdate(cd.date)
                                            setSelectedTypeUpdate(cd.typeOfGlobalEvent)
                                        }
                                        return <></>
                                    })}
                            </Col>
                            <Col className='mb-3'>
                                <InputGroup>
                                    <FloatingLabel label="with title">
                                        <Form.Control type='text' onChange={(e) => setTitleToUpdate(e.target.value)}
                                            value={titleToUpdate}></Form.Control>
                                    </FloatingLabel>
                                </InputGroup>
                            </Col>
                            <Col className='mb-3'>
                                <Form.Select onChange={(e) => {
                                    setSelectedTypeUpdate(GetEventTypeFromString(e.target.value))
                                }}
                                    value={selectedTypeUpdate == null ? "" : selectedTypeUpdate.toString()}>
                                    <option value="">with type</option>
                                    <option value="CELEBRATE">Celebration</option>
                                    <option value="HOLIDAY">Holiday</option>
                                    <option value="SHORT_DAY">Short day</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    }
                </Modal.Body>}
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
        <CalendarUserslist isShowed={isShowedUserList} setShowed={setShowedUserList}
            setUserIndex={setUserId}></CalendarUserslist>
        <NotificationModalWindow isShowed={error !== ""} dropMessage={setError}
            messageType={MessageType.Error}>{error}</NotificationModalWindow>
        <NotificationModalWindow isShowed={success !== ""} dropMessage={setSuccess}
            messageType={MessageType.Success}>{success}</NotificationModalWindow>
    </>
}

export type MinDaySellType = {
    date: Date,
    dayNumberText: string,
    isOther: boolean
}

export type MinDayClickType = {
    date: Date
}

export function SwitchingCalendarFormat(setNavigateDate: Dispatch<SetStateAction<Date>>, setMOrW: Dispatch<SetStateAction<MonthOrWeek>>, setDate: Date, changeView: () => void, wOrM: MonthOrWeek) {
    setNavigateDate(setDate);
    setMOrW(wOrM);
    changeView();
}

export enum NextOrPrev {
    Next,
    Prev
}

export function ChangeCalendarPage(callChangeFunc: () => void, nextOrPrev: NextOrPrev, setNavigateDate: Dispatch<SetStateAction<Date>>, mOrW: MonthOrWeek,) {
    var localNav = new Date();

    switch (mOrW) {
        case MonthOrWeek.Month:
            setNavigateDate(d => {
                if (d.getTime() > minCalendarCompareDate.getTime()
                    && nextOrPrev == NextOrPrev.Prev) {
                    localNav = new Date(d.setMonth(d.getMonth() - 1));
                    return localNav;
                }
                else if (d.getTime() < maxCalendarCompareDate.getTime()
                    && nextOrPrev == NextOrPrev.Next) {
                    localNav = new Date(d.setMonth(d.getMonth() + 1));
                    return localNav;
                }
                return d;
            });
            break;
        case MonthOrWeek.Week:
            setNavigateDate(d => {
                if (d.getTime() > minCalendarCompareDate.getTime()
                    && nextOrPrev == NextOrPrev.Prev) {
                    localNav = new Date(d.getTime() - weekInMilSec);
                    return localNav;
                }
                else if (d.getTime() < maxCalendarCompareDate.getTime()
                    && nextOrPrev == NextOrPrev.Next) {
                    localNav = new Date(d.getTime() + weekInMilSec);
                    return localNav;
                }

                return d;
            });
            break;
    }
    callChangeFunc();
}

export function IsChangableDay(info: MinDayClickType, globalCalendar: GlobalEventsViewModel[], navigateDate: Date) {
    return info.date.getDay() != 0
        && info.date.getDay() != 6
        && info.date.getMonth() === navigateDate.getMonth()
        && !globalCalendar.some(cg => DateTime.fromJSDate(cg.date).day === DateTime.fromJSDate(info.date).day
            && DateTime.fromJSDate(cg.date).month === DateTime.fromJSDate(info.date).month && (cg.typeOfGlobalEvent === TypeOfGlobalEvent.Celebrate || cg.typeOfGlobalEvent === TypeOfGlobalEvent.Holiday))

}

export function GetDaySellContent(info: MinDaySellType, globalCalendar: GlobalEventsViewModel[]) {
    const celebrate = globalCalendar.filter(cg => {
        return DateTime.fromJSDate(cg.date).day === DateTime.fromJSDate(info.date).day
    })

    if (celebrate[0] && celebrate[0].typeOfGlobalEvent === TypeOfGlobalEvent.Celebrate && !info.isOther) {
        return <div className='container-fluid p-0 m-0 '>
            <div className='text-decoration-none text-center text-warning'>{info.dayNumberText}</div>
            <div className='text-decoration-none text-secondary'>{celebrate[0].name}</div>
        </div>
    }

    if (info.date.getDay() == 0 || info.date.getDay() == 6)
        return <div className='text-decoration-none text-danger'>{info.dayNumberText}</div>

    if ((celebrate[0] && celebrate[0].typeOfGlobalEvent === TypeOfGlobalEvent.Holiday && !info.isOther))
        return <>
            <div className='text-decoration-none text-end text-danger'>{info.dayNumberText}</div>
            <div className='text-secondary'>{celebrate[0].name}</div>
        </>

    if ((celebrate[0] && celebrate[0].typeOfGlobalEvent === TypeOfGlobalEvent.ShortDay && !info.isOther)) {
        return <>
            <div className='text-decoration-none text-success'>{info.dayNumberText}</div>
            <div className='text-secondary'>{celebrate[0].name}</div>
        </>
    }

    return <div className='text-decoration-none text-primary'>{info.dayNumberText}</div>
}

export function GetEventTypeFromString(value: string) {
    switch (value) {
        case "CELEBRATE":
            return TypeOfGlobalEvent.Celebrate;
        case "HOLIDAY":
            return TypeOfGlobalEvent.Holiday;
        case "SHORT_DAY":
            return TypeOfGlobalEvent.ShortDay;
    }
    return null;
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

export function GetUserBrowserLocation() {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale
    return locale === "ru" ? "uk" : locale
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

export function getEventColor(eventType: SpecialEventType | null) {
    switch (eventType) {
        case null: return "green";
        case SpecialEventType.Ansent: return "#bc6c25";
        case SpecialEventType.Ill: return "#2a9d8f";
        case SpecialEventType.Vacation: return "#283618";
    }
}

export function ToDefautDateStrFormat(date:Date){
    const day = date.getDay()>10?date.getDay().toString():"0"+date.getDate();
    const month = date.getMonth()+1>10?(date.getMonth()+1).toString():"0"+(date.getMonth()+1);
    const year = date.getFullYear();
    
    return `${year}-${month}-${day}`
}

export function GetDaysFromMilsec(milsec: number) {
    return Math.ceil(milsec / 86400000);
}