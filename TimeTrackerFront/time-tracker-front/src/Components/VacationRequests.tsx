import {User} from "../Redux/Types/User";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../Redux/store";
import {
    getApprovers,
    getApproversReaction,
    getVacationRequestsByRequesterId,
    getVacationRequestsEpic
} from "../Redux/epics";
import React, {useEffect, useState} from "react";
import {Button, Card, Col, ListGroup, ListGroupItem, Modal, Row} from "react-bootstrap";
import {VacationRequest} from "../Redux/Types/VacationRequest";


export default function VacationRequests(props: { user: User }) {
    const dispach = useDispatch();
    const getPlainDate = (date: Date) => {
        let tempDate: Date = new Date(date);
        return tempDate.getDate() + "/" + tempDate.getMonth() + "/" + tempDate.getFullYear()
    }

    const [showReaction, setShowReaction] = useState(false);
    const initVacationRequest = {} as VacationRequest;
    const [currentVacationRequest, setCurrentVacationRequest] = useState(initVacationRequest);

    const vacationRequests = useSelector((state: RootState) => state.vacation.vacationRequests);

    useEffect(() => {
        if (props.user !== undefined && props.user.id !== undefined) {
            dispach(getVacationRequestsByRequesterId(props.user.id))
        }
    }, [dispach, props.user])

    const approversReactions = useSelector((state: RootState) => state.vacation.approversReaction)
    console.log(approversReactions)
    useEffect(() => {
        if(currentVacationRequest.id!==null) {
            console.log("id");
            console.log(currentVacationRequest.id);

            dispach(getApproversReaction(currentVacationRequest.id))
        }
    }, [showReaction,dispach])

    const HandleShowReaction = (inputVacationRequest: VacationRequest) => {
        setShowReaction(true);
        setCurrentVacationRequest(inputVacationRequest);
    }

    return (<>
        <h4>My requests</h4>
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
                                        onHide={()=>setShowReaction(false)}
                                    >
                                        <Modal.Header>ApproversReaction</Modal.Header>
                                        <ListGroup className="w-75 d-flex flex-column">
                                            {approversReactions.map((approverReaction) => {

                                                return (<>
                                                <ListGroupItem key={approverReaction.id}>
                                                    <p>{approverReaction.approver.fullName} - {approverReaction.isRequestApproved} - {approverReaction.reactionMessage}</p>
                                                </ListGroupItem>

                                                </>)

                                            })}
                                        </ListGroup>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={()=>setShowReaction(false)}>Close</Button>
                                        </Modal.Footer>
                                    </Modal>
                                </Col>
                                <Col>
                                    <p className='m-0 fs-5'>{getPlainDate(vacationRequest.startDate)} - {getPlainDate(vacationRequest.endDate)}</p>

                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>)
            }
        )}
    </>)
}