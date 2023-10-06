import React, { useState, useRef, useEffect, Dispatch as DispatchReact, SetStateAction, useTransition } from 'react';
import { InputGroup, FloatingLabel, Modal, Button, Form, Col, Row, RowProps } from "react-bootstrap";
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IsCorrectTime, uncorrectTimeError, uncoredStartDate } from '../../Calendar';
import { RootState } from '../../../../Redux/store';
import { CalendarDay } from '../../../../Redux/Types/Calendar';
import { addEvent } from '../../../../Redux/Requests/CalendarRequest';
import { setUserCalendar, setErrorStatusAndError } from '../../../../Redux/Slices/CalendarSlicer';
import { ErrorMassagePattern } from '../../../../Redux/epics';
import { GetSomeButtonWithAction } from '../../Calendar';

export default function Create(option: { setError: (v: string) => void, changedDay: Date }) {

    const { setError, changedDay } = option;

    const [startDateString, setStartDateString] = useState("");
    const [endDateString, setEndDateString] = useState("");
    const [title, setTitle] = useState("");

    const geoOffset = useSelector((state: RootState) => {
        return state.location.userOffset
    })

    const calendarDays = useSelector((state: RootState) => {
        return state.calendar.data.userCalendar
    })

    const { t } = useTranslation();

    const dispatch = useDispatch()

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
                dispatch(setErrorStatusAndError(ErrorMassagePattern))
            }
        })

    }

    return <>
        <Modal.Body>
            <Row className='d-flex flex-column justify-content-between'>
                <Col className='mb-3'>
                    <FloatingLabel label={t('Calendar.CalendarManage.wTitle')}>
                        <Form.Control
                            value={title}
                            type='text' onChange={(e) => setTitle(e.target.value)}></Form.Control>
                    </FloatingLabel>
                </Col>
                <Col className='d-flex flex-row justify-content-between'>
                    <FloatingLabel label={t('Calendar.CalendarManage.from')}>
                        <Form.Control type='text'
                            value={startDateString}
                            onChange={(e) => setStartDateString(e.target.value)}></Form.Control>
                    </FloatingLabel>
                    <FloatingLabel label={t('Calendar.CalendarManage.until')}>
                        <Form.Control type='text'
                            value={endDateString}
                            onChange={(e) => setEndDateString(e.target.value)}></Form.Control>
                    </FloatingLabel>
                </Col>
                <Col className='text-center'>
                    <Form.Label className='text-muted small'>{t('Calendar.CalendarManage.timeFormatSample')}</Form.Label>
                </Col>
            </Row>
        </Modal.Body>
        <Modal.Footer>
            {GetSomeButtonWithAction('outline-secondary', t('cancel'), () => {
                setStartDateString("");
                setEndDateString("");
                setTitle("");
            })}
            {GetSomeButtonWithAction('outline-success', t('create'), () => createSubmitHandle())}
        </Modal.Footer>
    </>
}