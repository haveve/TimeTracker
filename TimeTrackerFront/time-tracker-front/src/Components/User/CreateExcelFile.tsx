import {Button} from "react-bootstrap";
import {useEffect, useState} from "react";
import {RequestCurrentUserPermissions, RequestExportExcel} from "../../Redux/Requests/UserRequests";
import {Permissions} from "../../Redux/Types/Permissions";
import {Page} from "../../Redux/Types/Page";
import { useTranslation } from "react-i18next";

export default function CreateExcelFile(props:
{search: string, orderField:string, enabled: string, order: string}
){
	const {t}=useTranslation();
    const [permissions, setPermissions]=useState({} as Permissions);
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
            orderField: props.orderField,
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
        setShowDownloadButton(false);
    }
    //alert(permissions.exportExcel);
    if(permissions.exportExcel) {
        return (<>
            <Button variant="outline-primary" onClick={HandlePrepareExport}>{t("UserList.ExcelSettings")}</Button>
            {showDownloadButton ?
            <>
                <Button href={url} onClick={HandleDownloadButton} variant="outline-success">{t("UserList.DownloadExcell")}</Button>
            </> :
            <></>}
        </>)
    }
    else {
        return (<></>);
    }
}