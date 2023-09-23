/// <reference types="react-scripts" />
import React, { useState, useRef, useEffect, Dispatch as DispatchReact, SetStateAction, useMemo } from 'react';
import { InputGroup, FloatingLabel, Modal, Button, Form, Col, Row, RowProps } from "react-bootstrap";
import '../../Custom.css';
import NotificationModalWindow, { MessageType } from '../Service/NotificationModalWindow';
import { TimeStringFromSeconds } from '../Time/TimeFunction';
import { SpecialEventType } from '../../Redux/Types/Calendar';
import { ErrorMassagePattern } from '../../Redux/epics';
import {
    GetEvents,
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
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setStartGlobalCalendar, setStartUserCalendar, setIdleStatus as setIdleStatusCalendar, setErrorStatusAndError as setErrorStatusAndErrorCalendar, setloadingStatus } from '../../Redux/Slices/CalendarSlicer';

import useWindowWidth from './useWindowWidth';

import CreateRange from './CalendarActions/UserCalendar/CreateRange';
import Create from './CalendarActions/UserCalendar/Create';
import Update from './CalendarActions/UserCalendar/Update';
import Delete from './CalendarActions/UserCalendar/Delete';

import GlobalCreateRange from './CalendarActions/GlobalCalendar/CreateRange';
import GlobalUpdate from './CalendarActions/GlobalCalendar/Update';
import GlobalDelete from './CalendarActions/GlobalCalendar/Delete';
import GlobalCreate from './CalendarActions/GlobalCalendar/Create';

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

    const [changedDay, setChangedDay] = useState(new Date())
    const [isVisible, setIsVisible] = useState(false);
    const calendarRef = useRef<FullCalendar>(null);

    const geoOffset = useSelector((state: RootState) => {
        return state.location.userOffset
    })

    const [mOrW, setMOrW] = useState(MonthOrWeek.Month);
    const [navigateDate, setNavigateDate] = useState(new Date())

    const [prevRequest, setPrevRequest] = useState(new Subscription())

    const [userId, setUserId] = useState<number | null>(null)
    const [isShowedUserList, setShowedUserList] = useState(false)

    const [globalRequest, setGlobalRequest] = useState(new Subscription())
    const [selectedAction, setSelectedAction] = useState(0);

    const dispatch = useDispatch();

    const { i18n, t } = useTranslation();

    const width = useWindowWidth();

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

    useEffect(() => {
        if (isWerySmallDisplay(width)) {
            handleBackToWeekClick()
        }
    }, [width])


    return <>
        <Row className='p-0 m-0 d-flex justify-content-around flex-row'>
            <Col className='p-0 d-flex justify-content-start flex-row m-0 gap-2'>
                <Button variant='outline-secondary' onClick={handlePrevClick}>{'<'}</Button>
                <Button variant='outline-secondary' onClick={handleNextClick}>{'>'}</Button>
            </Col>
            <Col className='p-0 m-0 mx-2 d-flex justify-content-center flex-row' sm={5}>
                <div className='h3'>
                    {calendarRef.current?.getApi().view.title}
                </div>
            </Col>
            <Col className='p-0 m-0 justify-content-end gap-2 d-flex flex-row'>
                <Button variant='outline-secondary' onClick={() => setShowedUserList(n => !n)}>{t("Calendar.othersButton")}</Button>
                <Button variant='outline-secondary' onClick={handleBackToday}>{t("Calendar.todayButton")}</Button>
                <Button variant='outline-secondary' onClick={handleBackToWeekClick}>{t("Calendar.weekButton")}</Button>
                {!isWerySmallDisplay(width) ?
                    <Button variant='outline-secondary' onClick={handleBackToMonthClick}>{t("Calendar.monthButton")}</Button> : null}
            </Col>
        </Row>
        <FullCalendar
            ref={calendarRef}
            dayHeaderClassNames={['calendar-head-color']}
            height={"85vh"}
            dayCellContent={(info) => GetDaySellContent(info, globalCalendar)}
            locales={allLocales}
            locale={i18n.language}
            initialView={"dayGridMonth"}
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
                if ((userId == null ||
                    userId < 0)
                    && IsChangableDay(info, globalCalendar, navigateDate)) {

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
            headerToolbar={{
                center: '',
                left: '',
                right: ''
            }}
        />
        <Modal
            data-bs-theme="dark"
            show={isVisible}
            onHide={() => {
                setIsVisible(n => !n)
            }}
            centered>
            <Modal.Header closeButton>
                <div className='d-flex p-0 m-0 flex-row justify-content-between w-100'>
                    <div className='p-0 pt-2'> {t("Calendar.CalendarManage.title")}<br />{`${ToDefautDateStrFormat(changedDay)}`}</div>
                    <Form.Select value={selectedAction} className='w-25' onChange={(e) => {
                        setSelectedAction(parseInt(e.target.value))
                    }}>
                        <option value={-1}>{t('createRange')}</option>
                        <option value={0}>{t('create')}</option>
                        <option value={1}>{t('delete')}</option>
                        <option value={2}>{t('update')}</option>
                    </Form.Select>
                </div>
            </Modal.Header>
            {GetCalendarAction(userId, setError, selectedAction, changedDay)}
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

export enum selectedAction {
    CreateRange,
    Create,
    Delete,
    Update
}

export function GetCalendarAction(userId: null | number, setError: (v: string) => void, selectedAction: number, changedDay: Date) {
    if (userId == null || userId >= 0) {
        switch (selectedAction) {
            case -1:
                return <CreateRange setError={setError} />
            case 0:
                return <Create setError={setError} changedDay={changedDay} />
            case 1:
                return <Delete setError={setError} changedDay={changedDay} />
            case 2:
                return <Update setError={setError} changedDay={changedDay} />
        }
    } else {
        switch (selectedAction) {
            case -1:
                return <GlobalCreateRange setError={setError} />
            case 0:
                return <GlobalCreate setError={setError} changedDay={changedDay} />
            case 1:
                return <GlobalDelete setError={setError} changedDay={changedDay} />
            case 2:
                return <GlobalUpdate setError={setError} changedDay={changedDay} />
        }
    }
    return <div></div>
}

export function isWerySmallDisplay(width: number) {
    return width < 700
}