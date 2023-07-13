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
import { TimeForStatisticFromSeconds } from './TimeStatistic';
import NotificationModalWindow from './NotificationModalWindow';
import { MasssgeType } from './NotificationModalWindow';
import CheckModalWindow from './CheckModalWindow';
export default function TimeManage(props: { isShowed: boolean, setShowed: (smth: boolean) => void, userId: number }) {

  const [selected, setSelected] = useState(0);
  const [error, setError] = useState("");
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
        if (checkWhetherIsPositive(changedTime, seconds, setError, selected))
          setChangedTime((time) => {
            time.daySeconds += seconds
            time.monthSeconds += seconds
            time.weekSeconds += seconds
          })
        break;

      case 1:
        if (checkWhetherIsPositive(changedTime, seconds, setError, selected))
          setChangedTime((time) => {
            time.monthSeconds += seconds
            time.weekSeconds += seconds
          })
        break;
      case 2:
        if (checkWhetherIsPositive(changedTime, seconds, setError, selected))
          setChangedTime((time) => {
            time.monthSeconds += seconds
          })
        break;
    }
  }

  const handleChangeAssign = (seconds: number) => {
    switch (selected) {
      case 0:
        if (checkWhetherIsPositive(changedTime, seconds, setError, selected))
          setChangedTime((time) => {
            time.monthSeconds += seconds - time.daySeconds
            time.weekSeconds += seconds - time.daySeconds
            time.daySeconds = seconds
          })
        break;

      case 1:
        if (checkWhetherIsPositive(changedTime, seconds, setError, selected))
          setChangedTime((time) => {
            time.monthSeconds += seconds - time.weekSeconds
            time.weekSeconds = seconds
          })
        break;
      case 2:
        if (checkWhetherIsPositive(changedTime, seconds, setError, selected))
          setChangedTime((time) => {
            time.monthSeconds = seconds
          })
        break;
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
            <Form.Label className='text-muted small'>format hh:mm (for exmaple 45:32) </Form.Label>
          </Col>
          <Col>
            <Alert className='p-1 text-center' variant='secondary'>
              Current time for {FromIndexToString(selected)} <br /> {TimeForStatisticFromSeconds(time)}
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
                  setError(`Uncorrect data or signature. You must stick to defined pattern - hh:mm
                            and your input must have only figures and one separate sign ':'
                            example of correct input - 34:12 (34:12 means - 34 hours 12 minutes)`)
                  return;
                }

                if (hours < 0 || minutes < 0) {
                  setError("hours and monutes must be both positive");
                }

                if (minutes > 60) {
                  setError(`Uncorrect minutes. Minutes must be high and equal than 0 and less and equal than 60 `)
                  return;
                }

                const seconds = hours * 60 * 60 + minutes * 60;

                if (!isCorrectUltimateTime(seconds, selected, setError))
                  return;

                setError("");
                handleChangeAssign(seconds);
              }
              handleSaveChange();

            }}>Save changes</Button>
          </Col>
        </Row>
      </Modal.Footer>
    </Modal>
    <NotificationModalWindow isShowed={error !== ""} dropMassege={setError} messegeType={MasssgeType.Error}>{error}</NotificationModalWindow>
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
        setError(`Changes that you do does user time negative. In this way you must choose less value of changing or change time by hand`)
        return false;
      }
      break;
    case 1:
      if (time.weekSeconds + secods < 0 || time.monthSeconds + secods < 0) {
        setError(`Changes that you do does user time negative. In this way you must choose less value of changing or change time by hand`)
        return false;
      }
      break;
    case 2:
      if (time.monthSeconds + secods < 0) {
        setError(`Changes that you do does user time negative. In this way you must choose less value of changing or change time by hand`)
        return false;
      }
      break;
  }

  return true;
}

export function isCorrectUltimateTime(seconds: number, selected: number, setError: (error: string) => void) {

  switch (selected) {
    case 0: if (seconds > 8 * 60 * 60) {
      setError("Your employer cannot work higher than 8 hours per day")
      return false;
    }
      break;
    case 1: if (seconds > 8 * 60 * 60 * 5) {
      setError(`Your employer cannot work higher than ${8 * 5} hours per day`)
      return false;
    }
      break;

    case 2: if (seconds > 8 * 60 * 60 * 15) {
      setError(`Your employer cannot work higher than ${8 * 15} hours per day`)
      return false;
    }
      break;

  }
  return true;

}