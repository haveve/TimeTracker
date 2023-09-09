/// <reference types="react-scripts" />
import React, { useState, useRef, useEffect, Dispatch as DispatchReact, SetStateAction } from 'react';
import { InputGroup, FloatingLabel, Modal, Button, Form, Col, Row, RowProps } from "react-bootstrap";
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
import { RootState, Dispatch } from '../../Redux/store';
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
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setGlobalCalendar, setStartGlobalCalendar, setStartUserCalendar, setUserCalendar, setIdleStatus as setIdleStatusCalendar, setErrorStatusAndError as setErrorStatusAndErrorCalendar, setloadingStatus } from '../../Redux/Slices/CalendarSlicer';

import CreateRange from './CalendarActions/UserCalendar/CreateRange';

export const weekInMilSec = 604800000

export const maxCalendarDate = new Date(2030, 11, 31)
export const minCalendarDate = new Date(2023, 0, 1)

export const maxCalendarCompareDate = new Date(2030, 11, 1)
export const minCalendarCompareDate = new Date(2023, 0, 31)


export const uncorrectTitleError = `length of your title is less than 0 and higher than 55`
export const uncorrectTimeError = `start end end dates must be correct. Theirs' values of hours must be <= 24 and >=0, minutes <=60 and >=0 and startDate must be less than endDate `
export const successfullyCreated = `your range of time was successfully created`
export const successfullyDeleted = `your range of time was successfully deleted`
export const successfullyUpdated = `your range of time was successfully updated`
export const uncoredStartDate = `you can create two date range with the same start date`
export const uncorrectDayError = `start end end days' must be correct. Theirs' values of days must be <= days in month and >0, months <=12 and >0 and from day must be less than to day `
export const uncorrectDay = `day must be less than ${maxCalendarDate.toString()} and must be bigger than ${minCalendarDate.toString()}`
export const defaultSuccessfulMessage = `actions was successfully committed`

export enum MonthOrWeek {
    Month = "MONTH",
    Week = "WEEK"
}

