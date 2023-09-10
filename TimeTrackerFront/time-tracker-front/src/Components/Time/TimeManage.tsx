/// <reference types="react-scripts" />
import React, { useState } from 'react';
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import '../../Custom.css';
import { useSelector, useDispatch } from 'react-redux';
import NotificationModalWindow from '../Service/NotificationModalWindow';
import { MessageType } from '../Service/NotificationModalWindow';
import { Session } from '../../Redux/Types/Time';
import { RootState } from '../../Redux/store';
import { IsSuccessOrIdle } from './TimeFunction';
import { updateTime, setErrorStatusAndError, setIdleStatus } from '../../Redux/Slices/TimeSlice';
import { RequestUpdateDate, RequestUpdateUserDate } from '../../Redux/Requests/TimeRequests';
import { ErrorMassagePattern } from '../../Redux/epics';
import { locationOffset } from '../../Redux/Slices/LocationSlice';
import { getStartOfWeekByCountry } from '../../Redux/Slices/LocationSlice';
import { useTranslation } from 'react-i18next';

export const startLessEnd = "Start date of time period must be less then End"
export const existedStartDate = "There is occurred error. Maybe you chose start date of session that already exist. If you could not resolved issue, turn to colsole and administrator"
export default function TimeManage(props: {
    userId: number
    isShowed: boolean,
    setShow: (show: boolean) => void,
    selected: Session,
    setSelected: (selected: null) => void
}) {

    const { t } = useTranslation()

    const setUnShowed = () => {
        props.setSelected(null)
        props.setShow(!props.isShowed)
    }

    const [toUpdate, setToUpdate] = useState<Session>({ ...props.selected })
    const [error, setError] = useState("");
    const [success, SetSuccess] = useState("");

    const timeError = useSelector((state: RootState) => {
        return state.time.error
    })

    const timeStatus = useSelector((state: RootState) => {
        return state.time.status
    })

    const offSet = useSelector((state: RootState) => {
        return state.location.userOffset
    })

    const coutry = useSelector((state: RootState) => {
        return state.location.country
    })

    const dispatch = useDispatch()

    return <Modal show={props.isShowed}
        onHide={setUnShowed}
        backdrop="static"
        keyboard={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        data-bs-theme="dark"
    >
        <Modal.Header closeButton>
            <Modal.Title>
                {t('TimeTracker.timeManage')}
            </Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <Row>
                <Col>
                    <Form.Label>{t('TimeTracker.sDate')}</Form.Label>
                    <input type="datetime-local"
                        value={new Date(toUpdate.startTimeTrackDate.getTime() + locationOffset * 60000).toISOString().slice(0, 16)}
                        className='w-100 h-50 bg-dark rounded-3 border-info p-2 text-light'
                        onChange={(e) => {
                            setToUpdate(up => {
                                const startTimeTrackDate = new Date(e.target.value)
                                return { ...up, startTimeTrackDate };
                            })
                        }}>

                    </input>
                </Col>
                <Col>
                    <Form.Label>{t('TimeTracker.eDate')}</Form.Label>
                    <input type="datetime-local"
                        value={new Date(toUpdate.endTimeTrackDate!.getTime() + locationOffset * 60000).toISOString().slice(0, 16)}
                        className='w-100 h-50 bg-dark rounded-3 border-info p-2 text-light'
                        onChange={(e) => {
                            setToUpdate(up => {
                                const endTimeTrackDate = new Date(e.target.value)
                                return { ...up, endTimeTrackDate };
                            })
                        }}>
                    </input>
                </Col>
            </Row>
        </Modal.Body>

        <Modal.Footer>
            <Button variant='outline-secondary'
                onClick={setUnShowed}>
                {t("cancel")}
            </Button>
            <Button variant='outline-success'
                onClick={() => {
                    if (toUpdate.endTimeTrackDate!.getTime() <= toUpdate.startTimeTrackDate!.getTime()) {
                        setError(startLessEnd)
                        return;
                    }
                    if (props.userId === 0) {
                        RequestUpdateDate({ ...props.selected }, { ...toUpdate }, offSet, getStartOfWeekByCountry(coutry)).subscribe({
                            next: (value) => {
                                SetSuccess('Session was successfully updated')
                                dispatch(updateTime({
                                    ...value
                                }))
                            },
                            error: (error: string) => {
                                if (error === "SQL")
                                    dispatch(setErrorStatusAndError(existedStartDate))
                                else
                                    dispatch(setErrorStatusAndError(ErrorMassagePattern))
                            }
                        })
                    }
                    else {
                        RequestUpdateUserDate(props.userId, { ...props.selected }, { ...toUpdate }, offSet, getStartOfWeekByCountry(coutry)).subscribe({
                            next: (s) => {
                                SetSuccess(s)
                            },
                            error: (error: string) => {
                                if (error === "SQL")
                                    dispatch(setErrorStatusAndError(existedStartDate))
                                else
                                    dispatch(setErrorStatusAndError(ErrorMassagePattern))
                            }
                        })
                    }
                    dispatch(setIdleStatus());
                }}>
                {t("submit")}

            </Button>
        </Modal.Footer>
        <NotificationModalWindow isShowed={error !== ""}
            dropMessage={setError}
            messageType={MessageType.Error}>{error}</NotificationModalWindow>
        <NotificationModalWindow isShowed={timeError === "" && IsSuccessOrIdle(timeStatus) && success !== ""}
            dropMessage={SetSuccess}
            messageType={MessageType.Success}>{success}</NotificationModalWindow>
    </Modal>
}
