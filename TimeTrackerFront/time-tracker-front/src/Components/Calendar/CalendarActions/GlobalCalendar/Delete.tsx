import React, { useState, useRef, useEffect, Dispatch as DispatchReact, SetStateAction, useTransition } from 'react';
import { InputGroup, FloatingLabel, Modal, Button, Form, Col, Row, RowProps } from "react-bootstrap";
import { Subscription } from 'rxjs';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { IsCorrectDate, uncorrectTitleError, IsCorrectTime, uncorrectTimeError, uncoredStartDate } from '../../Calendar';
import { RootState } from '../../../../Redux/store';
import { CalendarDay } from '../../../../Redux/Types/Calendar';
import { DeleteGlobalEvent } from '../../../../Redux/Requests/CalendarRequest';
import { setGlobalCalendar, setErrorStatusAndError } from '../../../../Redux/Slices/CalendarSlicer';
import { ErrorMassagePattern } from '../../../../Redux/epics';
import { GetSomeButtonWithAction } from '../../Calendar';

export default function Delete(option: { setError: (v: string) => void, changedDay: Date }) {
    const { setError, changedDay } = option;

    const globalCalendar = useSelector((state: RootState) => {
        return state.calendar.data.globalCalendar
    })

    const [toDelete, setToDelete] = useState<Date | null>(null)
    
    const {t} = useTranslation();

    const dispatch = useDispatch();

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
                dispatch(setErrorStatusAndError(ErrorMassagePattern))
            }
        })
    }

    return <>
        <Modal.Body>
            <Row>
                {globalCalendar.filter((cd) => cd.date.toDateString() === changedDay.toDateString())
                    .map((cd) => {
                        if (!toDelete)
                            setToDelete(cd.date);
                        return <></>
                    })}
            </Row>
        </Modal.Body>
        <Modal.Footer>
            {GetSomeButtonWithAction('outline-secondary', t('cancel'), () => {
                setToDelete(null)
            })}
            {GetSomeButtonWithAction('outline-danger', t('delete'), () => handleGlobalDelete())}
        </Modal.Footer>
    </>
}