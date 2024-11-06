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

    const [selectedLabel, setSelectedLabel] = useState('add');

    const handlePointLabel = (e: MouseEvent<HTMLButtonElement>) => {
        const label = e.currentTarget.id === "add" ? 1 : 0;
        setSelectedLabel(e.currentTarget.id);
        props.handlePointLabel(label);
    };

    return (
        <div className='p-4 flex flex-row space-x-4 items-center justify-items-center'>
            {/* input state (add or minus) */}
            <div className='inline-flex rounded-md shadow-sm' role='group'>
                <button type="button" onClick={handlePointLabel} id='add' 
                className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border ${selectedLabel==='add'?"border-blue-500 dark:border-blue-500":"border-gray-200 dark:border-gray-700 border-r-0 "} rounded-s-lg hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 `}>
                    Add
                </button>
                <button type="button" onClick={handlePointLabel} id='minus' 
                className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border ${selectedLabel==='minus'?"border-blue-500 dark:border-blue-500":"border-gray-200 dark:border-gray-700 border-l-0 "} rounded-e-lg hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 `}>
                    Minus
                </button>
            </div>
            <div className='inline-flex rounded-md shadow-sm p-4'>
                <button className='px-4 py-2 text-sm font-medium text-gray-900 bg-white border rounded border-gray-200 dark:border-gray-700 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-white dark:hover:text-white dark:hover:bg-gray-700' 
                onClick={props.handelClear}>Clear</button> 
            </div>
                
        </div>
    );
}
