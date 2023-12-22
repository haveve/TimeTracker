import React, { useState, useRef, useEffect, Dispatch as DispatchReact, SetStateAction, useMemo } from 'react';


export default function useWindowWidth(){
    const [width,setWidth] = useState(window.outerWidth)

    useEffect(() => {
        setWidth(window.outerWidth)
    },[window.outerWidth])

    return width
}
