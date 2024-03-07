'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Device } from '@/lib/types';
import styles from './Dashboard.module.scss';
import { CreateDeviceButton } from '../createDeviceButton/CreateDeviceButton';
import { Loader } from '../loader/Loader';
import { usePathname } from 'next/navigation';

export function Dashboard() {

    const [devices, setDevices] = useState<Device[]|null>(null);
    const pathname = usePathname();

    // Fetch the devices and latest record entries (if exists) from the database
    useEffect(() => {

        fetch(pathname + 'api', { cache: 'no-cache', method: 'GET' })
            .then(response => response.json())
            .then(body => {

                const { data } = body;
                if (data === undefined || !Array.isArray(data)) {
                    console.error('Received a non-array');
                    return;
                }

                setDevices(data);
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });

    }, []);

    if (!devices) {
        return (
            <div className={styles.dashboard}>
                <Loader />
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            {
                devices.map((device, i) =>
                    <DashboardCell
                        key={device.id}
                        device={device}
                        remove={() => {
                            setDevices(devices.filter((_, index) => (index != i)));
                        }}
                    />
                )
            }
            <CreateDeviceButton
                addNewDevice={(newDevice: Device) => {
                    setDevices([...devices, newDevice]);
                }}
            />
        </div>
    )
}

function DashboardCell({
    device,
    remove,
}: {
    device: Device,
    remove: () => void,
}) {
    const pathname = usePathname();

    return (
        <Link
            className={styles.cell}
            href={{
                pathname: 'device',
                query: { deviceId: device.id }
            }}
        >
            <div
                className={styles.remove}
                onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Remove ${device.name} device?`)) {

                        // Delete the device and all its records from database
                        fetch(pathname + 'api', {
                            method: 'DELETE',
                            headers: { 'Content-type': 'application/json' },
                            body: JSON.stringify({ deviceId: device.id })
                        })
                            .then((response) => {
                                if (response.status != 200) {
                                    alert('Failed to remove device');
                                    return;
                                }
                                remove(); // Remove it from the UI
                            })
                            .catch((error) => {
                                alert('Could not add new device');
                                console.error(error);
                            });
                    }
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path xmlns="http://www.w3.org/2000/svg" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="var(--foreground-secondary)"></path>
                </svg>
            </div>
            <div className={styles.name}>
                {device.name}
            </div>
            <div className={styles.valueField}>
                <div className={styles.value}>
                    {
                        device.records.length == 0 ?
                        "-" :
                        device.records[0].value
                    }
                </div>
                {
                    device.unit != '' && 
                    <div className={styles.unit}>
                        {device.unit}
                    </div>
                }
            </div>
        </Link>
    )
}
