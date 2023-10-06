import React, { useState, useRef, useEffect, Dispatch as DispatchReact, SetStateAction } from 'react';
import { InputGroup, FloatingLabel, Modal, Button, Form, Col, Row, RowProps } from "react-bootstrap";
import { Subscription } from 'rxjs';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IsCorrectDate, IsCorrectTime, uncorrectTimeError, uncorrectTitleError } from '../../Calendar';
import { RootState } from '../../../../Redux/store';
import { CalendarDay } from '../../../../Redux/Types/Calendar';
import { UpdateEvent } from '../../../../Redux/Requests/CalendarRequest';
import { setUserCalendar, setErrorStatusAndError } from '../../../../Redux/Slices/CalendarSlicer';
import { ErrorMassagePattern } from '../../../../Redux/epics';
import { TimeForCalendarFromSeconds, GetSomeButtonWithAction } from '../../Calendar';

export default function Update(option: { setError: (v: string) => void, changedDay: Date }) {

    const { setError, changedDay } = option;
    const { t } = useTranslation();

    const geoOffset = useSelector((state: RootState) => {
        return state.location.userOffset
    })

    const calendarDays = useSelector((state: RootState) => {
        return state.calendar.data.userCalendar
    })

    const dispatch = useDispatch()

    const [toUpdate, setToUpdate] = useState<Date | null>(null)
    const [startDateStringToUpdate, setStartDateStringToUpdate] = useState("");
    const [endDateStringToUpdate, setEndDateStringToUpdate] = useState("");
    const [titleToUpdate, setTitleToUpdate] = useState("");

    const [ignoreDateStartToUp, setIgnoreStartDateToUp] = useState(false)
    const [ignoreTitleToUp, setIgnoreTitleToUp] = useState(false)
    const [ignoreDateEndToUp, setIgnoreDateEndToUp] = useState(false)


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
            error: () => dispatch(setErrorStatusAndError(ErrorMassagePattern))
        })

    }

    return <>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
            {GetSomeButtonWithAction('outline-secondary', t('cancel'), () => {
                setTitleToUpdate("")
                setToUpdate(null)
                setTitleToUpdate("")
                setStartDateStringToUpdate("")
                setEndDateStringToUpdate("")
                setIgnoreDateEndToUp(false)
                setIgnoreStartDateToUp(false)
                setIgnoreTitleToUp(false)
            })}
            {GetSomeButtonWithAction('outline-success', t('update'), () => updateSubmitHandle())}
        </Modal.Footer>
    </>
}