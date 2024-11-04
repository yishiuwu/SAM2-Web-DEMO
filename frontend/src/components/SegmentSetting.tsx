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

    const [selectedLabel, setSelectedLabel] = useState<'add' | 'minus'>('add');

    const handlePointLabel = (e: ChangeEvent<HTMLInputElement>) => {
        const label = e.currentTarget.id === "add" ? 1 : 0;
        props.handlePointLabel(label);
    };

    return (
        <div className='h-full p-4 flex flex-col space-y-4'>
            {/* input state (add or minuse) */}
            <div className='flex-col'>
                <div className="flex col-span-1 items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                    <input defaultChecked onChange={handlePointLabel} id="add" type="radio" value="" name="input-format" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                    <label htmlFor="add" className="py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Add</label>
                </div>
                <div className="flex col-span-1 items-center ps-4 border border-gray-200 rounded dark:border-gray-700">
                    <input onChange={handlePointLabel} id="minus" type="radio" value="" name="input-format" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                    <label htmlFor="minus" className="py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Minus</label>
                </div>
            </div>
            <div>
                <button onClick={()=>{}}>Clear</button> 
            </div>
                
        </div>
    );
}
