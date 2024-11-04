"use client"

import Image from "next/image";

const APP_URL = process.env.NEXT_PUBLIC_API_URL;

interface SBtnProps {
    src: string,
    callback: (post_img:string)=>{}
}

export default function MaskButton(props: SBtnProps) {
    // const [image, setImage] = useState(File.prototype);

    const handleStyleClick = async () => {        
        try {
            const response = await fetch(APP_URL + '/api/select_mask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'mask_image': props.src }),
            });
            const result = await response.json();
            if (response.ok) {
                // setStyledImageSrc(`${APP_URL}${result.file_path}?timestamp=${new Date().getTime()}}`);
                // // 在這裡處理後端的回應，例如顯示結果
                props.callback(`${APP_URL}${result.file_path}?timestamp=${new Date().getTime()}}`);
                console.log('Style applied:', result);
            }
        } catch (error) {
            console.error('Error applying mask:', error);
        }
    };

    return (
        <div className='flex col-span-1 justify-center items-center'>
            <button className="p-0 rounded-md overflow-hidden border-4 border-slate-500" onClick={handleStyleClick}>
                <img src={APP_URL + '/image' + props.src} alt={props.src} className="w-full h-full object-contain" />
            </button>            
        </div>
        
    );
}
