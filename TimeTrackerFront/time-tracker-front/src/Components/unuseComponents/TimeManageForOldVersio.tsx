/// <reference types="react-scripts" />
import React, { useState } from 'react';
import { Container, Nav, Image, Alert, FloatingLabel, Modal, Accordion, Navbar, NavDropdown, Button, Offcanvas, Form, ListGroup, ListGroupItem, Card, Col, Row } from "react-bootstrap";
import '../Custom.css';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../Redux/store";
import { Time } from '../../Redux/Types/Time';
import { useImmer } from 'use-immer';
import { TimeStringFromSeconds } from '../TimeTracker';
import NotificationModalWindow from '../NotificationModalWindow';
import { MasssgeType } from '../NotificationModalWindow';
import CheckModalWindow from '../CheckModalWindow';
import { User } from '../../Redux/Types/User';
import { setloadingStatus } from '../../Redux/Slices/UserSlice';
import { IsSuccessOrIdle } from '../TimeTracker';
import { RequestUpdateDate } from '../../Redux/Requests/TimeRequests';
import { setIdleStatus } from '../../Redux/Slices/UserSlice';
import { setErrorStatusAndError } from '../../Redux/Slices/UserSlice';
import { ErrorMassagePattern } from '../../Redux/epics';

export const maxForDay = 8 * 60 * 60;
export const maxForWeek = 8 * 60 * 60 * 5;
export const maxForMonth = 8 * 60 * 60 * 15;

export const uncorrectTimeError = `Uncorrect data or signature. You must stick to defined pattern - hh:mm
and your input must have only figures and one separate sign ':'
example of correct input - 34:12 (34:12 means - 34 hours 12 minutes)`;

export const negativeTimeError = "hours and monutes must be both positive"

export const uncorrectMinutesError = `Uncorrect minutes. Minutes must be high and equal than 0 and less and equal than 60 `

export const lessThanZeroError = `Changes that you do does user time negative. In this way you must choose less value of changing or change time by hand`

export const higherThanMaxError = `Changes that you do does user time over than max value (for day = ${maxForDay / (60 * 60)} h for week = ${maxForWeek / (60 * 60)} h for month = ${maxForMonth / (60 * 60)}  ). In this way you must choose less value of changing or change time by hand`

