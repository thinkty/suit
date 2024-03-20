'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Device } from '@/lib/types';
import { Loader } from '../loader/Loader';
import { CreateDeviceButton } from '../createDeviceButton/CreateDeviceButton';
import { EditDeviceButton } from '../editDeviceButton/EditDeviceButton';
import styles from './Dashboard.module.scss';

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
                        update={(updatedDevice: Device) => {
                            setDevices([...devices.slice(0,i), updatedDevice, ...devices.slice(i+1)])
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
    update,
}: {
    device: Device,
    remove: () => void,
    update: (updatedDevice: Device) => void,
}) {
    return (
        <div className={styles.cell}>
            <EditDeviceButton
                device={device}
                remove={remove}
                updateDevice={update}
            />
            <Link
                className={styles.link}
                href={{
                    pathname: 'device',
                    query: { deviceId: device.id }
                }}
            >
                <div className={styles.name}>
                    {device.name}
                </div>
                <div className={styles.valueField}>
                    <div className={styles.value}>
                        {
                            device.records === undefined || device.records.length == 0 ?
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
        </div>
    )
}
