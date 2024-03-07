'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Device, DeviceRecord } from '@/lib/types';
import styles from './Graph.module.scss';
import { Loader } from '../loader/Loader';

export function Graph({
    deviceId,
} : {
    deviceId: string,
}) {

    const pathname = usePathname();
    const [device, setDevice] = useState<Device|null>(null);

    // Fetch all device records
    useEffect(() => {

        fetch(pathname + `/api?deviceId=${deviceId}`, { cache: 'no-cache', method: 'GET' })
            .then(response => response.json())
            .then(body => {
    
                const { data } = body;
                if (data === undefined) {
                    console.error('Received trash');
                    return;
                }
    
                console.log(data);
                setDevice(data);
            })
            .catch(error => {
                console.error(error);
            });
    
    }, []);

    if (!device) {
        return (
            <div className={styles.graph}>
                <Loader />
            </div>
        );
    }

    return (
        <div className={styles.graph}>
            <div className={styles.header}>

                <div className={styles.title}>
                    {device.name}
                    <div className={styles.did}>
                        {`[${device.id}]`}
                    </div>
                </div>

                {
                    device.valueType == 'number' ?
                    <div className={styles.numberType}>
                        {device.valueType}
                    </div> :

                    <div className={styles.stringType}>
                        {device.valueType}
                    </div>
                }
            </div>

            <div className={styles.diagram}>
                actual diagram
            </div>

            <AddNewRecordForm
                deviceId={deviceId}
                addNewRecord={(newRecord) => {
                    // TODO: show UI change
                    console.log(newRecord);
                }}
            />
        </div>
    );
}

function AddNewRecordForm({
    deviceId,
    addNewRecord,
}: {
    deviceId: string,
    addNewRecord: (newRecord: DeviceRecord) => void,
}) {

    const pathname = usePathname();
    const [tmpVal, setTmpVal] = useState<string>('');

    return (
        <div className={styles.addForm}>
            <input
                value={tmpVal}
                onChange={(e) => {setTmpVal(e.target.value)}}
            />
            <div
                className={styles.addButton}
                onClick={(e) => {
                    e.stopPropagation();

                    if (tmpVal == '') {
                        window.alert('Value cannot be empty!');
                        return
                    }

                    // Add new record to the database
                    fetch(pathname + '/api', {
                        method: 'POST',
                        headers: { 'Content-type': 'application/json' },
                        body: JSON.stringify({ deviceId, value: tmpVal })
                    })
                        .then((response) => response.json())
                        .then((record) => {
                            console.log(record);
                            addNewRecord(record);
                            setTmpVal('');
                        })
                        .catch((error) => {
                            alert('Could not add new device');
                            console.error(error);
                        });
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path xmlns="http://www.w3.org/2000/svg" d="M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z" fill="#0D0D0D"></path>
                </svg>
            </div>
        </div>
    );
}