export default function TimeManage(props: { isShowed: boolean, setShowed: (smth: boolean) => void, User: User, setUser: (user: User) => void }) {

  const [selected, setSelected] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkWarning, setCheckWarning] = useState("");

  const errorUserList = useSelector((state: RootState) => state.users.error ? state.users.error : "");
  const userListState = useSelector((state: RootState) => state.users.status);

  const dispatch = useDispatch();

  const timeUser: Time = {
    daySeconds: props.User.daySeconds!,
    weekSeconds: props.User.weekSeconds!,
    monthSeconds: props.User.monthSeconds!,
    sessions:[]
  }

  const [changedTime, setChangedTime] = useImmer({ ...timeUser })
  const [anyInputTimeString, setAnyInputTimeString] = useState("")


  const handleSaveChange = (time: Time) => {
    dispatch(setloadingStatus());
  }

  const handleChangeAdd = (seconds: number) => {

    switch (selected) {
      case 0:
        if (checkWhetherIsPositive(changedTime, seconds, setError, selected) && checkWhetherIsLessThanMax(changedTime, seconds, setError, selected))
          setChangedTime((time) => {
            time.daySeconds += seconds
            time.monthSeconds += seconds
            time.weekSeconds += seconds
          })
        break;

      case 1:
        if (checkWhetherIsPositive(changedTime, seconds, setError, selected) && checkWhetherIsLessThanMax(changedTime, seconds, setError, selected))
          setChangedTime((time) => {
            time.monthSeconds += seconds
            time.weekSeconds += seconds
          })
        break;
      case 2:
        if (checkWhetherIsPositive(changedTime, seconds, setError, selected) && checkWhetherIsLessThanMax(changedTime, seconds, setError, selected))
          setChangedTime((time) => {
            time.monthSeconds += seconds
          })
        break;
    }
  }

  const canDoChangeAssign = (time: Time, seconds: number) => {
    switch (selected) {
      case 0:
        if (seconds >= 0 && seconds <= maxForDay) {
          time.monthSeconds += seconds - time.daySeconds
          time.weekSeconds += seconds - time.daySeconds
          time.daySeconds = seconds
          return true;
        }
        return false;

      case 1:
        if (seconds >= 0 && seconds <= maxForWeek) {
          time.monthSeconds += seconds - time.weekSeconds
          time.weekSeconds = seconds
          return true;
        }
        return false;
      case 2:
        if (seconds >= 0 && seconds <= maxForMonth) {
          time.monthSeconds = seconds
          return true;
        }
        return false;
    }
  }

  const time = Object.entries(changedTime)[selected][1];

  return <>
    <Modal
      show={props.isShowed}
      onHide={() => props.setShowed(!props.isShowed)}
      backdrop="static"
      keyboard={false}
      aria-labelledby="contained-modal-title-vcenter"
      size="lg"
      centered
      data-bs-theme="dark"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">User time manager</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className='justify-content-center d-flex flex-column w-100 align-items-center'>
          <Col className='p-1 m-0 d-flex justify-content-center w-100 gap-2'>
            <Button variant="outline-info" onClick={() => handleChangeAdd(1 * 60 * 60)}>+ 1 h</Button>
            <Button variant="outline-info" onClick={() => handleChangeAdd(30 * 60)}>+ 30 m</Button>
            <Button variant="outline-info" onClick={() => handleChangeAdd(10 * 60)}>+ 10 m</Button>
            <Button variant="outline-danger" onClick={() => handleChangeAdd(-10 * 60)}>- 10 m</Button>
            <Button variant="outline-danger" onClick={() => handleChangeAdd(-30 * 60)}>- 30 m</Button>
            <Button variant="outline-danger" onClick={() => handleChangeAdd(-60 * 60)}>- 1 h</Button>
          </Col>
        </Row>
        <Row className='mt-3'>
          <Col>
            <FloatingLabel label="I wanna change">
              <Form.Select
                onChange={(e) => {
                  setSelected(e.target.selectedIndex);
                }}
                defaultValue={selected}>
                <option value="0">Day</option>
                <option value="1">Week</option>
                <option value="2">Month</option>
              </Form.Select>
            </FloatingLabel>
          </Col>
          <Col>
            <FloatingLabel label="I wanna set ">
              <Form.Control type='text' onChange={(e) => setAnyInputTimeString(e.target.value)} value={anyInputTimeString} ></Form.Control>
            </FloatingLabel>
            <Form.Label className='text-muted small'>format hh:mm (for exmaple 45:32). If you wanna change time by button, you must clear above field</Form.Label>
          </Col>
          <Col>
            <Alert className='p-1 text-center' variant='secondary'>
              Current time for {FromIndexToString(selected)} <br /> {FullTimeFromSeconds(1)}
            </Alert>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Row className=' d-flex justify-content-between flex-row w-100'>
          <Col>
            <Button variant="danger" onClick={() => {

              setCheckWarning("Are you sure with you decision delete this user's time?")
            }}>Delete</Button>
          </Col>
          <Col className='d-flex justify-content-end gap-1'>
            <Button variant="secondary" onClick={() => {
              setChangedTime(time => {
                time.daySeconds = timeUser.daySeconds;
                time.weekSeconds = timeUser.weekSeconds;
                time.monthSeconds = timeUser.monthSeconds;
              });
              setSelected(0);
              setError("");
              setAnyInputTimeString("");
              props.setShowed(!props.isShowed)
            }}>Cancel</Button>
            <Button variant="success" onClick={() => {

              let timeC = { ...changedTime };

              if (anyInputTimeString != "") {
                const seconds = GetTimeFromString(anyInputTimeString, setError);

                if (seconds === -1.5)
                  return;

                if (!isCorrectUltimateTime(seconds, selected, setError))
                  return;

                if (!canDoChangeAssign(timeC, seconds))
                  return;

                setChangedTime(time => {
                  time.daySeconds = timeC.daySeconds;
                  time.weekSeconds = timeC.weekSeconds;
                  time.monthSeconds = timeC.monthSeconds;
                });
              }

              handleSaveChange(timeC);
              setError("");
              setSuccess("Changes was successfully saved")
            }}>Save changes</Button>
          </Col>
        </Row>
      </Modal.Footer>
    </Modal>
    <NotificationModalWindow isShowed={error !== ""} dropMassege={setError} messegeType={MasssgeType.Error}>{error}</NotificationModalWindow>
    <NotificationModalWindow isShowed={errorUserList === "" && IsSuccessOrIdle(userListState) && success !== ""} dropMassege={setSuccess} messegeType={MasssgeType.Success}>{success}</NotificationModalWindow>
    <CheckModalWindow isShowed={errorUserList === "" && checkWarning !== "" && IsSuccessOrIdle(userListState)} dropMassege={setCheckWarning} messegeType={MasssgeType.Warning} agree={() => {

      let time = {
        daySeconds: 0,
        weekSeconds: 0,
        monthSeconds: 0,
        sessions:[]   
      }

      setChangedTime(time => {
        time.daySeconds = 0;
        time.weekSeconds = 0;
        time.monthSeconds = 0;
      });

      alert(JSON.stringify(time));

      setSelected(0);
      setError("");
      handleSaveChange(time);
    }} reject={() => { }}>{checkWarning}</CheckModalWindow>
  </>
    ;
}

