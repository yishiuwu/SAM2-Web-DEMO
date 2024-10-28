"use client"
import { ChangeEvent, MouseEvent, useState } from 'react';

const APP_URL = process.env.NEXT_PUBLIC_API_URL;

interface SSetProps {
    handlePointLabel: (l:number)=>void;
    handelClear: ()=>void;
}


export default function SegmentSetting(props:SSetProps) {
    // const [image, setImage] = useState(File.prototype);
    // const [label, setLabel] = useState(Number);

    const handlePointLabel = (e:MouseEvent<HTMLInputElement>)=>{
        // console.log(`${e.currentTarget.id}`);
        var l = 1;
        switch (e.currentTarget.id) {
            case "add":
                l=1;
                break;
            case "minus":
                l=0;
                break;
        }
        props.handlePointLabel(l);
    }

    return (
        <div className='grid'>
            {/* input state (add or minuse) */}
            <div>
                <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                    <input onClick={handlePointLabel} id="add" type="radio" value="" name="input-format" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                    <label htmlFor="add" className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Add</label>
                </div>
                <div className="flex items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                    <input onClick={handlePointLabel} id="minus" type="radio" value="" name="input-format" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                    <label htmlFor="minus" className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Minus</label>
                </div>
            </div>
            <div>
                <button onClick={()=>{}}>Clear</button> 
            </div>
                
        </div>
    );
}
