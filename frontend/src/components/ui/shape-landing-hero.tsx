"use client";

import { motion } from "framer-motion";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { FiChevronRight } from 'react-icons/fi';
import { useState, useEffect } from 'react';

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-white/[0.08]",
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute pointer-events-none", className)}
        >
            <motion.div
                animate={{
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                }}
                className="relative"
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r to-transparent",
                        gradient,
                        "backdrop-blur-[2px] border-2 border-white/[0.15]",
                        "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

export function HeroGeometric({
    badge = "Design Collective",
    title1 = "Elevate Your Digital Vision",
    title2 = "Crafting Exceptional Websites",
}: {
    badge?: string;
    title1?: string;
    title2?: string;
}) {
    const { token } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5 + i * 0.2,
                ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
            },
        }),
    };

    return (
        <section className="relative min-h-[92vh] w-full flex items-center justify-center overflow-hidden bg-[#070b13] border-b border-white/[0.04]">
            {/* Ambient gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-indigo-500/[0.04] blur-3xl" />

            {/* Geometric Shapes Layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <ElegantShape
                    delay={0.3}
                    width={500}
                    height={120}
                    rotate={12}
                    gradient="from-blue-500/[0.12]"
                    className="left-[-8%] md:left-[-3%] top-[15%] md:top-[20%]"
                />

                <ElegantShape
                    delay={0.5}
                    width={450}
                    height={100}
                    rotate={-15}
                    gradient="from-indigo-500/[0.12]"
                    className="right-[-4%] md:right-[0%] top-[65%] md:top-[70%]"
                />

                <ElegantShape
                    delay={0.4}
                    width={260}
                    height={70}
                    rotate={-8}
                    gradient="from-violet-500/[0.1]"
                    className="left-[5%] md:left-[10%] bottom-[8%] md:bottom-[12%]"
                />

                <ElegantShape
                    delay={0.6}
                    width={180}
                    height={50}
                    rotate={20}
                    gradient="from-blue-600/[0.1]"
                    className="right-[12%] md:right-[16%] top-[10%] md:top-[15%]"
                />

                <ElegantShape
                    delay={0.7}
                    width={130}
                    height={35}
                    rotate={-25}
                    gradient="from-cyan-500/[0.08]"
                    className="left-[18%] md:left-[22%] top-[5%] md:top-[10%]"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
                    {/* Badge */}
                    <motion.div
                        custom={0}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8"
                    >
                        <Circle className="h-2 w-2 fill-blue-500/80 text-blue-500" />
                        <span className="text-xs text-white/60 tracking-wider uppercase font-semibold">
                            {badge}
                        </span>
                    </motion.div>

                    {/* Shimmering Title */}
                    <motion.div
                        custom={1}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold mb-6 tracking-tight leading-[1.1] text-white">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                                {title1}
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-white to-indigo-300">
                                {title2}
                            </span>
                        </h1>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.div
                        custom={2}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-8 leading-relaxed font-light tracking-wide max-w-lg mx-auto px-4">
                            A high-performance minimalist notes workspace to compose, organize, and filter notes. Optimized for ultimate clarity and focus.
                        </p>
                    </motion.div>

                    {/* CTA Action Buttons */}
                    <motion.div
                        custom={3}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto z-20"
                    >
                        {mounted && token ? (
                            <Link href="/dashboard" className="btn-primary bg-blue-500 hover:bg-blue-600 text-white border-none px-6 py-2.5 text-xs rounded shadow-xs flex items-center gap-2 w-full sm:w-auto justify-center font-medium">
                                Open Workspace <FiChevronRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/register" className="btn-primary bg-blue-500 hover:bg-blue-600 text-white border-none px-6 py-2.5 text-xs rounded shadow-xs flex items-center gap-2 w-full sm:w-auto justify-center font-medium">
                                    Get Started Free <FiChevronRight className="w-4 h-4" />
                                </Link>
                                <Link href="/login" className="btn-secondary border-white/10 hover:bg-white/5 text-gray-300 hover:text-white px-6 py-2.5 text-xs rounded w-full sm:w-auto text-center bg-transparent font-medium">
                                    Log In
                                </Link>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Smooth transition fade-out wrapper */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b13] via-transparent to-transparent pointer-events-none" />
        </section>
    );
}

export default HeroGeometric;
