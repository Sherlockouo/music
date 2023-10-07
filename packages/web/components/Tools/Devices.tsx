import player from '@/web/states/player';
import React, { useEffect, useState } from 'react';
import Icon from '../Icon';
import { cx } from '@emotion/css';
import { motion } from 'framer-motion';
const AudioOutputDevices = () => {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const togglePopover = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const getAudioOutputDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                
                const audioOutputDevices = devices.filter(device => {
                    if(device.label.includes('默认') || device.label.includes('default')){
                        setSelectedDevice(device.deviceId)
                    }
                    return device.kind === 'audiooutput'
                });
                setDevices(audioOutputDevices);
            } catch (error) {
                console.error('Error getting audio output devices:', error);
            }
        };
        // update devices every 30s
        setInterval(()=>{
            getAudioOutputDevices();
        },1000 * 30)
    }, []);

    const handleDeviceChange = (deviceId: MediaDeviceInfo["deviceId"]) => {
        setSelectedDevice(deviceId);
        player.setDevice(deviceId)
    };

    return (
        <motion.div className={cx(
            'relative',
            'text-black/90 transition-colors duration-400 dark:text-white/40 hover:dark:text-white/90',
            )}
            onClick={togglePopover}
            >
            <Icon name='indent' className='h-5 w-5' />
           {isOpen && (  <div className={cx(
            'z-30 rounded-12 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-4 ',
            'border border-black/5 dark:boder-white/5 backdrop-blur-3xl dark:bg-black/60 bg-white/30',
           )}>
                <ul className='w-48'>
                    {devices.map(device => (
                        <li
                            key={device.deviceId}
                            onClick={() => handleDeviceChange(device.deviceId)}
                            className={cx(
                                'px-2 rounded-sm w-full hover:bg-black/15 hover:dark:bg-white/15 text-xs',
                                selectedDevice === device.deviceId ? 'bold bg-black/10 dark:bg-white/10' : 'normal'
                            )}
                        >
                            {device.label}
                        </li>
                    ))}
                </ul>
            </div>
           )}
        </motion.div>
    );
};

export default AudioOutputDevices;