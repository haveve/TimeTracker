import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Modal, Row, Col, ProgressBar, InputGroup, ListGroup, Image } from "react-bootstrap";
import '../../Custom.css';
import { axajSetUser2fAuth, _2fAuthResult } from '../../Login/Api/login-logout';
import type { User } from '../../Redux/Types/User';
import NotificationModalWindow, { MessageType } from '../Service/NotificationModalWindow';
import { useTranslation } from 'react-i18next';


export default function Set2factorAuth(props: { isVisibleSet2fa: boolean, setVisibleSet2fa: (v: boolean) => void, setUser: (u: (u: User) => User) => void,_2fAuthData:_2fAuthResult|null }) {

    const {_2fAuthData, setUser, isVisibleSet2fa, setVisibleSet2fa } = props;
    const [enteredCode, setEnteredCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const {t} = useTranslation();

    return <>
        <Modal
            show={isVisibleSet2fa}
            onHide={() => setVisibleSet2fa(false)}
            size='lg'
            data-bs-theme="dark"
            centered>
            <Modal.Header closeButton className='h2'>{t('Auth2factor.set2fTitle')}</Modal.Header>
            <Modal.Body>
                <Col className="d-flex  flex-row  ">
                    <Col>
                        <div className='h5'>{t('Auth2factor.useQr')}</div>
                        <Image thumbnail src={_2fAuthData?.qrUrl}></Image>
                    </Col>
                    <Col sm={8} className='ms-3'>
                        <div className='h5'>{t('Auth2factor.manualCode')}</div>
                        <p><em className="autoWordSpace">{_2fAuthData?.manualEntry}</em></p>
                    </Col>
                </Col>
            </Modal.Body>
            <Modal.Footer className='d-flex flex-row justify-content-between'>
                <div className='w-50'>
                    <Form.Control
                        placeholder={t('Auth2factor.oneTimeCde')}
                        onChange={(event) => setEnteredCode(event.target.value)}>
                    </Form.Control>
                </div>
                <Button variant='outline-success' className='w-25'
                    onClick={() => axajSetUser2fAuth(_2fAuthData!.key, enteredCode).subscribe({
                        next: () => {
                            setSuccess(t('Auth2factor.successfullySet'))
                            setUser(u => ({ ...u, key2Auth: 'key' }));
                        },
                        error: (error) => {
                            console.log(error)
                            setError(t('Auth2factor.notMatched'))
                        }
                    })}
                >{t("UserProfile.set2Auth")}</Button>
            </Modal.Footer>
        </Modal>
        <NotificationModalWindow isShowed={error !== ""} dropMessage={setError}
            messageType={MessageType.Error}>{error}</NotificationModalWindow>
        <NotificationModalWindow isShowed={success !== ""} dropMessage={setSuccess}
            messageType={MessageType.Success}>{success}</NotificationModalWindow>
    </>
}