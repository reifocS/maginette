import { useState, useEffect } from "react";

export default function useKeyPress(targetKey: string): boolean {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = useState(false);
    // If pressed key is our target key then set to true

    // Add event listeners
    useEffect(() => {
        function downHandler({ key }: KeyboardEvent): void {
            console.log(key)
            if (key === targetKey) {
                setKeyPressed(true);
            }
        }
        // If released key is our target key then set to false
        const upHandler = ({ key }: KeyboardEvent): void => {
            if (key === targetKey) {
                setKeyPressed(false);
            }
        };
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, [targetKey]); // Empty array ensures that effect is only run on mount and unmount
    return keyPressed;
}