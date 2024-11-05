"use client"

import Image from "next/image";

const APP_URL = process.env.NEXT_PUBLIC_API_URL;

interface SBtnProps {
    src: number,
    callback: (post_img:string)=>{}
}

export default function MaskButton(props: SBtnProps) {
    // const [image, setImage] = useState(File.prototype);

    const handleMaskClick = async () => {        
        try {
            console.log('Sending ID:', props.src); 
            const response = await fetch(APP_URL + '/api/select_mask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: props.src })
            });
            const result = await response.json();
            if (response.ok) {
                console.log('Select Mask');
            }
        } catch (error) {
            console.error('Error selecting mask:', error);
        }
    };

    return (
        <div className='flex col-span-1 justify-center items-center'>
            <button className="p-0 rounded-md overflow-hidden border-4 border-slate-500" onClick={handleMaskClick}>
                {/* <img src={APP_URL + '/image' + props.src} alt={props.src} className="w-full h-full object-contain" /> */}
            </button>            
        </div>
        
    );
}
