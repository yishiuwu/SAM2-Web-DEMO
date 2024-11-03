"use client"
import { ChangeEvent, MouseEvent, useState } from 'react';
import UploadFileButton from './UploadFileButton';
import MyImage from './MyImage';
import SegmentSetting from './SegmentSetting';
import StyleButton from './StyleButton';

const APP_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ImageUpload() {
    // const [image, setImage] = useState(File.prototype);
    const [imageSrc, setImageSrc] = useState('');
    // const [message, setMessage] = useState('');
    const [prompt, setPrompt] = useState('');

    const [selectedStyle, setSelectedStyle] = useState('');
    const [styledImageSrc, setStyledImageSrc] = useState('');

    const [maskLabel, setMaskLabel] = useState(1);

    // const hiddenFileInput = useRef(InputEvent);


    const handleClick = () => {
        // hiddenFileInput.current.click();
    }


    const handleFileChange = (e:ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.item(0);
        if (file) {
            // setImage(file);
            handleUpload(file);
        }
    };

    const handleUpload = async (image:File) => {
        if (!image) {
            console.log('No file selected.');
            return;
        }
        
        const formData = new FormData();
        formData.append('image', image);

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
                setImageSrc(APP_URL + result.file_path);
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

    const handleTextChange = (e:ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setPrompt(text);
    };

    const handlePrompt = async () => {
        // if (!prompt) {
        //     // setMessage('Please select a file.');
        //     return;
        // }
        
        // const formData = new FormData();
        // formData.append('prompt', prompt);

        try {
            // const response = await fetch(APP_URL + '/api/prompt', {
            //     method: 'POST',
            //     body: formData,
            // });
            const response = await fetch(APP_URL + '/api/generate_mask', {
                method: 'POST',
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

    const handlePointLabel = (label:number)=>{
        // console.log(label);
        setMaskLabel(label);
    }

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
                                (<p className='m-auto'>No style apply yet</p>)
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
                                <StyleButton src={'/style1.jpg'} callback={handleStyleClick} />
                                <StyleButton src={'/style2.jpg'} callback={handleStyleClick} />
                                <StyleButton src={'/style3.jpg'} callback={handleStyleClick} />
                                <StyleButton src={'/style4.jpg'} callback={handleStyleClick} />
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
