"use client"
import { ChangeEvent, useState } from 'react';

export default function PromptPlaceholder() {
    const [prompt, setPrompt] = useState('');

    const handleTextChange = (e:ChangeEvent<HTMLInputElement>) => {
        const text = e.target.textContent;
        if (text) {
            setPrompt(text);
        }
    };

    const handlePromptSubmit = async () => {
        if (!prompt) {
            // setMessage('Please select a file.');
            return;
        }

        const formData = new FormData();
        formData.append('prompt', prompt);

        try {
            const response = await fetch('http://localhost:5000/api/app', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                // setMessage('File uploaded successfully!');
                // setImageSrc('http://localhost:5000'+result.file_path);
            } 
            else {
                // setMessage(result.error || 'Error uploading file');
            }
        } catch (error) {
            console.log(error);
            // setMessage('Error connecting to the server');
        }
    };

  return (
    <div>
        <input 
            type='text' placeholder='target item, e.g. cloth' onChange={handleTextChange} />
    </div>
  );
}
