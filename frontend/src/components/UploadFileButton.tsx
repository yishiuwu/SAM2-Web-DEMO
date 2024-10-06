"use client"
import { Input } from 'postcss';
import { ChangeEvent, createRef, MouseEventHandler, useRef, useState } from 'react';
import PromptPlaceholder from './PromptPlaceholder';
import getConfig from 'next/config';
import ImageEditor from './ImageEditor';

const APP_URL = process.env.NEXT_PUBLIC_API_URL;

interface UFBtnProps {
    handleFileChange: (e:ChangeEvent<HTMLInputElement>)=>void;
}

export default function UploadFileButton(props:UFBtnProps) {
    // const [image, setImage] = useState(File.prototype);
    const [imageSrc, setImageSrc] = useState('');
    // const [message, setMessage] = useState('');
    const [prompt, setPrompt] = useState('');

    const hiddenFileInput = createRef<HTMLInputElement>();


    const handleClick = () => {
        hiddenFileInput.current?.click();
    }


    return (
        <div>
            <button 
                className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                onClick={handleClick}>
                    Upload
            </button>
            <input 
                type="file" onChange={props.handleFileChange}
                ref={hiddenFileInput} 
                style={{display:'none'}} 
            />
        </div>
    );
}
