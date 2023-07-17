import React from "react";
import { Form } from "react-bootstrap"

type Props = {
    ErrorText: string;
    Show: boolean;
    SetShow: React.Dispatch<React.SetStateAction<any>>;
  };

export const Error = (props : Props) =>  {
    return (
        <div hidden={!props.Show}>
            <Form.Text className='text-danger' onClick={() => props.SetShow(false)}>{props.ErrorText}</Form.Text>
        </div>
    );
}