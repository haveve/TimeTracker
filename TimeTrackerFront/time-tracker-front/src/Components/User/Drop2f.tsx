import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Modal, Row, Col, ProgressBar, InputGroup, ListGroup, Image } from "react-bootstrap";
import '../../Custom.css';
import { ajaxFor2fDrop, WayToDrop2f, _2fAuthResult } from '../../Login/Api/login-logout';
import type { User } from '../../Redux/Types/User';
import NotificationModalWindow, {MessageType} from '../Service/NotificationModalWindow';
import { useTranslation } from 'react-i18next';

export default function Drop2factorAuht(props: { isVisibleDrop2fa: boolean, setVisibleDrop2fa: (v: boolean) => void,setUser:(u:(u:User)=>User)=>void }) {

    const {setUser,isVisibleDrop2fa, setVisibleDrop2fa } = props;
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

    const {t} = useTranslation();

    return <>
        <Modal
            show={isVisibleDrop2fa}
            onHide={() => setVisibleDrop2fa(false)}
            size='lg'
            data-bs-theme="dark"
            centered>
            <Modal.Header closeButton className='h2'>{t('Auth2factor.drop2fTitle')}</Modal.Header>
            <Modal.Body className='d-flex flex-row justify-content-between'>
                <div className='w-50 ms-3'>
                    <Form.Control
                        placeholder={t('Auth2factor.oneTimeCde')}
                        onChange={(event) => setCode(event.target.value)}>
                    </Form.Control>
                </div>
                <Button variant='outline-success' className='w-25'
                    onClick={() => ajaxFor2fDrop(code, WayToDrop2f.Code).subscribe({
                        next: () => {
                            setSuccess(t('Auth2factor.successfullyDrop'))
                            setUser(u => ({ ...u, key2Auth: null }));
                        },
                        error: (error) => {
                            console.log(error)
                            setError(t('Auth2factor.notMatched'))
                        }
                    })}
                >{t("UserProfile.drop2Auth")}</Button>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
        </Modal>
        <NotificationModalWindow isShowed={error !== ""} dropMessage={setError}
            messageType={MessageType.Error}>{error}</NotificationModalWindow>
        <NotificationModalWindow isShowed={success !== ""} dropMessage={setSuccess}
            messageType={MessageType.Success}>{success}</NotificationModalWindow>
    </>
}