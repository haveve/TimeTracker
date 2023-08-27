import {User} from "../../Redux/Types/User";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../Redux/store";
import {
    addApproverReaction,
    cancelVacationRequest,
    createVacationRequest,
    deleteVacationRequest,
    getApproversReaction,
    getIncomingVacationRequestsByApproverId,
    getVacationRequestsByRequesterId,
} from "../../Redux/VacationEpics";
import React, {useEffect, useState} from "react";
import {
    Button,
    Card,
    Col,
    Form,
    ListGroup,
    ListGroupItem,
    Modal,
    Row,
} from "react-bootstrap";
import {VacationRequest} from "../../Redux/Types/VacationRequest";
import {Error} from "../Service/Error";
import {InputVacationRequest} from "../../Redux/Types/InputVacationRequest";
import {InputApproverReaction} from "../../Redux/Types/InputApproverReaction";
import {InputVacRequest} from "../../Redux/Types/InputVacRequest";
import {ApproverNode} from "../../Redux/Types/ApproverNode";

interface ReactionReturn {
    isApproved: boolean | null,
    reaction: string | null,
}

export default function VacationRequests(props: { user: User }) {
    const dispach = useDispatch();

    const getPlainDate = (date: Date) => {
        let tempDate: Date = new Date(date);
        return (
            tempDate.getDate() +
            "/" +
            (tempDate.getMonth() + 1) +
            "/" +
            tempDate.getFullYear()
        );
    };

    const getReactionInfo = (vacationRequest: VacationRequest, user: User): ReactionReturn => {

        for (let i = 0; i < vacationRequest.approversNodes.length; i++) {
            const approverNode: ApproverNode = vacationRequest.approversNodes[i];
            if (user.id !== undefined
                && approverNode.isRequestApproved !== undefined
                && approverNode.reactionMessage !== undefined
                && approverNode.userIdApprover.toString() === user.id.toString()) {
                return {isApproved: approverNode.isRequestApproved, reaction: approverNode.reactionMessage} as ReactionReturn;
            }
        }
        return {isApproved: null, reaction: null} as ReactionReturn;
    }


    const [showReaction, setShowReaction] = useState(false);
    const initVacationRequest = {id: 0} as VacationRequest;
    const [currentVacationRequest, setCurrentVacationRequest] =
        useState(initVacationRequest);
    const [currentIncomingVacationRequest, setCurrentIncomingVacationRequest] =
        useState(initVacationRequest);
    const [showCreate, setShowCreate] = useState(false);
    const [info, setInfo] = useState("");
    const [reactionMessage, setReactionMessage] = useState("");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [showReactionMessage, setShowReactionMessage] = useState(false);
    const [showReactionModal, setShowReactionModal] = useState(false);
    const [isApproveReaction, setIsApproveReaction] = useState<boolean>();
    const [reaction, setReaction] = useState<boolean>();

    const [incomingRequestType, setIncomingRequestType] = useState('');
    const [outgoingRequestType, setOutgoingRequestType] = useState('');

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");


    const vacationRequests = useSelector(
        (state: RootState) => state.vacation.vacationRequests
    );
    useEffect(() => {
        if (props.user !== undefined && props.user.id !== undefined) {
            dispach(getVacationRequestsByRequesterId({
                approverOrRequesterId: props.user.id,
                requestStatus: outgoingRequestType
            }));
        }
    }, [dispach, outgoingRequestType, props.user]);


    const incomingVacationRequests = useSelector(
        (state: RootState) => state.vacation.incomingVacationRequests
    );
    useEffect(() => {
        if (props.user !== undefined && props.user.id !== undefined) {
            dispach(getIncomingVacationRequestsByApproverId(
                {approverOrRequesterId: props.user.id, requestStatus: incomingRequestType} as InputVacRequest
            ));
        }
    }, [dispach, incomingRequestType, props.user]);


    const approversReactions = useSelector(
        (state: RootState) => state.vacation.approversReaction
    );
    useEffect(() => {
        if (currentVacationRequest.id !== null) {
            dispach(getApproversReaction(currentVacationRequest.id));
        }
    }, [showReaction, dispach]);


    const HandleShowReaction = (inputVacationRequest: VacationRequest) => {
        setShowReaction(true);
        setCurrentVacationRequest(inputVacationRequest);
    };

    const HandleCancelRequest = (inputVacationRequest: VacationRequest) => {
        dispach(cancelVacationRequest(inputVacationRequest));
    };

    const HandleDeleteRequest = (inputVacationRequest: VacationRequest) => {
        dispach(deleteVacationRequest(inputVacationRequest));
    };

    const handleCloseCreate = () => {
        setShowCreate(false);
    };

    const HandleApprove = (inVacationRequest: VacationRequest) => {
        setCurrentIncomingVacationRequest(inVacationRequest);
        setIsApproveReaction(true);
        setShowReactionMessage(true);
    };

    const HandleDecline = (inVacationRequest: VacationRequest) => {
        setCurrentIncomingVacationRequest(inVacationRequest);
        setIsApproveReaction(false);
        setShowReactionMessage(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (startDate === undefined || endDate === undefined) {
            setShowError(true);
            setErrorMessage("Fill date fields");
            return;
        }
        if (startDate! >= endDate! || startDate <= new Date()) {
            setShowError(true);
            setErrorMessage("Select correct interval");
            return;
        }
        if (
            props.user.id !== undefined &&
            startDate !== undefined &&
            endDate !== undefined
        ) {
            const newVacationRequest: InputVacationRequest = {
                requesterId: props.user.id,
                infoAboutRequest: info,
                startDate: startDate,
                endDate: endDate,
            };
            dispach(createVacationRequest(newVacationRequest));
            setInfo("");
            setStartDate(undefined);
            setEndDate(undefined);
            setShowCreate(false);
            handleCloseCreate();
        }
    };

    const HandleSetReaction = (reaction: string) => {
        if (reaction === "Approve") {
            setReaction(true);
        } else if (reaction === "Decline") {
            setReaction(false);
        }
    }

    const HandleReactionMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (props.user.id !== undefined && isApproveReaction !== undefined) {
            const newApproverReaction: InputApproverReaction = {
                approverId: props.user.id,
                requestId: currentIncomingVacationRequest.id,
                reaction: isApproveReaction,
                reactionMessage: reactionMessage,
            };
            dispach(addApproverReaction(newApproverReaction));
            setCurrentIncomingVacationRequest(initVacationRequest);
            setShowReactionMessage(false);
        }
    };

    const HandleReactionModalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (props.user.id !== undefined && reaction !== undefined) {
            const newApproverReaction: InputApproverReaction = {
                approverId: props.user.id,
                requestId: currentIncomingVacationRequest.id,
                reaction: reaction,
                reactionMessage: reactionMessage,
            };
            dispach(addApproverReaction(newApproverReaction));
            setCurrentIncomingVacationRequest(initVacationRequest);
            setShowReactionModal(false);
        }
    }
    const HandleShowReactionModal = (vacationRequest: VacationRequest) => {
        setShowReactionModal(!showReactionModal);
        setCurrentIncomingVacationRequest(vacationRequest);
    }

    const renderStatus = (status: string) => {
        switch (status) {
            case "Approved":
                return (<p className="m-0 fs-5" style={{color: "green"}}>{status}</p>);
            case "Declined":
                return (<p className="m-0 fs-5" style={{color: "red"}}>{status}</p>);
            case "Canceled":
                return (<p className="m-0 fs-5" style={{color: "grey"}}>{status}</p>);
            case "Pending":
                return (<p className="m-0 fs-5" style={{color: "yellow"}}>{status}</p>);
            default:
                return (<></>);
        }
    }

    const renderReaction = (vacationRequest: VacationRequest, user: User) => {
        const reactionReturn = getReactionInfo(vacationRequest, props.user);
        if (reactionReturn.isApproved == null) {
            return (<>
                <Button
                    variant={"outline-success"}
                    onClick={() => HandleApprove(vacationRequest)}
                >
                    Approve
                </Button>
                <Button
                    variant={"outline-danger"}
                    onClick={() => HandleDecline(vacationRequest)}
                >
                    Decline
                </Button>
            </>)
        }
        return (<>
            <p className="m-0 fs-5">Your reaction: {reactionReturn.isApproved ? "Approved" : "Declined"}</p>
            <p className="m-0 fs-5">Reaction message: {reactionReturn.reaction}</p>
            <Button variant="outline-secondary" onClick={() => HandleShowReactionModal(vacationRequest)}>Change
                reaction</Button>
        </>)
    }

    return (
        <>
            <Row xs="auto" className="d-flex flex-row justify-content-center align-items-center m-1">
                <h4 className="m-0">My requests</h4>
                <Form.Select onChange={(e) => setOutgoingRequestType(e.target.value)}
                             className="w-25">
                    <option value="">Select type</option>
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Canceled">Canceled</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                </Form.Select>
            </Row>
            <Button
                onClick={() => {
                    setShowCreate(true);
                    setShowError(false);
                }}
                variant={"outline-primary"}
            >
                Create vacation request
            </Button>
            <Modal
                show={showCreate}
                backdrop="static"
                keyboard={false}
                centered
                data-bs-theme="dark"
                onHide={handleCloseCreate}
            >
                <Form onSubmit={(e) => handleSubmit(e)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create vacation request</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Label>Remaining days - {props.user.vacationDays}</Form.Label>
                        <Form.Group className="mb-3">
                            <Form.Label>Some info about request</Form.Label>
                            <Form.Control
                                type="text"
                                value={info}
                                onChange={(e) => setInfo(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Start date</Form.Label>
                            <Form.Control
                                type="date"
                                defaultValue={Date.now()}
                                onChange={(e) => setStartDate(new Date(e.target.value))}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Finish date</Form.Label>
                            <Form.Control
                                type="date"
                                defaultValue={Date.now()}
                                onChange={(e) => setEndDate(new Date(e.target.value))}
                            />
                            <Error
                                ErrorText={errorMessage}
                                Show={showError}
                                SetShow={() => setShowError(false)}
                            ></Error>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseCreate}>
                            Cancel
                        </Button>
                        <Button variant="success" type="submit">
                            Create
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            {vacationRequests.map((vacationRequest) => {
                return (
                    <Card className="w-100" key={vacationRequest.id}>
                        <Card.Body className="d-flex flex-column bg-succes">
                            <Row>
                                <Col>
                                    {renderStatus(vacationRequest.status)}

                                    <p className="m-0 fs-5">{vacationRequest.infoAboutRequest}</p>
                                    <Button
                                        variant="outline-info"
                                        onClick={() => HandleShowReaction(vacationRequest)}
                                    >
                                        Reaction
                                    </Button>
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
                                                } else if (
                                                    approverReaction.isRequestApproved === true
                                                ) {
                                                    reaction = "Approved";
                                                } else {
                                                    reaction = "Declined";
                                                }
                                                return (
                                                    <>
                                                        <ListGroupItem
                                                            key={approverReaction.id}
                                                            className="d-flex flex-row align-items-center justify-content-between rounded-2 mb-1"
                                                        >
                                                            <p>
                                                                {approverReaction.approver.fullName} -
                                                                <span
                                                                    className={
                                                                        reaction === "No reaction yet"
                                                                            ? " "
                                                                            : reaction === "Approved"
                                                                                ? "text-success"
                                                                                : "text-danger"
                                                                    }
                                                                >
                                  {reaction}
                                </span>
                                                                - {approverReaction.reactionMessage}
                                                            </p>
                                                        </ListGroupItem>
                                                    </>
                                                );
                                            })}
                                        </ListGroup>
                                        <Modal.Footer>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setShowReaction(false)}
                                            >
                                                Close
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>
                                </Col>
                                <Col>
                                    <p className="m-0 fs-5">
                                        {getPlainDate(vacationRequest.startDate)} -{" "}
                                        {getPlainDate(vacationRequest.endDate)}
                                    </p>
                                    <Button
                                        variant={"outline-secondary"}
                                        onClick={() => HandleCancelRequest(vacationRequest)}
                                    >
                                        Cancel request
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                );
            })}
            <Row xs="auto" className="d-flex flex-row justify-content-center align-items-center m-1">
                <h4 className="m-0">Incoming requests</h4>
                <Form.Select onChange={(e) => setIncomingRequestType(e.target.value)}
                             className="w-25">
                    <option value="">Select type</option>
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                </Form.Select>
            </Row>
            {incomingVacationRequests!.map((vacationRequest) => {
                return (
                    <>
                        <Card className={"w-100"} key={vacationRequest.id}>
                            <Card.Body className="d-flex flex-column bg-succes">
                                <Row>
                                    <Col>
                                        {renderStatus(vacationRequest.status)}
                                        <p className="m-0 fs-5">
                                            {vacationRequest.infoAboutRequest}
                                        </p>
                                        <p className="m-0 fs-5">
                                            Requester - {vacationRequest.requester.fullName} - Remaining days = {vacationRequest.requester.vacationDays}
                                        </p>
                                    </Col>
                                    <Col>
                                        <p className="m-0 fs-5">
                                            {getPlainDate(vacationRequest.startDate)} -{" "}
                                            {getPlainDate(vacationRequest.endDate)}
                                        </p>
                                        {renderReaction(vacationRequest, props.user)}

                                        <Modal
                                            show={showReactionModal}
                                            backdrop="static"
                                            keyboard={false}
                                            centered
                                            data-bs-theme="dark"
                                            onHide={() => setShowReactionModal(false)}
                                        >
                                            <Form onSubmit={(e) => HandleReactionModalSubmit(e)}>
                                                <Modal.Header closeButton>
                                                    Change reaction
                                                </Modal.Header>
                                                <Modal.Body>
                                                    <Form.Group>
                                                        <Form.Label>Reaction</Form.Label>
                                                        <Form.Select
                                                            onChange={(e) => HandleSetReaction(e.target.value)}>
                                                            <option>Select reaction</option>
                                                            <option value="Approve">Approve</option>
                                                            <option value="Decline">Decline</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Label>Reaction message</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={reactionMessage}
                                                            onChange={(e) =>
                                                                setReactionMessage(e.target.value)
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Modal.Body>
                                                <Modal.Footer>
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={() => setShowReactionModal(false)}
                                                    >
                                                        Close
                                                    </Button>
                                                    <Button variant="outline-success" type="submit">
                                                        Submit
                                                    </Button>
                                                </Modal.Footer>
                                            </Form>
                                        </Modal>
                                        <Modal
                                            show={showReactionMessage}
                                            backdrop="static"
                                            keyboard={false}
                                            centered
                                            data-bs-theme="dark"
                                            onHide={() => setShowReactionMessage(false)}
                                        >
                                            <Form onSubmit={(e) => HandleReactionMessageSubmit(e)}>
                                                <Modal.Header closeButton>
                                                    Reaction message
                                                </Modal.Header>
                                                <Modal.Body>
                                                    <Form.Group>
                                                        <Form.Label>Reaction message</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={reactionMessage}
                                                            onChange={(e) =>
                                                                setReactionMessage(e.target.value)
                                                            }
                                                        />
                                                    </Form.Group>
                                                </Modal.Body>
                                                <Modal.Footer>
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={() => setShowReactionMessage(false)}
                                                    >
                                                        Close
                                                    </Button>
                                                    <Button variant="outline-success" type="submit">
                                                        Submit
                                                    </Button>
                                                </Modal.Footer>
                                            </Form>
                                        </Modal>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </>
                );
            })}
        </>
    );
}
