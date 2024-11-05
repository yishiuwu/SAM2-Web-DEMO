"use client"
import { ChangeEvent, createRef, MouseEvent, useState } from 'react';
import UploadFileButton from './UploadFileButton';
import MyImage from './MyImage';
import SegmentSetting from './SegmentSetting';
import StyleButton from './StyleButton';
import MaskButton from './MaskButton';

const APP_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ImageUpload() {
    const [imageSrc, setImageSrc] = useState('');
    const [styledImageSrc, setStyledImageSrc] = useState('');
    const [maskLabel, setMaskLabel] = useState(1);
    const [styleSrcs, setStyleSrcs] = useState(['/style1.jpg', '/style2.jpg', '/style3.jpg', '/style4.jpg']);
    const [maskSrcs, setMaskSrcs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStyling, setIsStyling] = useState(false);

    const handleFileChange = (e:ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.item(0);
        if (file) {
            // setImage(file);
            handleUpload(file, false);
        }
    };

    const handleUpload = async (image:File, isStyle:boolean) => {
        if (!image) {
            console.log('No file selected.');
            return;
        }
        
        setIsLoading(true);
        const formData = new FormData();
        formData.append('image', image);
        formData.append('isStyle', `${isStyle}`);

        try {
            const response = await fetch(APP_URL + '/api/upload_image', {
                method: 'POST',
                body: formData,
                credentials: 'include',
                // headers: {
                //         'Content-Type': 'application/json',
                //     }
            }).then((res)=>{
                setIsLoading(false);
                return res;
            });

            const result = await response.json();
            if (response.ok) {
                console.log('File uploaded successfully!');
                if (!isStyle) {
                    setImageSrc(APP_URL + result.file_path);
                } else {
                    setStyleSrcs([
                        ...styleSrcs,
                        `/${image.name}`
                    ])
                }
        
            } 
            else {
                console.log(result.error || 'Error uploading file');
            }
        } catch (error) {
            console.log(error);
            console.log(`Error connecting to the server: ${APP_URL}`);
            // console.log('Error connecting to the server');
        }
    };

    const handleImageClick = async (x: number, y:number) => {        
        const formData = new FormData();
        formData.append('point', `${x} ${y}`);
        formData.append('label', `${maskLabel}`);
        
        try {
            setIsLoading(true);

            const response = await fetch(APP_URL + '/api/generate_mask', {
                method: 'POST',
                body: formData,
            }).then((res)=>{
                setIsLoading(false);
                return res;
            });

            const result = await response.json();
            if (response.ok) {
                console.log(result.message);
                setImageSrc(`${APP_URL}${result.masked_img_pth}?timestamp=${new Date().getTime()}}`);
                // console.log(result.prompt);
            } 
            else {
                console.log(result.error || 'Error uploading file');
            }
        } catch (error) {
            console.log(error);
            // setMessage('Error connecting to the server');
        }
    }

    const handleStyleClick = async (src:string) => {
        // update styled src
        try {
            setIsLoading(true);
            const response = await fetch(APP_URL + '/api/apply_style', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'style_image': src }),
            }).then((res)=>{
                setIsLoading(false);
                return res;
            });
            const result = await response.json();
            if (response.ok) {
                setStyledImageSrc(`${APP_URL}${result.file_path}?timestamp=${new Date().getTime()}}`);
                // // 在這裡處理後端的回應，例如顯示結果
                // setStyledImageSrc(src);
                // console.log('Style applied:', result);
            }
        } catch (error) {
            console.error('Error applying style:', error);
        }
    };

    const handleStyleUpload = (e:ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.item(0);
        if (file) {
            handleUpload(file, true);
        }
    };

    const handlePointLabel = (label:number)=>{
        setMaskLabel(label);
    }

    const saveMask = async () =>{
        try {
            const response = await fetch(APP_URL + '/api/save_mask', {
                method: 'POST',
            });
            const result = await response.json();
            if (response.ok) {
                console.log('Save Mask successfully!');
                setMaskSrcs([
                    ...maskSrcs,
                    result.maslId
                ])
            }
            else {
                console.log(result.error || 'Error uploading file');
            }
        } catch (error) {
            console.log(error);
            console.log(`Error connecting to the server: ${APP_URL}`);
            // console.log('Error connecting to the server');
        }
    };

    const hiddenFileInput = createRef<HTMLInputElement>();
    return (
        <div>
            <div className='h-screen flex flex-col isolate'>
                <div className="flex flex-grow h-2/3 p-4 border-b-2 border-slate-500">
                    {/* Image 1 --> */}
                    <div className="flex w-1/2 p-2 justify-center items-center">
                        {!imageSrc && 
                            (<UploadFileButton handleFileChange={handleFileChange} />)
                        }
                        {imageSrc && 
                            (<MyImage image_src={imageSrc} handle_click={handleImageClick}></MyImage>)                            
                        }
                    </div> 
                    {/* Image 2 */}
                    <div className="flex w-1/2 p-2 justify-center items-center">
                        {!styledImageSrc && 
                            (<p className='object-none'>No style apply yet</p>)
                        }
                        {styledImageSrc && 
                            (<MyImage image_src={styledImageSrc} handle_click={handleImageClick}></MyImage>)                            
                        }
                        
                    </div>
                </div>

                <div className='flex h-1/3'>
                    <div className="flex-1 h-full  overflow-auto scrollbar-thin scrollbar-webkit dark:scrollbar-thin-dark dark:scrollbar-webkit-dark">
                        <h4 className='flex justify-center font-serif'>Style Selector</h4>
                        <div className="grid grid-cols-3 gap-4 p-4">
                            {
                                styleSrcs.map((val, idx)=>
                                    <StyleButton key={idx} src={val} callback={handleStyleClick} />
                                )
                            }
                            <div className='flex col-span-1 justify-center items-center'>
                                <button className="p-0 rounded-md overflow-hidden border-4 border-slate-500 w-20 h-20 justify-center items-center flex" onClick={()=>{hiddenFileInput.current?.click();}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </button>
                                <input 
                                    type="file" onChange={handleStyleUpload}
                                    ref={hiddenFileInput} 
                                    style={{display:'none'}} 
                                />      
                            </div>
                            {/* Add more style options as needed */}
                        </div>
                    </div>


                    <div className='flex-1 p-2 h-full overflow-auto scrollbar-thin scrollbar-webkit dark:scrollbar-thin-dark dark:scrollbar-webkit-dark'>
                        <h4 className='flex justify-center'>Mask input</h4>
                        {/* mask label */}
                        <SegmentSetting handlePointLabel={handlePointLabel} handelClear={()=>{}}></SegmentSetting>
                        <button onClick={saveMask} className="mask-fetch-button">
                            Fetch Mask Image
                        </button>
                        {
                            maskSrcs.map((val, idx)=>
                                <MaskButton key={idx} >Mask {idx}</MaskButton>
                            )
                        }
                    </div>
                    <div className='flex w-25 px-2 items-center'>
                        <UploadFileButton handleFileChange={handleFileChange} />
                    </div>

                </div>
                
                
                {isLoading &&
                    <div className='flex h-full w-full bg-gray-200 opacity-30 fixed top-0 left-0 justify-items-center items-center'>
                        {/* <p>Loading</p> */}
                    </div>                     
                }
                
            </div>
            
        </div>
    );
}
