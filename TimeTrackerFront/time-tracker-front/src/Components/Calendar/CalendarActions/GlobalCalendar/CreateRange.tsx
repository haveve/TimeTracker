import React, { useState, useRef, useEffect, Dispatch as DispatchReact, SetStateAction, useTransition } from 'react';
import { InputGroup, FloatingLabel, Modal, Button, Form, Col, Row, RowProps } from "react-bootstrap";
import { Subscription } from 'rxjs';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IsCorrectDate, uncorrectTitleError, IsCorrectTime, uncorrectTimeError, uncoredStartDate } from '../../Calendar';
import { RootState } from '../../../../Redux/store';
import { CalendarDay } from '../../../../Redux/Types/Calendar';
import { addEventGlobalRange } from '../../../../Redux/Requests/CalendarRequest';
import { setGlobalCalendar, setErrorStatusAndError } from '../../../../Redux/Slices/CalendarSlicer';
import { ErrorMassagePattern } from '../../../../Redux/epics';
import { GetSomeButtonWithAction } from '../../Calendar';
import { TypeOfGlobalEvent, GlobalEventsViewModel } from '../../../../Redux/Types/Calendar';
export default function CreateRange(option: { setError: (v: string) => void }) {

    const { t } = useTranslation();
    const { setError } = option;

    const globalCalendar = useSelector((state: RootState) => {
        return state.calendar.data.globalCalendar
    })

    const [titleRange, setTitleRange] = useState("");
    const [startRangeDay, setStartRangeDay] = useState("");
    const [endRangeDay, setEndRangeDay] = useState("");

    const [selectedTypeCreateRange, setSelectedTypeCreateRange] = useState<null | TypeOfGlobalEvent>(null)

    const dispatch = useDispatch();

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
            error: () => dispatch(setErrorStatusAndError(ErrorMassagePattern))
        })

    }

    return <>
        <Modal.Body>
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
            </Row>
        </Modal.Body>
        <Modal.Footer>
            {GetSomeButtonWithAction('outline-secondary', t('cancel'), () => {
                setEndRangeDay("");
                setTitleRange("");
                setStartRangeDay("");
                setSelectedTypeCreateRange(null);
            })}
            {GetSomeButtonWithAction('outline-success', t('create'), () => CreateGlobalRangeHandle())}
        </Modal.Footer>
    </>
} 