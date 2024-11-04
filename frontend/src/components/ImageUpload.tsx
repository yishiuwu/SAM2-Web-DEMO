"use client"
import { ChangeEvent, createRef, MouseEvent, useState } from 'react';
import UploadFileButton from './UploadFileButton';
import MyImage from './MyImage';
import SegmentSetting from './SegmentSetting';
import StyleButton from './StyleButton';

const APP_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ImageUpload() {
    const [imageSrc, setImageSrc] = useState('');
    const [styledImageSrc, setStyledImageSrc] = useState('');
    const [maskLabel, setMaskLabel] = useState(1);
    const [styleSrcs, setStyleSrcs] = useState(['/style1.jpg', '/style2.jpg', '/style3.jpg', '/style4.jpg']);

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
            const response = await fetch(APP_URL + '/api/generate_mask', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                console.log(result.message);
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
        // setSelectedStyle(style);  // 更新狀態，顯示選擇的style
        setStyledImageSrc(src);
        
        // try {
        //     const response = await fetch(APP_URL + '/api/apply_style', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ 'style_image': style }),
        //     });
        //     const result = await response.json();
        //     if (response.ok) {
        //         // 在這裡處理後端的回應，例如顯示結果
        //         console.log('Style applied:', result);
        //     }
        // } catch (error) {
        //     console.error('Error applying style:', error);
        // }
    };

    const handleStyleUpload = (e:ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.item(0);
        if (file) {
            handleUpload(file, true);
        }
    };

    const handlePointLabel = (label:number)=>{
        // console.log(label);
        setMaskLabel(label);
    }

    const hiddenFileInput = createRef<HTMLInputElement>();
    return (
        <div>
                <div className='h-screen flex flex-col'>
                    <div className="flex flex-grow h-2/3 p-4">
                        {/* Image 1 --> */}
                        <div className="w-1/2 p-2 justify-center items-center">
                            {!imageSrc && 
                                (<UploadFileButton handleFileChange={handleFileChange} />)
                            }
                            {imageSrc && 
                                (<MyImage image_src={imageSrc} handle_click={handleImageClick}></MyImage>)                            
                            }
                        </div> 
                        {/* Image 2 */}
                        <div className="w-1/2 p-2 justify-center items-center">
                            {!styledImageSrc && 
                                (<p className='self-center'>No style apply yet</p>)
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
                        </div>
                        <div className='flex w-25 px-2 items-center'>
                            <UploadFileButton handleFileChange={handleFileChange} />
                        </div>
                    </div>
                    
                    
                </div>
            
            
        </div>
    );
}