export function FromIndexToString(index: number) {
  switch (index) {
    case 0: return "day"
    case 1: return "week"
    default: return "month"
  }
}

export function checkWhetherIsPositive(time: Time, secods: number, setError: (error: string) => void, selected: number) {
  switch (selected) {
    case 0:
      if (time.daySeconds + secods < 0 || time.weekSeconds + secods < 0 || time.monthSeconds + secods < 0) {
        setError(lessThanZeroError)
        return false;
      }
      break;
    case 1:
      if (time.weekSeconds + secods < 0 || time.monthSeconds + secods < 0) {
        setError(lessThanZeroError)
        return false;
      }
      break;
    case 2:
      if (time.monthSeconds + secods < 0) {
        setError(lessThanZeroError)
        return false;
      }
      break;
  }

  return true;
}

export function checkWhetherIsLessThanMax(time: Time, secods: number, setError: (error: string) => void, selected: number) {
  switch (selected) {
    case 0:
      if (time.daySeconds + secods > maxForDay || time.weekSeconds + secods > maxForWeek || time.monthSeconds + secods > maxForMonth) {
        setError(higherThanMaxError)
        return false;
      }
      break;
    case 1:
      if (time.weekSeconds + secods > maxForWeek || time.monthSeconds + secods > maxForMonth) {
        setError(higherThanMaxError)
        return false;
      }
      break;
    case 2:
      if (time.monthSeconds + secods > maxForMonth) {
        setError(higherThanMaxError)
        return false;
      }
      break;
  }

  return true;
}


export function isCorrectUltimateTime(seconds: number, selected: number, setError: (error: string) => void) {

  switch (selected) {
    case 0: if (seconds > maxForDay) {
      setError(`Your employer cannot work higher than ${maxForDay / (60 * 60)} hours per day`)
      return false;
    }
      break;
    case 1: if (seconds > maxForWeek) {
      setError(`Your employer cannot work higher than ${maxForWeek / (60 * 60)} hours per week`)
      return false;
    }
      break;

    case 2: if (seconds > maxForMonth) {
      setError(`Your employer cannot work higher than ${maxForMonth / (60 * 60)} hours per month`)
      return false;
    }
      break;

  }
  return true;

}


export function FullTimeFromSeconds(secods: number) {
  const timeArray = TimeStringFromSeconds(secods).stringTime.split(":");
  return `${timeArray[0]}h ${timeArray[1]}m ${timeArray[2]}s`
}

export function GetTimeFromString(str: string, setError: (error: string) => void) {
  const timeStr = str.split(':');
  const numberTimeArray = timeStr.map(function (element) {
    return Number.parseInt(element);
  });
  const hours = numberTimeArray[0];
  const minutes = numberTimeArray[1];

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    setError(uncorrectTimeError)
    return -1.5;
  }

  if (hours < 0 || minutes < 0) {
    setError(negativeTimeError);
    return -1.5;
  }

  if (minutes > 60) {
    setError(uncorrectMinutesError)
    return -1.5;
  }

  return hours * 60 * 60 + minutes * 60;
}