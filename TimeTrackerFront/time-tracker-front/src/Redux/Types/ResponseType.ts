export type response<T = any> = {
    data:T,
    errors?:any
}
export type Message = {
    message: string
}