"use client"

import Image from "next/image";
import { MouseEvent } from "react";

interface ImageProps {
    image_src: string;
    handle_click: (x:number, y:number)=>void;
}

export default function MyImage(props:ImageProps) {

    const handleClick = (e:MouseEvent<HTMLImageElement>) => {
        var rect = e.currentTarget.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        // console.log("Left? : " + x + " ; Top? : " + y + ".");
        props.handle_click(x, y);
    }

    return (
        <div className='justify-center items-center mb-4 p-2 h-full w-full'>
            <img src={props.image_src} alt={props.image_src} onClick={handleClick} className='h-full w-full object-contain max-h-full'/>
        </div>
    )
    
}