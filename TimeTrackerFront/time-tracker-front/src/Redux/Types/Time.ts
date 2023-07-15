export interface Time{
    daySeconds:number,
    weekSeconds:number,
    monthSeconds:number
}

export interface TimeResponse{
    time:Time,
    isStarted:boolean
}

export interface TimeRequest{
    id:number,
    time:Time
}