import React, { useState, useRef, useEffect, Dispatch as DispatchReact, SetStateAction } from 'react';
import { InputGroup, FloatingLabel, Modal, Button, Form, Col, Row, RowProps } from "react-bootstrap";
import { Subscription } from 'rxjs';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IsCorrectDate, IsCorrectTime, uncorrectTimeError, uncorrectTitleError } from '../../Calendar';
import { RootState } from '../../../../Redux/store';
import { CalendarDay } from '../../../../Redux/Types/Calendar';
import { DeleteEvent } from '../../../../Redux/Requests/CalendarRequest';
import { setUserCalendar, setErrorStatusAndError } from '../../../../Redux/Slices/CalendarSlicer';
import { ErrorMassagePattern } from '../../../../Redux/epics';
import { GetSomeButtonWithAction } from '../../Calendar';

export default function Delete(option: { setError: (v: string) => void, changedDay: Date }) {

    const { setError, changedDay } = option;

    const [toDelete, setToDelete] = useState<Date | null>(null)

    const geoOffset = useSelector((state: RootState) => {
        return state.location.userOffset
    })

    const calendarDays = useSelector((state: RootState) => {
        return state.calendar.data.userCalendar
    })

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
                dispatch(setErrorStatusAndError(ErrorMassagePattern))
            }
        })
    }

    const { t } = useTranslation();
    const dispatch = useDispatch()

    return <>
        <Modal.Body>
            <Row>
                <Form.Select onChange={(e) => setToDelete(new Date(Date.parse(e.target.value)))}>
                    <option value="">{t('Calendar.CalendarManage.selectRToDelete')}</option>
                    {calendarDays.filter((cd) => cd.start.toDateString() === changedDay.toDateString())
                        .map((cd) => <option key={cd.start.toISOString()}
                            value={cd.start.toISOString()}>{`title: ${cd.title} start: ${cd.start.toLocaleString()}`}</option>)}
                </Form.Select>
            </Row>
        </Modal.Body>
        <Modal.Footer>
            {GetSomeButtonWithAction('outline-secondary', t('cancel'), () => {
                setToDelete(null)
            })}
            {GetSomeButtonWithAction('outline-danger', t('delete'), () => handleDelete())}
        </Modal.Footer>
    </>
}