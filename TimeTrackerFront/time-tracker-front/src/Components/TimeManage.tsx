/// <reference types="react-scripts" />
import React, { useState } from 'react';
import { Container, Nav, Image, Alert, FloatingLabel, Modal, Accordion, Navbar, NavDropdown, Button, Offcanvas, Form, ListGroup, ListGroupItem, Card, Col, Row } from "react-bootstrap";
import '../Custom.css';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../Redux/store";
import { setTimeE } from '../Redux/epics';
import { useEffect } from 'react';
import { setloadingStatus, setIdleStatus, statusType, plusOneSecond } from '../Redux/Slices/TimeSlice';
import { RequestSetStartDate, RequestSetEndDate } from '../Redux/Requests/TimeRequests';
import { Time } from '../Redux/Types/Time';
import { useImmer } from 'use-immer';
import { TimeStringFromSeconds } from './TimeTracker';
import NotificationModalWindow from './NotificationModalWindow';
import { MasssgeType } from './NotificationModalWindow';
import CheckModalWindow from './CheckModalWindow';

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

export default function TimeManage(props: { isShowed: boolean, setShowed: (smth: boolean) => void, userId: number }) {

  const [selected, setSelected] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkWarning, setCheckWarning] = useState("");

  const timeUser: Time = {
    daySeconds: 4252,
    weekSeconds: 33252,
    monthSeconds: 53252
  }

  const [changedTime, setChangedTime] = useImmer({ ...timeUser })
  const [anyInputTimeString, setAnyInputTimeString] = useState("")

  const handleSaveChange = () => {
    switch (selected) {
      case 0:
        timeUser.daySeconds = changedTime.daySeconds;
        timeUser.weekSeconds = changedTime.weekSeconds;
        timeUser.monthSeconds = changedTime.monthSeconds;
        break;

      case 1:
        timeUser.weekSeconds = changedTime.weekSeconds;
        timeUser.monthSeconds = changedTime.monthSeconds;
        break;
      case 2:
        timeUser.monthSeconds = changedTime.monthSeconds;
    }
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

  const canDoChangeAssign = (seconds: number) => {
    switch (selected) {
      case 0:
        if (seconds>=0 && seconds<= maxForDay) {
          setChangedTime((time) => {
            time.monthSeconds += seconds - time.daySeconds
            time.weekSeconds += seconds - time.daySeconds
            time.daySeconds = seconds
          })
          return true;
        }
        return false;

      case 1:
        if (seconds>=0 && seconds<= maxForWeek) {
          setChangedTime((time) => {
            time.monthSeconds += seconds - time.weekSeconds
            time.weekSeconds = seconds
          })
          return true;
        }
        return false;
      case 2:
        if (seconds>=0 && seconds<= maxForMonth) {
          setChangedTime((time) => {
            time.monthSeconds = seconds
          })
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
                defaultValue={0}>
                <option value="0">Day</option>
                <option value="1">Week</option>
                <option value="2">Month</option>
              </Form.Select>
            </FloatingLabel>
          </Col>
          <Col>
            <FloatingLabel label="I wanna set ">
              <Form.Control type='text' onChange={(e) => setAnyInputTimeString(e.target.value)}></Form.Control>
            </FloatingLabel>
          <Form.Label className='text-muted small'>format hh:mm (for exmaple 45:32). If you wanna change time by button, you must clear above field</Form.Label>
          </Col>
          <Col>
            <Alert className='p-1 text-center' variant='secondary'>
              Current time for {FromIndexToString(selected)} <br /> {FullTimeFromSeconds(time)}
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
              props.setShowed(!props.isShowed)
            }}>Cancel</Button>
            <Button variant="success" onClick={() => {

              if (anyInputTimeString != "") {
                const timeStr = anyInputTimeString.split(':');
                const numberTimeArray = timeStr.map(function (element) {
                  return Number.parseInt(element);
                });
                const hours = numberTimeArray[0];
                const minutes = numberTimeArray[1];

                if (Number.isNaN(hours) || Number.isNaN(minutes)) {
                  setError(uncorrectTimeError)
                  return;
                }

                if (hours < 0 || minutes < 0) {
                  setError(negativeTimeError);
                }

                if (minutes > 60) {
                  setError(uncorrectMinutesError)
                  return;
                }

                const seconds = hours * 60 * 60 + minutes * 60;
                if (!isCorrectUltimateTime(seconds, selected, setError))
                  return;

                  if(!canDoChangeAssign(seconds))
                  return;
              }

              handleSaveChange();
              setError("");
              setSuccess("Changes was successfully saved")
            }}>Save changes</Button>
          </Col>
        </Row>
      </Modal.Footer>
    </Modal>
    <NotificationModalWindow isShowed={error !== ""} dropMassege={setError} messegeType={MasssgeType.Error}>{error}</NotificationModalWindow>
    <NotificationModalWindow isShowed={success !== ""} dropMassege={setSuccess} messegeType={MasssgeType.Success}>{success}</NotificationModalWindow>
    <CheckModalWindow isShowed={checkWarning !== ""} dropMassege={setCheckWarning} messegeType={MasssgeType.Warning} agree={() => {
      setChangedTime(time => {
        time.daySeconds = 0;
        time.weekSeconds = 0;
        time.monthSeconds = 0;
      });
      setSelected(0);
      setError("");
      handleSaveChange();
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