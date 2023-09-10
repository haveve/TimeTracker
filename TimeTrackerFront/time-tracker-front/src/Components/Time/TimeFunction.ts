import { statusType } from "../../Redux/Slices/TimeSlice";

export function TimeStringFromSeconds(seconds: number): timeClockType {
    const hours = Math.floor(seconds / (60 * 60));
    const minutes = Math.floor((seconds - hours * 60 * 60) / 60);
    const second = seconds - hours * 60 * 60 - minutes * 60;

    return {
        hours,
        minutes,
        seconds: second,
        stringTime: `${hours < 10 ? 0 : ''}${hours}:${minutes < 10 ? 0 : ''}${minutes}:${second < 10 ? 0 : ''}${second}`
    };
}

export type timeClockType = {
    hours: number,
    minutes: number,
    seconds: number,
    stringTime: string
};

export function IsSuccessOrIdle(status: statusType) {
    if (status === "success") {
        return true;
    }
    if (status === "idle")
        return true;
    return false;
}