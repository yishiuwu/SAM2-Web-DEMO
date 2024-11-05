"use client"

import { SERVER_PROPS_EXPORT_ERROR } from "next/dist/lib/constants";
import Image from "next/image";

const APP_URL = process.env.NEXT_PUBLIC_API_URL;

interface SBtnProps {
    src: string,
    callback: (post_img:string)=>{}
}

export default function StyleButton(props: SBtnProps) {
    // const [image, setImage] = useState(File.prototype);

    const handleStyleClick = () => {
        props.callback(props.src);
    };

    return (
        <div className='flex col-span-1 justify-center items-center'>
            <button className="p-0 rounded-md overflow-hidden border-4 border-slate-500" onClick={handleStyleClick}>
                <img src={APP_URL + '/image' + props.src} alt={props.src} className="w-full h-full object-contain hover:object-scale-down" />
            </button>            
        </div>
        
    );
}
