"use client"
import { Input } from 'postcss';
import { ChangeEvent, MouseEventHandler, useRef, useState } from 'react';
import PromptPlaceholder from './PromptPlaceholder';
import getConfig from 'next/config';

const APP_URL = process.env.api_URL;

export default function ImageUpload() {
    const [image, setImage] = useState(File.prototype);
    const [imageSrc, setImageSrc] = useState('');
    const [message, setMessage] = useState('');
    const [prompt, setPrompt] = useState('');

    // const hiddenFileInput = useRef(InputEvent);


    const handleClick = () => {
        // hiddenFileInput.current.click();
    }


    const handleFileChange = (e:ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.item(0);
        if (file) {
            setImage(file);
        }
    };

    const handleUpload = async () => {
        if (!image) {
            setMessage('Please select a file.');
            return;
        }
        
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch(process.env.api_URL + '/api/upload_image', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                setMessage('File uploaded successfully!');
                setImageSrc(process.env.api_URL + result.file_path);
            } 
            else {
                setMessage(result.error || 'Error uploading file');
            }
        } catch (error) {
            console.log(error);
            setMessage('Error connecting to the server');
        }
    };

    const handleTextChange = (e:ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setPrompt(text);
        
    };

    const handlePrompt = async () => {
        if (!prompt) {
            // setMessage('Please select a file.');
            return;
        }
        
        const formData = new FormData();
        formData.append('prompt', prompt);

        try {
            const response = await fetch(APP_URL + '/api/prompt', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                console.log(result.message);
                console.log(result.prompt);
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
            <button onClick={handleClick}>
                Upload
            </button>
            <input 
                type="file" onChange={handleFileChange}
                // ref={hiddenFileInput} 
                // style={{display:'none'}} 
            />
            <button onClick={handleUpload}>Upload</button>
            {imageSrc &&
                (<>
                <img src={imageSrc} width={300} height={300}/>
                <div>
                    <input className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        type='text' placeholder='target item, e.g. cloth' onChange={handleTextChange} />
                    <button onClick={handlePrompt}>enter prompt</button>
                </div>
                </>)
            }
            
        </div>
    );
}
