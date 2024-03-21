'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Device, DeviceRecord } from '@/lib/types';
import { Loader } from '../loader/Loader';
import styles from './Graph.module.scss';

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
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={
                            device.records.sort((a, b) => a.entry - b.entry)
                                .map((record, i) => ({
                                    value: device.valueType === "number" ? parseInt(record.value) : record.value,
                                    date: record.createdAt,
                                    unit: device.unit,
                                    index: i,
                                }))
                        }
                        margin={{ left: 10, right: 50 }}
                    >
                        <XAxis
                            dataKey="index"
                            padding={{ left: 20, right: 20 }}
                        />
                        <YAxis
                            type={device.valueType === "number" ? "number" : "category"}
                            padding={{top: device.valueType === "number" ? 10 : 40, bottom: device.valueType === "number" ? 10 : 40}}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            isAnimationActive={false}
                        />
                        <Line
                            type={device.valueType === "number" ? "monotone" : "stepAfter"}
                            dataKey="value"
                            stroke={device.valueType === "number" ? "#ADD8E6" : "#90ee90"}
                            strokeWidth={3}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <AddNewRecordForm
                deviceId={deviceId}
                addNewRecord={(newRecord) => {
                    setDevice({
                        ...device,
                        records: [...device.records, newRecord],
                    });
                }}
            />
            <RecordList
                unit={device.unit}
                records={device.records}
            />
        </div>
    );
}

function RecordList({
    unit,
    records,
}: {
    unit: string,
    records: DeviceRecord[]
}) {
    if (records.length == 0) {
        return (
            <div className={styles.emptyRecordList}>
                No records...
            </div>
        );
    }

    return (
        <div className={styles.recordList}>
            <div className={styles.headers}>
                <div className={styles.header}>Date</div>
                <div className={styles.header}>Value</div>
            </div>
            <div className={styles.items}>
                {
                    records
                        .sort((a, b) => a.entry - b.entry)
                        .reverse()
                        .map((record) => (
                            <div 
                                key={`recordList${record.entry}`}
                                className={styles.item}
                            >
                                <div className={styles.field}>{new Date(record.createdAt).toLocaleString()}</div>
                                <div className={styles.field}>{`${record.value} ${unit}`}</div>
                            </div>
                        ))
                }
            </div>
        </div>
    );
}

function CustomTooltip({
    active,
    payload,
    label,
}: TooltipProps<ValueType, NameType>) {

    if (!active || !payload || payload.length == 0) {
        return null;
    }

    return (
        <div className={styles.customTooltip}>
            <p className={styles.tooltipDate}>{new Date(payload[0].payload.date).toLocaleString()}</p>
            <p className={styles.tooltipValue}>{`${payload[0].value} ${payload[0].payload.unit}`}</p>
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
