
import React, { useState, useRef, useEffect, Dispatch as DispatchReact, SetStateAction, useTransition } from 'react';
import { InputGroup, FloatingLabel, Modal, Button, Form, Col, Row, RowProps } from "react-bootstrap";
import { Subscription } from 'rxjs';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IsCorrectDate, uncorrectTitleError, IsCorrectTime, uncorrectTimeError, uncoredStartDate } from '../../Calendar';
import { RootState } from '../../../../Redux/store';
import { CalendarDay } from '../../../../Redux/Types/Calendar';
import { UpdateGlobalEvent } from '../../../../Redux/Requests/CalendarRequest';
import { setGlobalCalendar, setErrorStatusAndError } from '../../../../Redux/Slices/CalendarSlicer';
import { ErrorMassagePattern } from '../../../../Redux/epics';
import { GetSomeButtonWithAction, GetEventTypeFromString } from '../../Calendar';
import { TypeOfGlobalEvent, GlobalEventsViewModel } from '../../../../Redux/Types/Calendar';

export default function Update(option: { setError: (v: string) => void, changedDay: Date }) {

    const { setError, changedDay } = option;
    const globalCalendar = useSelector((state: RootState) => {
        return state.calendar.data.globalCalendar
    })

    const [toUpdate, setToUpdate] = useState<Date | null>(null);
    const [titleToUpdate, setTitleToUpdate] = useState("");
    const [selectedTypeUpdate, setSelectedTypeUpdate] = useState<null | TypeOfGlobalEvent>(null)

    const dispatch = useDispatch();

    const { t } = useTranslation();

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
            error: () => dispatch(setErrorStatusAndError(ErrorMassagePattern))
        })

    }

    return <>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
            {GetSomeButtonWithAction('outline-secondary', t('cancel'), () => {
                setTitleToUpdate("");
                setToUpdate(null);
                setSelectedTypeUpdate(null);
            })}
            {GetSomeButtonWithAction('outline-success', t('update'), () => updateGlobalSubmitHandle())}
        </Modal.Footer>
    </>
}