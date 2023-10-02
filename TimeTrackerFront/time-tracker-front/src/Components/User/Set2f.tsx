import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Modal, Row, Col, ProgressBar, InputGroup, ListGroup, Image } from "react-bootstrap";
import '../../Custom.css';
import { axajSetUser2fAuth, _2fAuthResult } from '../../Login/Api/login-logout';
import type { User } from '../../Redux/Types/User';
import NotificationModalWindow, { MessageType } from '../Service/NotificationModalWindow';



export default function Set2factorAuth(props: { isVisibleSet2fa: boolean, setVisibleSet2fa: (v: boolean) => void, setUser: (u: (u: User) => User) => void,_2fAuthData:_2fAuthResult|null }) {

    const {_2fAuthData, setUser, isVisibleSet2fa, setVisibleSet2fa } = props;
    const [enteredCode, setEnteredCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    return <>
        <Modal
            show={isVisibleSet2fa}
            onHide={() => setVisibleSet2fa(false)}
            size='lg'
            data-bs-theme="dark"
            centered>
            <Modal.Header closeButton className='h2'>2 factor authorization</Modal.Header>
            <Modal.Body>
                <Col className="d-flex  flex-row  ">
                    <Col>
                        <div className='h5'>Use QR code</div>
                        <Image thumbnail src={_2fAuthData?.qrUrl}></Image>
                    </Col>
                    <Col sm={8} className='ms-3'>
                        <div className='h5'>If you cannot use QR code, use manual code</div>
                        <p><em className="autoWordSpace">{_2fAuthData?.manualEntry}</em></p>
                    </Col>
                </Col>
            </Modal.Body>
            <Modal.Footer className='d-flex flex-row justify-content-between'>
                <div className='w-50'>
                    <Form.Control
                        placeholder='one-time code'
                        onChange={(event) => setEnteredCode(event.target.value)}>
                    </Form.Control>
                </div>
                <Button variant='outline-success' className='w-25'
                    onClick={() => axajSetUser2fAuth(_2fAuthData!.key, enteredCode).subscribe({
                        next: () => {
                            setSuccess('You succesfully set 2 factor autorization')
                            setUser(u => ({ ...u, key2Auth: 'key' }));
                        },
                        error: (error) => {
                            console.log(error)
                            setError('Codes are not matched')
                        }
                    })}
                >Set 2f auth</Button>
            </Modal.Footer>
        </Modal>
        <NotificationModalWindow isShowed={error !== ""} dropMessage={setError}
            messageType={MessageType.Error}>{error}</NotificationModalWindow>
        <NotificationModalWindow isShowed={success !== ""} dropMessage={setSuccess}
            messageType={MessageType.Success}>{success}</NotificationModalWindow>
    </>
}