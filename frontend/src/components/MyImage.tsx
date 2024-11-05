"use client"

import Image from "next/image";
import { createRef, MouseEvent, useEffect, useRef, useState } from "react";

interface ImageProps {
    image_src: string;
    handle_click: (x:number, y:number)=>void;
}

export default function MyImage(props:ImageProps) {
    const ref = createRef<HTMLImageElement>();
    const [size_r, setSize_r] = useState({width:0, height:0});
    const [size_o, setSize_o] = useState({width:0, height:0});

    // const imgOnload = (e:any)=>{
    //     setSize_r({
    //         width: e.target?.offsetWidth,
    //         height: e.target?.offsetHeight 
    //     });
    //     setSize_o({
    //         width: e.target?.naturalWidth,
    //         height: e.target?.naturalHeight 
    //     });
    // }

    // useEffect(()=>{
    //     setSize_r({
    //         width: ref.current?.offsetWidth?ref.current.offsetWidth: 0,
    //         height: ref.current?.offsetHeight?ref.current.offsetHeight: 0, 
    //     });
    //     setSize_o({
    //         width: ref.current?.naturalWidth?ref.current.naturalWidth:0,
    //         height: ref.current?.naturalHeight?ref.current.naturalHeight:0,
    //     });
    //     console.log(size_r, size_o);
    // }, [ref.current])

    const handleClick = (e:MouseEvent<HTMLImageElement>) => {
        var rect = e.currentTarget.getBoundingClientRect();
        const ori_size = {
            width: ref.current?.naturalWidth?ref.current.naturalWidth:0,
            height: ref.current?.naturalHeight?ref.current.naturalHeight:0,
        }
        const cli_size = {
            width: ref.current?.clientWidth?ref.current.clientWidth: 0,
            height: ref.current?.clientHeight?ref.current.clientHeight: 0, 
        }
        const ori_ratio = ori_size.width / ori_size.height;
        const cli_ratio = cli_size.width / cli_size.height;
        // cli_r = ori_r: no change
        // cli_r > ori_r: x padding (cli.h is resized h)
        // cli_r < ori_r: y padding (cli.w is resized w)
        const scale = cli_ratio>=ori_ratio ? cli_size.height / ori_size.height : cli_size.width / ori_size.width;
        const ren_size = {
            width: ori_size.width * scale,
            height: ori_size.height * scale
        };
        const padding = {
            x: (cli_size.width - ren_size.width)/2,
            y: (cli_size.height - ren_size.height)/2
        };
        var x = (e.clientX - rect.left - padding.x)/scale; //x position within the element.
        var y = (e.clientY - rect.top - padding.y)/scale;  //y position within the element.
        console.log(padding);
        console.log("Left? : " + x + " ; Top? : " + y + ".");
        props.handle_click(x, y);
    }

    return (
        <div className='justify-center items-center mb-4 p-2 h-full w-full'>
            <img ref={ref} src={props.image_src} alt={props.image_src} onClick={handleClick} className='h-full w-full object-contain max-h-full'/>
        </div>
    )
    
}