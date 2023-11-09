import React from 'react';

type ChallengeProgressBarProps = {
    currentValue: number;
    thresholds: number[];
    name: string;
    description: string;
};
const ChallengeProgressBar = ({ currentValue, thresholds, name, description }: ChallengeProgressBarProps) => {
    // Assume the maximum value is the last threshold value for simplicity
    const maxValue = Math.max(...thresholds);
    // Calculate the width of the progress bar based on the current value
    const progressWidth = Math.min((currentValue / maxValue) * 100, 100);
    console.log(progressWidth, currentValue, maxValue);
    return (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-[200px]">
            <div className="mb-4">
                <h1 className="font-bold text-xl mb-2">{name}</h1>
                <p className="text-sm">{description}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4 relative">
                <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${progressWidth}%` }}
                ></div>
                {thresholds.map((threshold: number, index: number) => (
                    <div
                        key={index}
                        className={`absolute mt-1 -ml-3 flex flex-col text-center w-8 \${currentValue >= threshold.value ? 'text-green-600' : 'text-gray-500'}`}
                        style={{ fontSize: '0.5rem', left: `${(threshold / maxValue) * 100}%` }}
                    >
                        <p>|</p>
                        <p>{threshold}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChallengeProgressBar;