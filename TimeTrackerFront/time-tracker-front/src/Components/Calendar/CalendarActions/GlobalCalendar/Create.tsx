import React, { useState, useRef, useEffect, Dispatch as DispatchReact, SetStateAction, useTransition } from 'react';
import { InputGroup, FloatingLabel, Modal, Button, Form, Col, Row, RowProps } from "react-bootstrap";
import { Subscription } from 'rxjs';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IsCorrectDate, uncorrectTitleError, IsCorrectTime, uncorrectTimeError, uncoredStartDate } from '../../Calendar';
import { RootState } from '../../../../Redux/store';
import { CalendarDay } from '../../../../Redux/Types/Calendar';
import { addGlobalEvent } from '../../../../Redux/Requests/CalendarRequest';
import { setGlobalCalendar, setErrorStatusAndError } from '../../../../Redux/Slices/CalendarSlicer';
import { ErrorMassagePattern } from '../../../../Redux/epics';
import { GetSomeButtonWithAction } from '../../Calendar';
import { TypeOfGlobalEvent, GlobalEventsViewModel } from '../../../../Redux/Types/Calendar';

export default function Create(option: { setError: (v: string) => void, changedDay: Date }) {
    const { setError, changedDay } = option;

    const globalCalendar = useSelector((state: RootState) => {
        return state.calendar.data.globalCalendar
    })

    const [title, setTitle] = useState("");
    const [selectedTypeCreate, setSelectedTypeCreate] = useState<null | TypeOfGlobalEvent>(null)

    const dispatch = useDispatch();

    const { t } = useTranslation();

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
                dispatch(setErrorStatusAndError(ErrorMassagePattern))
            }
        })

    }

    return <>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
            {GetSomeButtonWithAction('outline-secondary', t('cancel'), () => {
                setTitle("");
                setSelectedTypeCreate(null);
            })}
            {GetSomeButtonWithAction('outline-success', t('create'), () => createGlobalSubmitHandle())}
        </Modal.Footer>
    </>
}