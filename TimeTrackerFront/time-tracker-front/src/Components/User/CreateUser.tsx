import React, {useState} from 'react';
import {Form, Button, Card, InputGroup} from "react-bootstrap";
import '../../Custom.css';
import {User} from '../../Redux/Types/User';
import {RequestCreateUser} from '../../Redux/Requests/UserRequests';
import {Error} from '../Service/Error';
import {Permissions} from '../../Redux/Types/Permissions';
import NotificationModalWindow, {MessageType} from '../Service/NotificationModalWindow';
import {ErrorMassagePattern} from '../../Redux/epics';
import {useTranslation} from "react-i18next";

function CreateUser() {
	const {t} = useTranslation();
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showError, setShowError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const [fullName, setFullName] = useState("")
	const [email, setEmail] = useState("")
	const [workHours, setWorkHours] = useState(100)
	const [cRUDUsers, setCRUDUsers] = useState(false)
	const [editApprovers, setEditApprovers] = useState(false)
	const [viewUsers, setViewUsers] = useState(false)
	const [editWorkHours, setEditWorkHours] = useState(false)
	const [exportExcel, setExportExcel] = useState(false)
	const [controlPresence, setControlPresence] = useState(false)
	const [controlDayOffs, setControlDayOffs] = useState(false)

	const HandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (email === "" || fullName === "") {
			setShowError(true);
			setErrorMessage(t("UserCreate.fillFieldsError"));
			return;
		}
		const user: User = {
			login: "login",
			password: "password",
			fullName: fullName,
			email: email,
			cRUDUsers: cRUDUsers,
			editApprovers: editApprovers,
			viewUsers: viewUsers,
			editWorkHours: editWorkHours,
			exportExcel: exportExcel,
			controlPresence: controlPresence,
			controlDayOffs: controlDayOffs,
			workHours: workHours
		}
		const permissions: Permissions = {
			userId: 0,
			cRUDUsers: cRUDUsers,
			editApprovers: editApprovers,
			viewUsers: viewUsers,
			editWorkHours: editWorkHours,
			exportExcel: exportExcel,
			controlPresence: controlPresence,
			controlDayOffs: controlDayOffs
		}
		RequestCreateUser(user, permissions).subscribe({
			next: () => {
				setSuccess(t("UserCreate.userCreated"))
			},
			error: () => setError(ErrorMassagePattern)
		})
		setFullName("")
		setEmail("")
		setWorkHours(100)
		setCRUDUsers(false)
		setEditApprovers(false)
		setViewUsers(false)
		setEditWorkHours(false)
		setExportExcel(false)
		setControlPresence(false)
		setControlDayOffs(false)
	}

	return (
		<div className="div-login-form d-flex align-items-center flex-column m-1 p-3">
			<h5 className=''>{t("UserCreate.header")}</h5>
			<Card style={{width: '20rem'}} className='d-flex align-items-center flex-column'>
				<Card.Body className='p-3 w-100'>
					<Form className="d-flex align-items-start flex-column" onSubmit={e => HandleSubmit(e)} id="createform">
						<p className='m-0'>{t("UserCreate.fullName")}</p>
						<Form.Control
							type="text"
							className="w-100 mb-3"
							onChange={(e) => setFullName(e.target.value)}
							value={fullName}
						/>
						<p className='m-0'>{t("UserCreate.email")}</p>
						<Form.Control
							type="email"
							className="w-100 mb-3"
							onChange={(e) => setEmail(e.target.value)}
							value={email}
						/>
						<p className='m-0'>{t("UserCreate.workHours")}</p>
						<InputGroup className="mb-3 w-100">
							<InputGroup.Text>%</InputGroup.Text>
							<Form.Control type='number' min={1} max={100}
							              onChange={(e) => setWorkHours(parseInt(e.target.value))}
							              value={workHours}
							/>
						</InputGroup>
						<p className='m-0'>{t("UserCreate.permissions")}</p>
						<InputGroup className="mb-3 d-flex flex-column">
							<Form.Check
								type="switch"
								id="custom-switch-1"
								label={t("UserCreate.viewUsers")}
								checked={viewUsers}
								onClick={() => {
									setViewUsers(!viewUsers);
								}}
							/>
							<Form.Check
								type="switch"
								id="custom-switch-2"
								label={t("UserCreate.exportExcel")}
								checked={exportExcel}
								onClick={() => {
									setExportExcel(!exportExcel)
								}}
							/>
							<Form.Check
								type="switch"
								id="custom-switch-3"
								label={t("UserCreate.manageUsers")}
								checked={cRUDUsers}
								onClick={() => {
									setCRUDUsers(!cRUDUsers)
								}}
							/>
							<Form.Check
								type="switch"
								id="custom-switch-4"
								label={t("UserCreate.manageApprovers")}
								checked={editApprovers}
								onClick={() => {
									setEditApprovers(!editApprovers)
								}}
							/>
							<Form.Check
								type="switch"
								id="custom-switch-5"
								label={t("UserCreate.manageWorkHours")}
								checked={editWorkHours}
								onClick={() => {
									setEditWorkHours(!editWorkHours)
								}}
							/>
							<Form.Check
								type="switch"
								id="custom-switch-6"
								label={t("UserCreate.managePresence")}
								checked={controlPresence}
								onClick={() => {
									setControlPresence(!controlPresence)
								}}
							/>
							<Form.Check
								type="switch"
								id="custom-switch-7"
								label={t("UserCreate.manageDayOffs")}
								checked={controlDayOffs}
								onClick={() => {
									setControlDayOffs(!controlDayOffs)
								}}
							/>
						</InputGroup>
						<Button type="submit" className="btn-success w-100">
							{t("UserCreate.sendEmailButton")}
						</Button>
						<Error ErrorText={errorMessage} Show={showError} SetShow={() => setShowError(false)}></Error>
					</Form>
				</Card.Body>
			</Card>
			<NotificationModalWindow isShowed={error !== ""} dropMessage={setError}
			                         messageType={MessageType.Error}>{error}</NotificationModalWindow>
			<NotificationModalWindow isShowed={success !== ""} dropMessage={setSuccess}
			                         messageType={MessageType.Success}>{success}</NotificationModalWindow>
		</div>
	);
}

export default CreateUser;
