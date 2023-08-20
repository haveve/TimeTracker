import {Button} from "react-bootstrap";
import {User} from "../Redux/Types/User";
import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {RequestCurrentUser, RequestCurrentUserPermissions, RequestExportExcel} from "../Redux/Requests/UserRequests";
import {Permissions} from "../Redux/Types/Permissions";
import {Page} from "../Redux/Types/Page";

export default function CreateExcelFile(props:
{search: string, orderfield:string, enabled: string, order: string}
){
    const [user,setUser]=useState({} as User);
    const [permissions, setPermissions]=useState({} as Permissions);
    const dispatcher = useDispatch();
    const [showDownloadButton, setShowDownloadButton]=useState(false);
    const [url,setUrl]=useState("");

    useEffect(() => {
        RequestCurrentUserPermissions().subscribe((p) => {
            setPermissions(p);
        });

    }, []);
    const HandlePrepareExport = ()=>{
        const page : Page = {
            search: props.search,
            orderfield: props.orderfield,
            order: props.order,
            enabled: props.enabled
        }
        RequestExportExcel(page).subscribe(incomingUrl=>{
            console.log(incomingUrl);
            setUrl(incomingUrl);
        });
        setShowDownloadButton(true);
    }
    const HandleDownloadButton = ()=>{
        //window.location.replace(url);
        //setUrl("");
        setShowDownloadButton(false);
    }
    if(permissions.exportExcel) {
        return (<>
            <Button variant="outline-primary" onClick={HandlePrepareExport}>Prepare excel with current search settings</Button>
            {showDownloadButton ?
            <>
                <Button href={url} onClick={HandleDownloadButton} variant="outline-success">Download excel</Button>
            </> :
            <></>}
        </>)
    }
    else {
        return (<></>);
    }
}