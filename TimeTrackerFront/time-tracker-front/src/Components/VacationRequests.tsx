import { User } from "../Redux/Types/User";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import {
    addApproverReaction,
    cancelVacationRequest, createVacationRequest, deleteVacationRequest,
    getApprovers,
    getApproversReaction, getIncomingVacationRequestsByApproverId,
    getVacationRequestsByRequesterId,
    getVacationRequestsEpic
} from "../Redux/epics";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, ListGroup, ListGroupItem, Modal, Row } from "react-bootstrap";
import { VacationRequest } from "../Redux/Types/VacationRequest";
import { Error } from "./Error";
import { InputVacationRequest } from "../Redux/Types/InputVacationRequest";
import { getIncomingVacationRequestsListByApproverId } from "../Redux/Slices/VacationSlice";
import { InputApproverReaction } from "../Redux/Types/InputApproverReaction";

export default function VacationRequests(props: { user: User }) {
    const dispach = useDispatch();
    const getPlainDate = (date: Date) => {
        let tempDate: Date = new Date(date);
        return tempDate.getDate() + "/" + tempDate.getMonth() + "/" + tempDate.getFullYear()
    }

    const [showReaction, setShowReaction] = useState(false);
    const initVacationRequest = { id: 0 } as VacationRequest;
    const [currentVacationRequest, setCurrentVacationRequest] = useState(initVacationRequest);
    const [currentIncomingVacationRequest, setCurrentIncomingVacationRequest] = useState(initVacationRequest);
    const [showCreate, setShowCreate] = useState(false);
    const [info, setInfo] = useState("");
    const [reactionMessage, setReactionMessage] = useState("");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [showReactionMessage, setShowReactionMessage] = useState(false);
    const [isApproveReaction, setIsApproveReaction] = useState<boolean>();


    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const vacationRequests = useSelector((state: RootState) => state.vacation.vacationRequests);
    useEffect(() => {
        if (props.user !== undefined && props.user.id !== undefined) {
            dispach(getVacationRequestsByRequesterId(props.user.id))
        }
    }, [dispach, props.user])

    const incomingVacationRequests = useSelector((state: RootState) => state.vacation.incomingVacationRequests);
    useEffect(() => {
        if (props.user !== undefined && props.user.id !== undefined) {
            dispach(getIncomingVacationRequestsByApproverId(props.user.id))
        }
    }, [dispach, props.user])


    const approversReactions = useSelector((state: RootState) => state.vacation.approversReaction)
    useEffect(() => {
        if (currentVacationRequest.id !== null) {
            dispach(getApproversReaction(currentVacationRequest.id))
        }
    }, [showReaction, dispach])


    const HandleShowReaction = (inputVacationRequest: VacationRequest) => {
        setShowReaction(true);
        setCurrentVacationRequest(inputVacationRequest);
    }
    const HandleCancelRequest = (inputVacationRequest: VacationRequest) => {
        dispach(cancelVacationRequest(inputVacationRequest));
    }
    const HandleDeleteRequest = (inputVacationRequest: VacationRequest) => {
        dispach(deleteVacationRequest(inputVacationRequest));
    }
    const handleCloseCreate = () => {
        setShowCreate(false);
    }

    const HandleApprove = (inVacationRequest: VacationRequest) => {
        setCurrentIncomingVacationRequest(inVacationRequest);
        setIsApproveReaction(true);
        setShowReactionMessage(true);
    }
    const HandleDecline = (inVacationRequest: VacationRequest) => {
        setCurrentIncomingVacationRequest(inVacationRequest);
        setIsApproveReaction(false);
        setShowReactionMessage(true);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (startDate === undefined || endDate === undefined) { setShowError(true); setErrorMessage("Fill date fields"); return; }
        if (startDate! >= endDate! || startDate <= new Date()) { setShowError(true); setErrorMessage("Select correct interval"); return; }
        if (props.user.id !== undefined && startDate !== undefined && endDate !== undefined) {
            const newVacationRequest: InputVacationRequest =
            {
                requesterId: props.user.id,
                infoAboutRequest: info,
                startDate: startDate,
                endDate: endDate,
            }
            dispach(createVacationRequest(newVacationRequest));
            setInfo("");
            setStartDate(undefined);
            setEndDate(undefined);
            setShowCreate(false);
            handleCloseCreate();
        }


    }
    const HandleReactionMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (props.user.id !== undefined && isApproveReaction !== undefined) {
            const newApproverReaction: InputApproverReaction = {
                approverId: props.user.id,
                requestId: currentIncomingVacationRequest.id,
                reaction: isApproveReaction,
                reactionMessage: reactionMessage
            }
            dispach(addApproverReaction(newApproverReaction));
            setCurrentIncomingVacationRequest(initVacationRequest);
            setShowReactionMessage(false);
        }

    }

    return (<>
        <h4>My requests</h4>
        <Button onClick={() => {
            setShowCreate(true);
            setShowError(false);
        }} variant={"outline-primary"}>Create vacation request</Button>
        <Modal
            show={showCreate}
            backdrop="static"
            keyboard={false}
            centered
            data-bs-theme="dark"
            onHide={handleCloseCreate}
        >

            <Form onSubmit={e => handleSubmit(e)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create vacation request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Some info about request</Form.Label>
                        <Form.Control type="text" value={info} onChange={e => setInfo(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Start date</Form.Label>
                        <Form.Control type="date" defaultValue={Date.now()}
                            onChange={e => setStartDate(new Date(e.target.value))} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Finish date</Form.Label>
                        <Form.Control type="date" defaultValue={Date.now()}
                            onChange={e => setEndDate(new Date(e.target.value))} />
                        <Error ErrorText={errorMessage} Show={showError} SetShow={() => setShowError(false)}></Error>
                    </Form.Group>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseCreate}>Cancel</Button>
                    <Button variant="success" type="submit">Create</Button>
                </Modal.Footer>
            </Form>
        </Modal>
        {vacationRequests.map((vacationRequest) => {

            return (
                <Card className={"w-100"} key={vacationRequest.id}>
                    <Card.Body className="d-flex flex-column bg-succes">
                        <Row>
                            <Col>
                                <p className='m-0 fs-5'>{vacationRequest.status}</p>
                                <p className='m-0 fs-5'>{vacationRequest.infoAboutRequest}</p>
                                <Button variant="outline-info"
                                    onClick={() => HandleShowReaction(vacationRequest)}>Reaction</Button>
                                <Modal
                                    show={showReaction}
                                    backdrop="static"
                                    keyboard={false}
                                    centered
                                    data-bs-theme="dark"
                                    onHide={() => setShowReaction(false)}
                                >
                                    <Modal.Header>ApproversReaction</Modal.Header>
                                    <ListGroup className="w-100 d-flex flex-column">
                                        {approversReactions.map((approverReaction) => {
                                            let reaction: string;
                                            if (approverReaction.isRequestApproved === null) {
                                                reaction = "No reaction yet";
                                            } else if (approverReaction.isRequestApproved === true) {
                                                reaction = "Approved";
                                            } else {
                                                reaction = "Declined";
                                            }
                                            return (<>
                                                <ListGroupItem key={approverReaction.id}
                                                    className='d-flex flex-row align-items-center justify-content-between rounded-2 mb-1'>
                                                    <p>{approverReaction.approver.fullName} -
                                                        <span
                                                            className={reaction === "No reaction yet" ? " " : reaction === "Approved" ? "text-success" : "text-danger"}>{reaction}</span>
                                                        - {approverReaction.reactionMessage}</p>
                                                </ListGroupItem>

                                            </>)

                                        })}
                                    </ListGroup>
                                    <Modal.Footer>
                                        <Button variant="secondary"
                                            onClick={() => setShowReaction(false)}>Close</Button>
                                    </Modal.Footer>
                                </Modal>
                            </Col>
                            <Col>
                                <p className='m-0 fs-5'>{getPlainDate(vacationRequest.startDate)} - {getPlainDate(vacationRequest.endDate)}</p>
                                <Button variant={"outline-secondary"}
                                    onClick={() => HandleCancelRequest(vacationRequest)}>Cancel request</Button>
                                <Button variant={"outline-danger"} onClick={() => HandleDeleteRequest(vacationRequest)}>Delete
                                    request</Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>)
        }
        )}
        <h4>Incoming requests</h4>
        {incomingVacationRequests.map((vacationRequest) => {

            return (<>
                <Card className={"w-100"} key={vacationRequest.id}>
                    <Card.Body className="d-flex flex-column bg-succes">
                        <Row>
                            <Col>
                                <p className='m-0 fs-5'>{vacationRequest.status}</p>
                                <p className='m-0 fs-5'>{vacationRequest.infoAboutRequest}</p>
                                <p className='m-0 fs-5'>Requester - {vacationRequest.requester.fullName}</p>

                            </Col>
                            <Col>
                                <p className='m-0 fs-5'>{getPlainDate(vacationRequest.startDate)} - {getPlainDate(vacationRequest.endDate)}</p>
                                {vacationRequest.status !== "Canceled" ? <>
                                    <Button variant={"outline-success"}
                                        onClick={() => HandleApprove(vacationRequest)}>Approve</Button>
                                    <Button variant={"outline-danger"}
                                        onClick={() => HandleDecline(vacationRequest)}>Decline</Button></> : <></>}

                                <Modal
                                    show={showReactionMessage}
                                    backdrop="static"
                                    keyboard={false}
                                    centered
                                    data-bs-theme="dark"
                                    onHide={() => setShowReactionMessage(false)}
                                >
                                    <Form onSubmit={(e) => HandleReactionMessageSubmit(e)}>
                                        <Modal.Header closeButton>Reaction message</Modal.Header>
                                        <Modal.Body>
                                            <Form.Group>
                                                <Form.Label>Reaction message</Form.Label>
                                                <Form.Control type="text" value={reactionMessage}
                                                    onChange={e => setReactionMessage(e.target.value)} />
                                            </Form.Group>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="outline-secondary"
                                                onClick={() => setShowReactionMessage(false)}>Close</Button>
                                            <Button variant="outline-success" type="submit">Submit</Button>
                                        </Modal.Footer>
                                    </Form>
                                </Modal>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </>)
        })}
        { }
    </>)
}