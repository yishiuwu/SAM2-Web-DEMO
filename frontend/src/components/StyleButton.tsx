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
        // try {
        //     const response = await fetch(APP_URL + '/api/apply_style', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ 'style_image': props.src }),
        //     });
        //     const result = await response.json();
        //     if (response.ok) {
        //         // setStyledImageSrc(`${APP_URL}${result.file_path}?timestamp=${new Date().getTime()}}`);
        //         // // 在這裡處理後端的回應，例如顯示結果
        //         props.callback(`${APP_URL}${result.file_path}?timestamp=${new Date().getTime()}}`);
        //         console.log('Style applied:', result);
        //     }
        // } catch (error) {
        //     console.error('Error applying style:', error);
        // }
    };

    return (
        <div className='flex col-span-1 justify-center items-center'>
            <button className="p-0 rounded-md overflow-hidden border-4 border-slate-500" onClick={handleStyleClick}>
                <img src={APP_URL + '/image' + props.src} alt={props.src} className="w-full h-full object-contain hover:object-scale-down" />
            </button>            
        </div>
        
    );
}
