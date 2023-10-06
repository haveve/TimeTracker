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
	ButtonGroup,
	Card,
	Col,
	Form,
	FormGroup,
	ListGroup,
	ListGroupItem,
	Modal,
	Row,
	ToggleButton,
} from "react-bootstrap";
import {VacationRequest} from "../../Redux/Types/VacationRequest";
import {Error} from "../Service/Error";
import {InputVacationRequest} from "../../Redux/Types/InputVacationRequest";
import {InputApproverReaction} from "../../Redux/Types/InputApproverReaction";
import {InputVacRequest} from "../../Redux/Types/InputVacRequest";
import {ApproverNode} from "../../Redux/Types/ApproverNode";
import {useTranslation} from "react-i18next";

interface ReactionReturn {
	isApproved: boolean | null,
	reaction: string | null,
}

export default function VacationRequests(props: { user: User }) {
	const dispach = useDispatch();
	const {t} = useTranslation();

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

	const [requestTypeFilter, setRequestTypeFilter] = useState("All");
	const [requestType, setRequestType] = useState("My");

	const [showError, setShowError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const vacationRequests = useSelector(
		(state: RootState) => state.vacation.vacationRequests
	);
	useEffect(() => {
		if (props.user !== undefined && props.user.id !== undefined) {
			if (requestType === "My") {
				dispach(getVacationRequestsByRequesterId({
					approverOrRequesterId: props.user.id,
					requestStatus: requestTypeFilter
				}));
			} else {
				dispach(getIncomingVacationRequestsByApproverId(
					{approverOrRequesterId: props.user.id, requestStatus: requestTypeFilter} as InputVacRequest
				));
			}
		}
	}, [dispach, requestTypeFilter, props.user, requestType]);


	const incomingVacationRequests = useSelector(
		(state: RootState) => state.vacation.incomingVacationRequests
	);

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
		setRequestTypeFilter("All");
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
			setErrorMessage(t("VacationRequests.CreateVacReqModal.fillDateFieldsError"));
			return;
		}
		if (startDate! >= endDate! || startDate <= new Date()) {
			setShowError(true);
			setErrorMessage(t("VacationRequests.CreateVacReqModal.incorrectDateIntervalError"));
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
				return (<p className="m-0 fs-5 text-green">{t("VacationRequests.VacReq.Status.approved")}</p>);
			case "Declined":
				return (<p className="m-0 fs-5 text-danger">{t("VacationRequests.VacReq.Status.declined")}</p>);
			case "Canceled":
				return (<p className="m-0 fs-5 text-grey">{t("VacationRequests.VacReq.Status.canceled")}</p>);
			case "Pending":
				return (<p className="m-0 fs-5 text-primary">{t("VacationRequests.VacReq.Status.pending")}</p>);
			default:
				return (<></>);
		}
	}

	const renderReaction = (vacationRequest: VacationRequest, user: User) => {
		const reactionReturn = getReactionInfo(vacationRequest, props.user);
		if (reactionReturn.isApproved == null) {
			return (<>
				<Button
					variant={"outline-success me-2 ms-auto"}
					onClick={() => HandleApprove(vacationRequest)}
				>
					{t("VacationRequests.VacReq.approve")}
				</Button>
				<Button
					variant={"outline-danger"}
					onClick={() => HandleDecline(vacationRequest)}
				>
					{t("VacationRequests.VacReq.decline")}
				</Button>
			</>)
		}
		return (<>
			<p
				className="m-0 fs-5">{t("VacationRequests.VacReq.yourReaction")}: {reactionReturn.isApproved ? "Approved" : "Declined"}</p>
			<p className="m-0 fs-5">{t("VacationRequests.VacReq.reactionMessage")}: {reactionReturn.reaction}</p>
			<Button variant="outline-secondary" onClick={() => HandleShowReactionModal(vacationRequest)}>
				{t("VacationRequests.VacReq.changeReactionButton")}</Button>
		</>)
	}
	return (
		<>
			<Row xs="auto" className="d-flex flex-row justify-content-center align-items-center m-1">
				<h1>{t("VacationRequests.myRequestsHeader")}</h1>
			</Row>
			<Row className="mb-2">
				<Col>
					<Form.Select onChange={(e) => setRequestTypeFilter(e.target.value)} className="w-25"
					             value={requestTypeFilter}>
						<option value="All">{t("VacationRequests.VacationType.allItem")}</option>
						<option value="Pending">{t("VacationRequests.VacationType.pendingItem")}</option>
						<option value="Canceled">{t("VacationRequests.VacationType.canceledItem")}</option>
						<option value="Approved">{t("VacationRequests.VacationType.approvedItem")}</option>
						<option value="Declined">{t("VacationRequests.VacationType.declinedItem")}</option>
					</Form.Select>
				</Col>
				<Col className="d-flex justify-content-center">
					<ButtonGroup>
						<ToggleButton value={"My"} variant={requestType === "My" ? 'dark' : 'outline-dark text-secondary'}
						              onClick={() => setRequestType("My")}>{t("VacationRequests.myRequestsHeader")}</ToggleButton>
						<ToggleButton value={"Incoming"}
						              variant={requestType === "Incoming" ? 'dark' : 'outline-dark text-secondary'}
						              onClick={() => setRequestType("Incoming")}>{t("VacationRequests.incomingRequestHeader")}</ToggleButton>
					</ButtonGroup>
				</Col>
				<Col className="d-flex">
					<Button
						onClick={() => {
							setShowCreate(true);
							setShowError(false);
						}}
						variant={"outline-success ms-auto"}
					>
						{t("VacationRequests.createVacReqButton")}
					</Button>
				</Col>
			</Row>
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
						<Modal.Title>{t("VacationRequests.CreateVacReqModal.header")}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form.Label>{t("VacationRequests.CreateVacReqModal.remainingDays")} - {props.user.vacationDays}</Form.Label>
						<Form.Group className="mb-3">
							<Form.Label>{t("VacationRequests.CreateVacReqModal.requestInfo")}</Form.Label>
							<Form.Control
								type="text"
								value={info}
								onChange={(e) => setInfo(e.target.value)}
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>{t("VacationRequests.CreateVacReqModal.startDate")}</Form.Label>
							<Form.Control
								type="date"
								defaultValue={Date.now()}
								onChange={(e) => setStartDate(new Date(e.target.value))}
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>{t("VacationRequests.CreateVacReqModal.finishDate")}</Form.Label>
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
							{t("cancel")}
						</Button>
						<Button variant="success" type="submit">
							{t("create")}
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>
			{requestType === "My" ?
				<>
					{
						vacationRequests.map((vacationRequest) => {
							return (
								<Card className="w-100 mb-2" key={vacationRequest.id}>
									<Card.Body className="d-flex flex-column bg-darkgray">
										<Row>
											<Col className="d-flex align-items-center">
												<p className="m-0 fs-5">
													{getPlainDate(vacationRequest.startDate)} -{" "}
													{getPlainDate(vacationRequest.endDate)}
												</p>
											</Col>
											<Col className="d-flex align-items-center">
												<Col className="d-flex justify-content-end me-2">
													{renderStatus(vacationRequest.status)}
												</Col>
												<Col>

													<p className="m-0 fs-5">{vacationRequest.infoAboutRequest}</p>
													<Button
														variant="outline-secondary text-white"
														onClick={() => HandleShowReaction(vacationRequest)}
													>
														{t("VacationRequests.VacReq.reactionList")}
													</Button></Col>
												<Modal
													show={showReaction}
													backdrop="static"
													keyboard={false}
													centered
													data-bs-theme="dark"
													onHide={() => setShowReaction(false)}
												>
													<Modal.Header>{t("VacationRequests.VacReq.ReactionList.header")}</Modal.Header>
													<ListGroup className="w-100 d-flex flex-column">
														{approversReactions.map((approverReaction) => {
															let reaction: string;
															let reactionClass: string;
															if (approverReaction.isRequestApproved === null) {
																reaction = t("VacationRequests.VacReq.ReactionList.noReaction");
																reactionClass = "";
															} else if (approverReaction.isRequestApproved === true) {
																reaction = t("VacationRequests.VacReq.ReactionList.approved");
																reactionClass = "text-success";
															} else {
																reaction = t("VacationRequests.VacReq.ReactionList.declined");
																reactionClass = "text-danger";
															}
															return (
																<>
																	<ListGroupItem
																		key={approverReaction.id}
																		className="d-flex flex-row align-items-center justify-content-between rounded-2 mb-1"
																	>
																		<p>
																			{approverReaction.approver.fullName}
																			<span className={reactionClass}>
																				- {reaction}
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
															{t("close")}
														</Button>
													</Modal.Footer>
												</Modal>
											</Col>
											<Col className="d-flex align-items-center">
												<Button
													variant={"outline-danger ms-auto"}
													onClick={() => HandleCancelRequest(vacationRequest)}
												>
													{t("VacationRequests.VacReq.cancelRequest")}
												</Button>
											</Col>
										</Row>
									</Card.Body>
								</Card>
							);
						})
					}</>
				:
				<>{
					incomingVacationRequests!.map((vacationRequest) => {
						return (
							<>
								<Card className={"w-100 mb-2"} key={vacationRequest.id}>
									<Card.Body className="d-flex flex-column bg-darkgray">
										<Row>
											<Col className="d-flex align-items-center">
												<p className="m-0 fs-5">
													{getPlainDate(vacationRequest.startDate)} -{" "}
													{getPlainDate(vacationRequest.endDate)}
												</p>
											</Col>
											<Col>
												{renderStatus(vacationRequest.status)}
												<p className="m-0 fs-5">
													{vacationRequest.infoAboutRequest}
												</p>
												<p className="m-0 fs-5">
													{vacationRequest.requester.fullName}, {t("VacationRequests.VacReq.remainingDays")}: {vacationRequest.requester.vacationDays}
												</p>
											</Col>
											<Col className="d-flex align-items-center">

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
															{t("VacationRequests.VacReq.ChangeReactionModal.header")}
														</Modal.Header>
														<Modal.Body>
															<Form.Group>
																<Form.Label>{t("VacationRequests.VacReq.ChangeReactionModal.reaction")}</Form.Label>
																<Form.Select
																	onChange={(e) => HandleSetReaction(e.target.value)}>
																	<option>{t("VacationRequests.VacReq.ChangeReactionModal.selectHeader")}</option>
																	<option
																		value="Approve">{t("VacationRequests.VacReq.ChangeReactionModal.approve")}</option>
																	<option
																		value="Decline">{t("VacationRequests.VacReq.ChangeReactionModal.decline")}</option>
																</Form.Select>
															</Form.Group>
															<Form.Group>
																<Form.Label>{t("VacationRequests.VacReq.ChangeReactionModal.reactionMessage")}</Form.Label>
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
																{t("cancel")}
															</Button>
															<Button variant="outline-success" type="submit">
																{t("submit")}
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
															{t("VacationRequests.VacReq.ReactionMessageModal.header")}
														</Modal.Header>
														<Modal.Body>
															<Form.Group>
																<Form.Label>{t("VacationRequests.VacReq.ReactionMessageModal.reactionMessage")}</Form.Label>
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
																{t("cancel")}
															</Button>
															<Button variant="outline-success" type="submit">
																{t("submit")}
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
					})
				}</>
			}
		</>
	);
}
