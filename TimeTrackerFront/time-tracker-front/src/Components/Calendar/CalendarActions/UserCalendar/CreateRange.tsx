import React, { useState, useRef, useEffect, Dispatch as DispatchReact, SetStateAction } from 'react';
import { InputGroup, FloatingLabel, Modal, Button, Form, Col, Row, RowProps } from "react-bootstrap";
import { Subscription } from 'rxjs';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IsCorrectDate, IsCorrectTime, uncorrectTimeError, uncorrectTitleError } from '../../Calendar';
import { RootState } from '../../../../Redux/store';
import { CalendarDay } from '../../../../Redux/Types/Calendar';
import { addEventRange } from '../../../../Redux/Requests/CalendarRequest';
import { setUserCalendar, setErrorStatusAndError } from '../../../../Redux/Slices/CalendarSlicer';
import { ErrorMassagePattern } from '../../../../Redux/epics';
import { GetSomeButtonWithAction } from '../../Calendar';

export default function CreateRange(option: { setError: (v: string) => void }) {

    const { setError } = option;

    const { t } = useTranslation()
    const dispatch = useDispatch()

    const geoOffset = useSelector((state: RootState) => {
        return state.location.userOffset
    })

    const calendarDays = useSelector((state: RootState) => {
        return state.calendar.data.userCalendar
    })

    const [startTimeStringRange, setStartTimeStringRange] = useState("");
    const [endTimeStringRange, setEndTimeStringRange] = useState("");
    const [titleRange, setTitleRange] = useState("");
    const [startRangeDay, setStartRangeDay] = useState("");
    const [endRangeDay, setEndRangeDay] = useState("");

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
            error: () => dispatch(setErrorStatusAndError(ErrorMassagePattern))
        })

    }
    
    return <>
        <Modal.Body>
            <Row className='d-flex flex-column justify-content-between'>

                <Col className='d-flex flex-row justify-content-center w-100 text-secondary'>
                    <Form.Label>{t('Calendar.CalendarManage.rangeOpt')}</Form.Label>
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
                <Col className='d-flex flex-row justify-content-center w-100 mt-3 text-secondary'>
                    <Form.Label>{t('Calendar.CalendarManage.PeriodTimeOpt')}</Form.Label>
                </Col>
                <Col className='mb-3'>
                    <FloatingLabel label={t('Calendar.CalendarManage.wTitle')}>
                        <Form.Control type='text' onChange={(e) => setTitleRange(e.target.value)}
                            value={titleRange}></Form.Control>
                    </FloatingLabel>
                </Col>
                <Col className='d-flex flex-row justify-content-between'>
                    <FloatingLabel label={t('Calendar.CalendarManage.from')}>
                        <Form.Control type='text' onChange={(e) => setStartTimeStringRange(e.target.value)}
                            value={startTimeStringRange}></Form.Control>
                    </FloatingLabel>
                    <FloatingLabel label={t('Calendar.CalendarManage.until')}>
                        <Form.Control type='text' onChange={(e) => setEndTimeStringRange(e.target.value)}
                            value={endTimeStringRange}></Form.Control>
                    </FloatingLabel>
                </Col>
                <Col className='text-center'>
                    <Form.Label className='text-muted small'>{t('Calendar.CalendarManage.timeFormatSample')}</Form.Label>
                </Col>
            </Row>
        </Modal.Body>
        <Modal.Footer>
            {GetSomeButtonWithAction('outline-secondary', t('cancel'), () => {
                setStartTimeStringRange("");
                setEndRangeDay("");
                setEndTimeStringRange("");
                setTitleRange("");
                setStartRangeDay("");
            })}
            {GetSomeButtonWithAction('outline-success', t('create'), () => CreateRangeHandle())}
        </Modal.Footer>
    </>
}