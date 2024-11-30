import React, { useState } from 'react';

const DoorLock = () => {
    const [isLocked, setIsLocked] = useState(true);

    const handleUnlock = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8080/doorlock/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'unlock' }),
            });
            if (response.ok) {
                setIsLocked(false);
                alert('Door unlocked successfully!');
            } else {
                console.error('Failed to unlock door');
            }
        } catch (error) {
            console.error('Error unlocking door:', error);
        }
    };

    return (
        <div>
            <h2>Door Lock Control</h2>
            <button onClick={handleUnlock} disabled={!isLocked}>
                {isLocked ? 'Unlock Door' : 'Door Already Unlocked'}
            </button>
        </div>
    );
};

export default DoorLock;
