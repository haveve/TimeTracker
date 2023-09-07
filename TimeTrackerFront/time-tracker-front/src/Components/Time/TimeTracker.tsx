import React, { useState,useEffect } from 'react';
import '../../TimeTrack.css'
import { Subscription, timer } from 'rxjs';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../Redux/store";
import { statusType,changeTimerState } from '../../Redux/Slices/TimeSlice';
import { setStartTimeE, setEndTimeE,setIsStartedE } from '../../Redux/TimeEpics';
import { TimeStringFromSeconds } from './TimeFunction';

export default function TimeTracker() {
    const [unsubTimer, setUnsubTimer] = useState(new Subscription());
    const [localTimeInSeconds, setLocalTimeInSeconds] = useState(0)

    const dispatch = useDispatch();

    const offset = useSelector((state: RootState) => {
        return state.location.userOffset;
    });

    const isStarted = useSelector((state: RootState) => {
        return state.time.time.isStarted;
    });

    useEffect(() => {
        if (isStarted) {
            const subscriber = timer(0, 1000).subscribe(n => {
                setLocalTimeInSeconds(n => n + 1);
            });
            setUnsubTimer(subscriber);
            unsubTimer.unsubscribe();
        }
    }, [isStarted])

    useEffect(() => {
            dispatch(setIsStartedE())
    },[])

    const clockTime = TimeStringFromSeconds(localTimeInSeconds);

    return <>
        <span className='ms-auto text-center time-track-font pe-4'
            onClick={() => {

                if (!isStarted) {
                    dispatch(setStartTimeE(offset))
                } else {
                    dispatch(setEndTimeE(offset))
                    unsubTimer.unsubscribe();
                }

                dispatch(changeTimerState(!isStarted));
            }}>{clockTime.stringTime}</span>
    </>
}


