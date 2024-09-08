"use client"
import { ChangeEvent, useState } from 'react';

export default function ImageUpload() {
    const [image, setImage] = useState(File.prototype);
    const [imageSrc, setImageSrc] = useState('');
    const [message, setMessage] = useState('');

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
            const response = await fetch('http://localhost:5000/api/testapi', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                setMessage('File uploaded successfully!');
                setImageSrc('http://localhost:5000'+result.file_path);
            } 
            else {
                setMessage(result.error || 'Error uploading file');
            }
        } catch (error) {
            console.log(error);
            setMessage('Error connecting to the server');
        }
    };

  return (
    <div>
      <h1>Upload an Image</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {message && <p>{message}</p>}
      {imageSrc &&
        (<img src={imageSrc} width={300} height={300}/>)
      }
    </div>
  );
}
