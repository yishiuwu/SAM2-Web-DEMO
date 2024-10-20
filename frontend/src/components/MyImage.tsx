"use client"

import { MouseEvent, MouseEventHandler } from "react";

interface ImageProps {
    image_src: string;
    handle_click: ()=>void;
}
export default function MyImage(props:ImageProps) {

    const handleClick = (e:MouseEvent<HTMLImageElement>) => {
        var rect = e.currentTarget.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        console.log("Left? : " + x + " ; Top? : " + y + ".");
        
    }

    return (
        <div className='h-[75vh] flex justify-center items-center mb-4 p-2'>
            <img src={props.image_src} onClick={handleClick} className='max-h-full max-w-full object-contain'/>
        </div>
    )
    
}