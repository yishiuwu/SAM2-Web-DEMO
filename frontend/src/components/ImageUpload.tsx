"use client"
import { Input } from 'postcss';
import { ChangeEvent, MouseEventHandler, useRef, useState } from 'react';
import PromptPlaceholder from './PromptPlaceholder';
import getConfig from 'next/config';
import ImageEditor from './ImageEditor';
import UploadFileButton from './UploadFileButton';
import MyImage from './MyImage';

const APP_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ImageUpload() {
    // const [image, setImage] = useState(File.prototype);
    const [imageSrc, setImageSrc] = useState('');
    // const [message, setMessage] = useState('');
    const [prompt, setPrompt] = useState('');

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

    return (
        <div>
            {!imageSrc &&
                (<UploadFileButton handleFileChange={handleFileChange} />)
            }

            {imageSrc &&
                (<div className='grid grid-cols-4 h-screen'>
                    <div className='col-span-3 flex flex-col'>
                        {/* <div className='h-[75vh] flex justify-center items-center mb-4'>
                            <img src={imageSrc} className='max-h-full max-w-full object-contain p-2'/>
                        </div> */}
                        <MyImage image_src={imageSrc} handle_click={()=>{}}></MyImage>
                        <div className='flex flex-row h-20 p-4'>
                            <input className='flex-auto mr-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                                type='text' placeholder='target item, e.g. cloth' onChange={handleTextChange} />
                            <div className='flex flex-col w-20 p-2'>
                                <div>
                                    <button className='text-white bg-gradient-to-r from-green-600 to-green-700 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2' 
                                    onClick={handlePrompt}>Send Prompt</button>
                                </div>
                                <UploadFileButton handleFileChange={handleFileChange} />
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col col-span-1 bg-gray-200 dark:bg-gray-800 ml-3'>
                        <h4 className='flex justify-center font-serif'>Style Selector</h4>
                        <div className='grid grid-cols-2 gap-4'>
                            <button className='col-span-1'>test1</button>
                            <button className='col-span-1'>test2</button>
                            <button className='col-span-1'>test3</button>
                            <button className='col-span-1'>test4</button>
                        </div>
                    </div>
                </div>)
            }
            
        </div>
    );
}
