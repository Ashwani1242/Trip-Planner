"use client";

import { useState, useEffect } from "react";

interface AnimatedCounterProps {
    value: number;
    decimals?: number;
    suffix?: string;
    duration?: number;
}

export function AnimatedCounter({
    value,
    decimals = 0,
    suffix = "",
    duration = 1000
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        const startValue = displayValue;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeOutQuad = (t: number) => t * (2 - t);
            const currentValue = startValue + (value - startValue) * easeOutQuad(progress);

            setDisplayValue(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }, [value, duration]);

    return <span>{displayValue.toFixed(decimals)}{suffix}</span>;
}