export default function Calendar() {

    const calendarDays = useSelector((state: RootState) => {
        return state.calendar.data.userCalendar
    })

    const globalCalendar = useSelector((state: RootState) => {
        return state.calendar.data.globalCalendar
    })

    const [error, setError] = useState("")

    const success = useSelector((state: RootState) => {
        return state.calendar.status === "success"
    })

    const isLoading = useSelector((state: RootState) => {
        return state.calendar.status === "loading"
    })

    const [changedDay, setChangedDay] = useState(new Date())
    const [isVisible, setIsVisible] = useState(false);
    const calendarRef = useRef<FullCalendar>(null);
    const [startDateString, setStartDateString] = useState("");
    const [endDateString, setEndDateString] = useState("");
    const [title, setTitle] = useState("");

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

    const [startTimeStringRange, setStartTimeStringRange] = useState("");
    const [endTimeStringRange, setEndTimeStringRange] = useState("");
    const [titleRange, setTitleRange] = useState("");
    const [startRangeDay, setStartRangeDay] = useState("");
    const [endRangeDay, setEndRangeDay] = useState("");

    const [mOrW, setMOrW] = useState(MonthOrWeek.Month);
    const [navigateDate, setNavigateDate] = useState(new Date())

    const [prevRequest, setPrevRequest] = useState(new Subscription())

    const [userId, setUserId] = useState<number | null>(null)
    const [isShowedUserList, setShowedUserList] = useState(false)

    const [globalRequest, setGlobalRequest] = useState(new Subscription())

    const [selectedTypeCreate, setSelectedTypeCreate] = useState<null | TypeOfGlobalEvent>(null)
    const [selectedTypeUpdate, setSelectedTypeUpdate] = useState<null | TypeOfGlobalEvent>(null)
    const [selectedTypeCreateRange, setSelectedTypeCreateRange] = useState<null | TypeOfGlobalEvent>(null)

    const [selectedAction, setSelectedAction] = useState(0);
    const [buttonText, setButtonText] = useState('');
    const [buttonType, setButtonType] = useState('outline-success')

    const dispatch = useDispatch();

    const { i18n, t } = useTranslation();

    useEffect(() => {
        setButtonText(t('create'))
    }, [i18n.language])
    useEffect(() => {
        //If user accept track her location, finding gap between his location and
        //local time(location that estimate browser) in other way, finding gap
        //between location of company office and local time(location that estimate browser)
        //When we send data, cast it to local time(location that estimate browser) by hand
        prevRequest.unsubscribe();
        globalRequest.unsubscribe();
        dispatch(setStartUserCalendar([]));
        dispatch(setStartGlobalCalendar([]));

        dispatch(setloadingStatus())

        setGlobalRequest(GetGlobalCalendar(navigateDate, mOrW).subscribe({
            next: (gEvents) => {
                dispatch(setStartGlobalCalendar([...gEvents.map(cg => {
                    cg.date = new Date(cg.date)
                    return cg
                })]));
            },
            error: () => dispatch(setErrorStatusAndErrorCalendar(ErrorMassagePattern))
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
                        dispatch(setStartUserCalendar(events));
                    },
                    error: () => dispatch(setErrorStatusAndErrorCalendar(ErrorMassagePattern))
                }))
        }
    }, [mOrW, navigateDate, geoOffset, userId])

    const createSubmitHandle = () => {
        const startDate = IsCorrectTime(startDateString, setError);
        if (!startDate.isCorrect)
            return;

        const endDate = IsCorrectTime(endDateString, setError);
        if (!startDate.isCorrect)
            return;

        const endDateData = endDate.data!
        const startDateData = startDate.data!


        if (startDateData >= endDateData) {
            setError(uncorrectTimeError)
            return;
        }

        if (title === "" || title.length > 55) {
            setError(uncorrectTimeError)
            return;
        }

        const newRange: CalendarDay = {
            title,
            end: new Date(changedDay.getTime() + endDateData * 60000),
            start: new Date(changedDay.getTime() + startDateData * 60000),
            type: null
        }

        if (!calendarDays.every(cd => cd.start.toISOString() !== newRange.start.toISOString())) {
            setError(uncoredStartDate);
            return;
        }

        addEvent(newRange, geoOffset).subscribe({
            next: () => {
                dispatch(setUserCalendar([...calendarDays, newRange]))
            },
            error: () => {
                dispatch(setErrorStatusAndErrorCalendar(ErrorMassagePattern))
            }
        })

    }

    const handleDelete = () => {
        if (!toDelete)
            return

        DeleteEvent(toDelete, geoOffset).subscribe({
            next: () => {
                setToDelete(null)
                dispatch(setUserCalendar(([...calendarDays.filter(cd => cd.start.toISOString() !== toDelete.toISOString())])))
            },
            error: () => {
                setToDelete(null)
                dispatch(setErrorStatusAndErrorCalendar(ErrorMassagePattern))
            }
        })
    }

    const handleGlobalDelete = () => {
        if (!toDelete)
            return

        DeleteGlobalEvent(toDelete).subscribe({
            next: () => {
                setToDelete(null)
                dispatch(setGlobalCalendar([...globalCalendar.filter(cd => cd.date.toISOString() !== toDelete.toISOString())]))
            },
            error: () => {
                setToDelete(null)
                dispatch(setErrorStatusAndErrorCalendar(ErrorMassagePattern))
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
                dispatch(setGlobalCalendar(
                    [...globalCalendar.filter(cd => cd.date.toISOString() !== date.date.toISOString(), newRange)]
                ))
            },
            error: () => dispatch(setErrorStatusAndErrorCalendar(ErrorMassagePattern))
        })

    }

    const CreateRangeHandle = () => {
        const StartDay = IsCorrectDate(startRangeDay, setError);
        if (!StartDay.isCorrect)
            return

        const EndDay = IsCorrectDate(endRangeDay, setError);
        if (!EndDay.isCorrect)
            return

        if (EndDay.data!.getTime() < StartDay.data!.getTime())
            return

        var startDate = IsCorrectTime(startTimeStringRange, setError);
        if (!startDate.isCorrect)
            return;

        var endDate = IsCorrectTime(endTimeStringRange, setError);
        if (!endDate.isCorrect)
            return;

        if (startDate.data! >= endDate.data!) {
            setError(uncorrectTimeError)
            return;
        }

        if (titleRange === "" || titleRange.length > 55) {
            setError(uncorrectTitleError);
            return;
        }

        var newRange: CalendarDay = {
            title: titleRange,
            start: StartDay.data!,
            end: EndDay.data!,
            type: null
        }
        var newArray: CalendarDay[] = [];
        for (let i = 0; newRange.start.getTime() <= newRange.end.getTime(); i++) {

            const newDay = {
                title: newRange.title,
                start: new Date(newRange.start.getTime() + startDate.data! * 60000),
                end: new Date(newRange.start.getTime() + endDate.data! * 60000),
                type: null
            }

            if (newDay.start.getDay() !== 0 && newDay.start.getDay() !== 6 && calendarDays.every(cd => cd.start.toISOString() !== newDay.start.toISOString()))
                newArray = [...newArray, newDay]

            newRange.start.setDate(newRange.start.getDate() + 1);
        }
        addEventRange(newArray, geoOffset).subscribe({
            next: () => {
                newArray = [...calendarDays, ...newArray]
                dispatch(setUserCalendar(newArray))
            },
            error: () => dispatch(setErrorStatusAndErrorCalendar(ErrorMassagePattern))
        })

    }
    const updateSubmitHandle = () => {
        if (!toUpdate)
            return;

        var startDate = 0;
        if (!ignoreDateStartToUp) {
            const result = IsCorrectTime(startDateStringToUpdate, setError);
            if (!result.isCorrect)
                return;
            startDate = result.data!
        }

        var endDate = 0
        if (!ignoreDateEndToUp) {
            const result = IsCorrectTime(startDateStringToUpdate, setError);
            if (!result.isCorrect)
                return;
            endDate = result.data!
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
                dispatch(setUserCalendar(
                    [...calendarDays.filter(cd => cd.start.toISOString() !== date.start.toISOString()), newRange]
                ))
            },
            error: () => dispatch(setErrorStatusAndErrorCalendar(ErrorMassagePattern))
        })

    }

    const CreateGlobalRangeHandle = () => {
        const StartDay = IsCorrectDate(startRangeDay, setError);
        if (!StartDay.isCorrect)
            return

        const EndDay = IsCorrectDate(endRangeDay, setError);
        if (!EndDay.isCorrect)
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
            start: StartDay.data!,
            end: EndDay.data!,
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
                dispatch(setGlobalCalendar(newArray))
            },
            error: () => dispatch(setErrorStatusAndErrorCalendar(ErrorMassagePattern))
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

        addGlobalEvent(newRange).subscribe({
            next: () => {
                dispatch(setGlobalCalendar([...globalCalendar, newRange]))
            },
            error: () => {
                dispatch(setErrorStatusAndErrorCalendar(ErrorMassagePattern))
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

    return <><FullCalendar
        ref={calendarRef}
        dayHeaderClassNames={['calendar-head-color']}
        height={"90vh"}
        dayCellContent={(info) => GetDaySellContent(info, globalCalendar)}
        locales={allLocales}
        locale={i18n.language}
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
                setStartTimeStringRange("")
                setEndTimeStringRange("")

            }}
            centered>
            <Modal.Header closeButton>
                <div className='d-flex p-0 m-0 flex-row justify-content-between w-100'>
                    <div className='p-0 pt-2'> {t("Calendar.CalendarManage.title")}<br />{`${ToDefautDateStrFormat(changedDay)}`}</div>
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
                        <CreateRange setError={setError} />}
                    {selectedAction === 0 &&
                        <Row className='d-flex flex-column justify-content-between'>
                            <Col className='mb-3'>
                                <FloatingLabel label={t('Calendar.CalendarManage.wTitle')}>
                                    <Form.Control type='text' onChange={(e) => setTitle(e.target.value)}></Form.Control>
                                </FloatingLabel>
                            </Col>
                            <Col className='d-flex flex-row justify-content-between'>
                                <FloatingLabel label={t('Calendar.CalendarManage.from')}>
                                    <Form.Control type='text'
                                        onChange={(e) => setStartDateString(e.target.value)}></Form.Control>
                                </FloatingLabel>
                                <FloatingLabel label={t('Calendar.CalendarManage.until')}>
                                    <Form.Control type='text'
                                        onChange={(e) => setEndDateString(e.target.value)}></Form.Control>
                                </FloatingLabel>
                            </Col>
                            <Col className='text-center'>
                                <Form.Label className='text-muted small'>{t('Calendar.CalendarManage.timeFormatSample')}</Form.Label>
                            </Col>
                        </Row>
                    }{
                        selectedAction === 1 &&
                        <Row>
                            <Form.Select onChange={(e) => setToDelete(new Date(Date.parse(e.target.value)))}>
                                <option value="">{t('Calendar.CalendarManage.selectRToDelete')}</option>
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
                                    <option value="">{t('Calendar.CalendarManage.selectRToUpdate')}</option>
                                    {calendarDays.filter((cd) => cd.start.toDateString() === changedDay.toDateString())
                                        .map((cd) => <option key={cd.start.toISOString()}
                                            value={cd.start.toISOString()}>{`title: ${cd.title} start: ${cd.start.toLocaleString()} `}</option>)}
                                </Form.Select>
                            </Col>
                            <Col className='mb-3'>
                                <InputGroup>
                                    <InputGroup.Checkbox onChange={() => setIgnoreTitleToUp(n => !n)}></InputGroup.Checkbox>
                                    <FloatingLabel label={t('Calendar.CalendarManage.wTitle')}>
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
                                    <FloatingLabel label={t('Calendar.CalendarManage.from')}>
                                        <Form.Control type='text' disabled={ignoreDateStartToUp}
                                            onChange={(e) => setStartDateStringToUpdate(e.target.value)}
                                            value={startDateStringToUpdate}></Form.Control>
                                    </FloatingLabel>
                                </InputGroup>
                                <InputGroup className='ps-2'>
                                    <InputGroup.Checkbox
                                        onChange={() => setIgnoreDateEndToUp(n => !n)}></InputGroup.Checkbox>
                                    <FloatingLabel label={t('Calendar.CalendarManage.until')}>
                                        <Form.Control type='text' disabled={ignoreDateEndToUp}
                                            onChange={(e) => setEndDateStringToUpdate(e.target.value)}
                                            value={endDateStringToUpdate}></Form.Control>
                                    </FloatingLabel>
                                </InputGroup>
                            </Col>
                            <Col className='text-center'>
                                <Form.Label className='text-muted small'>{t('Calendar.CalendarManage.timeFormatSample')}</Form.Label>
                            </Col>
                        </Row>
                    }
                </Modal.Body> : <Modal.Body>
                    {selectedAction === -1 &&
                        <Row className='d-flex flex-column justify-content-between'>
                            <Col className='mb-3'>
                                <FloatingLabel label={t('Calendar.CalendarManage.wTitle')}>
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
                                    <option value="">{t('Calendar.GlobalCalendarManange.wType')}</option>
                                    <option value="CELEBRATE">Celebration</option>
                                    <option value="HOLIDAY">Holiday</option>
                                    <option value="SHORT_DAY">Short day</option>
                                </Form.Select>
                            </Col>
                            <Col className='d-flex flex-row justify-content-between'>
                                <FloatingLabel label={t('Calendar.CalendarManage.fDay')}>
                                    <Form.Control type='text' onChange={(e) => setStartRangeDay(e.target.value)}
                                        value={startRangeDay}></Form.Control>
                                </FloatingLabel>
                                <FloatingLabel label={t('Calendar.CalendarManage.uDay')}>
                                    <Form.Control type='text' onChange={(e) => setEndRangeDay(e.target.value)}
                                        value={endRangeDay}></Form.Control>
                                </FloatingLabel>
                            </Col>
                            <Col className='text-center'>
                                <Form.Label className='text-muted small'>{t('Calendar.CalendarManage.dayFormatSample')}</Form.Label>
                            </Col>
                        </Row>}
                    {selectedAction === 0 &&
                        <Row className='d-flex flex-column justify-content-between'>
                            <Col className='mb-3'>
                                <FloatingLabel label={t('Calendar.CalendarManage.wTitle')}>
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
                                    <option value="">{t('Calendar.GlobalCalendarManange.wType')}</option>
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
                                    <FloatingLabel label={t('Calendar.CalendarManage.wTitle')}>
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
                                    <option value="">{t('Calendar.GlobalCalendarManange.wType')}</option>
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
        <NotificationModalWindow isShowed={success} dropMessage={() => dispatch(setIdleStatusCalendar())}
            messageType={MessageType.Success}>{defaultSuccessfulMessage}</NotificationModalWindow>

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

export function SwitchingCalendarFormat(setNavigateDate: DispatchReact<SetStateAction<Date>>, setMOrW: DispatchReact<SetStateAction<MonthOrWeek>>, setDate: Date, changeView: () => void, wOrM: MonthOrWeek) {
    setNavigateDate(setDate);
    setMOrW(wOrM);
    changeView();
}

export enum NextOrPrev {
    Next,
    Prev
}

export function ChangeCalendarPage(callChangeFunc: () => void, nextOrPrev: NextOrPrev, setNavigateDate: DispatchReact<SetStateAction<Date>>, mOrW: MonthOrWeek,) {
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

export interface IsCorrectTimeType {
    isCorrect: boolean,
    data: number | null,
}

export function IsCorrectTime(str: string, setError: (error: string) => void) {
    const timeStr = str.split(':');
    const numberTimeArray = timeStr.map(function (element) {
        return Number.parseInt(element);
    });
    const hours = numberTimeArray[0];
    const minutes = numberTimeArray[1];

    let result: IsCorrectTimeType = {
        isCorrect: false,
        data: null
    }

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        setError(uncorrectTimeError)
        return result;
    }

    if (hours < 0 || minutes < 0) {
        setError(uncorrectTimeError);
        return result;
    }

    if (hours > 24) {
        setError(uncorrectTimeError);
        return result;
    }

    if (minutes > 60) {
        setError(uncorrectTimeError)
        return result;
    }


    result.data = hours * 60 + minutes;
    result.isCorrect = true;

    return result
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

export interface IsCorrectDateType {
    isCorrect: boolean,
    data: Date | null,
}

export function IsCorrectDate(str: string, setError: (error: string) => void): IsCorrectDateType {
    const dateStr = str.split('/');
    const numberTimeArray = dateStr.map(function (element) {
        return Number.parseInt(element);
    });
    const day = numberTimeArray[0];
    const month = numberTimeArray[1];
    const year = numberTimeArray[2];

    let result: IsCorrectDateType = {
        isCorrect: false,
        data: null
    }

    if (Number.isNaN(day) || Number.isNaN(month)) {
        setError(uncorrectTimeError)
        return result;
    }

    if (day < 0 || month < 0) {
        setError(uncorrectTimeError);
        return result;
    }


    if (month > 12) {
        setError(uncorrectTimeError)
        return result;
    }
    if (day > daysInMonth[month - 1]) {
        setError(uncorrectTimeError);
        return result;
    }
    result.isCorrect = true;
    result.data = new Date(year, month - 1, day);

    if (result.data < minCalendarDate || result.data > maxCalendarDate) {
        setError(uncorrectDay)
        result.isCorrect = false;
        return result;
    }

    return result;
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

export function ToDefautDateStrFormat(date: Date) {
    const day = date.getDay() > 10 ? date.getDay().toString() : "0" + date.getDate();
    const month = date.getMonth() + 1 > 10 ? (date.getMonth() + 1).toString() : "0" + (date.getMonth() + 1);
    const year = date.getFullYear();

    return `${year}-${month}-${day}`
}

export function GetDaysFromMilsec(milsec: number) {
    return Math.ceil(milsec / 86400000);
}

export function GetSomeButtonWithAction(buttonType: string, buttonText: string, getSubmmitHandler: () => void) {
    return <Row>
        <Col className='gap-2 d-flex'>
            <Button variant={buttonType}
                onClick={getSubmmitHandler}
            >
                {buttonText}
            </Button>
        </Col>
    </Row>
}