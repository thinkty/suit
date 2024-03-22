'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Device, DeviceRecord } from '@/lib/types';
import { Loader } from '../loader/Loader';
import { Modal } from '../modal/Modal';
import styles from './Graph.module.scss';

type FilterRange = {
    startDate: Date;
    endDate: Date;
};

export function Graph({
    deviceId,
} : {
    deviceId: string,
}) {

    const pathname = usePathname();
    const [device, setDevice] = useState<Device>();
    const [records, setRecords] = useState<DeviceRecord[]>([]);
    const [filterRange, setFilterRange] = useState<FilterRange>();

    // Whenever filter range changes, re-query the records
    useEffect(() => {

        // Fetch all if reset
        if (!filterRange) {
            fetch(pathname + `/api?deviceId=${deviceId}`, { cache: 'no-cache', method: 'GET' })
            .then(response => response.json())
            .then(body => {

                const { device } = body;
                if (device === undefined) {
                    console.error('Received trash');
                    return;
                }

                console.log(device);
                setDevice(device);
                setRecords(device.records);
            })
            .catch(error => {
                console.error(error);
            });
            return;
        }

        // Fetch the specified range
        fetch(pathname + `/api?deviceId=${deviceId}&startDate=${filterRange.startDate.toISOString()}&endDate=${filterRange.endDate.toISOString()}`, { cache: 'no-cache', method: 'GET' })
        .then(response => response.json())
        .then(body => {

            const { records } = body;
            if (records === undefined) {
                console.error('Received trash');
                return;
            }

            console.log(records);
            setRecords(records);
        })
        .catch(error => {
            console.error(error);
        });
        return;
    }, [filterRange]);

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
                <div className={styles.title}>{device.name}</div>
                {
                    device.valueType == 'number' ?
                    <div className={styles.numberType}>{device.valueType}</div> :
                    <div className={styles.stringType}>{device.valueType}</div>
                }
            </div>
            <Filter
                resetRange={() => { setFilterRange(undefined); }}
                setRange={(startDate, endDate) => { setFilterRange({ startDate, endDate }); }}
            />
            <div className={styles.diagram}>
                {
                    records.length == 0 ?
                    <div className={styles.empty}> No data... </div> :
                    <ResponsiveContainer width="99%" height="99%">
                        <LineChart
                            data={
                                records.sort((a, b) => a.entry - b.entry)
                                    .map((record, i) => ({
                                        value: device.valueType === "number" ? parseInt(record.value) : record.value,
                                        date: record.created,
                                        unit: device.unit,
                                        index: i,
                                    }))
                            }
                            margin={{ left: 10, right: 50 }}
                        >
                            <XAxis dataKey="index" padding={{ left: 20, right: 20 }} />
                            <YAxis
                                type={device.valueType === "number" ? "number" : "category"}
                                padding={{top: device.valueType === "number" ? 10 : 40, bottom: device.valueType === "number" ? 10 : 40}}
                            />
                            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                            <Line
                                type={device.valueType === "number" ? "monotone" : "stepAfter"}
                                dataKey="value"
                                stroke={device.valueType === "number" ? "#ADD8E6" : "#90ee90"}
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                }
            </div>
            <RecordActionForm
                deviceId={deviceId}
                valueType={device.valueType}
                filterRange={filterRange}
                addNewRecord={(newRecord) => {
                    
                    // If filter range is defined, check if new record is in range
                    if (filterRange != undefined) {
                        const createdDate = new Date(newRecord.created);
                        if (createdDate < filterRange.startDate || createdDate > filterRange.endDate) {
                            return;
                        }
                    }

                    // Update UI 
                    setRecords([...records, newRecord]);
                }}
            />
            <RecordList unit={device.unit} records={records} />
        </div>
    );
}

function Filter({
    resetRange,
    setRange,
}: {
    resetRange: VoidFunction,
    setRange: (startDate: Date, endDate: Date) => void,
}) {

    const [filtered, setFiltered] = useState<boolean>(false);
    const [start, setStart] = useState<string>('');
    const [end, setEnd] = useState<string>('');

    return (
        <div className={styles.filter}>
            <div
                className={filtered ? styles.button : styles.disabled}
                onClick={() => {
                    setFiltered(false);
                    setStart('');
                    setEnd('');
                    resetRange();
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <title>Reset</title>
                    <path xmlns="http://www.w3.org/2000/svg" d="M12.7929 2.29289C13.1834 1.90237 13.8166 1.90237 14.2071 2.29289L17.2071 5.29289C17.5976 5.68342 17.5976 6.31658 17.2071 6.70711L14.2071 9.70711C13.8166 10.0976 13.1834 10.0976 12.7929 9.70711C12.4024 9.31658 12.4024 8.68342 12.7929 8.29289L14.0858 7H12.5C8.95228 7 6 9.95228 6 13.5C6 17.0477 8.95228 20 12.5 20C16.0477 20 19 17.0477 19 13.5C19 12.9477 19.4477 12.5 20 12.5C20.5523 12.5 21 12.9477 21 13.5C21 18.1523 17.1523 22 12.5 22C7.84772 22 4 18.1523 4 13.5C4 8.84772 7.84772 5 12.5 5H14.0858L12.7929 3.70711C12.4024 3.31658 12.4024 2.68342 12.7929 2.29289Z" fill="var(--foreground-secondary)"></path>
                </svg>
            </div>
            <input
                type="date"
                value={start}
                onChange={(e) => {setStart(e.target.value)}}
            />
            ~
            <input
                type="date"
                value={end}
                onChange={(e) => {setEnd(e.target.value)}}
            />
            <div
                className={styles.button}
                onClick={() => {
                    if (!start || !end) {
                        alert('Please set the start and end date');
                        return;
                    }

                    const startDate = new Date(start);
                    const endDate = new Date(end);

                    if (startDate > endDate) {
                        alert('Start date should be less than end date');
                        return;
                    }

                    setRange(startDate, endDate);
                    setFiltered(true);
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <title>Filter</title>
                    <path xmlns="http://www.w3.org/2000/svg" d="M4 7C4 6.44772 4.44772 6 5 6H19C19.5523 6 20 6.44772 20 7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7ZM6 12C6 11.4477 6.44772 11 7 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H7C6.44772 13 6 12.5523 6 12ZM8 17C8 16.4477 8.44772 16 9 16H15C15.5523 16 16 16.4477 16 17C16 17.5523 15.5523 18 15 18H9C8.44772 18 8 17.5523 8 17Z" fill="var(--foreground-secondary)"></path>
                </svg>
            </div>
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
                No data...
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
                                <div className={styles.field}>{new Date(record.created).toLocaleString()}</div>
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

function RecordActionForm({
    deviceId,
    valueType,
    filterRange,
    addNewRecord,
}: {
    deviceId: string,
    valueType: string,
    filterRange: FilterRange | undefined,
    addNewRecord: (newRecord: DeviceRecord) => void,
}) {
    const pathname = usePathname();
    const [tmpVal, setTmpVal] = useState<string>('');
    const [show, showModal] = useState<boolean>(false);
    const [statistics, setStatistics] = useState<any[]>();

    return (
        <div className={styles.addForm}>
            <Modal
                show={show}
                close={() => {showModal(false)}}
                title="Statistics"
                hideDefaultCancel={true}
            >
                <div className={styles.statistics}>
                    {
                        !statistics ?
                        <Loader /> :
                        <>
                            <div className={styles.item}>
                                <div className={styles.field}>{valueType == "number" ? 'Label' : 'Value'}</div>
                                <div className={styles.field}>{valueType == "number" ? 'Value' : 'Count'}</div>
                            </div>
                            {
                                valueType == "number" ?
                                <>
                                    <div className={styles.item}>
                                        <div className={styles.field}>Max</div>
                                        <div className={styles.field}>{`${statistics[0].max}`}</div>
                                    </div>
                                    <div className={styles.item}>
                                        <div className={styles.field}>Min</div>
                                        <div className={styles.field}>{`${statistics[0].min}`}</div>
                                    </div>
                                    <div className={styles.item}>
                                        <div className={styles.field}>Avg</div>
                                        <div className={styles.field}>{`${statistics[0].avg}`}</div>
                                    </div>
                                </>
                                :
                                statistics.map((stat) => (
                                    <div className={styles.item} key={stat.value}>
                                        <div className={styles.field}>{stat.value}</div>
                                        <div className={styles.field}>{stat.cnt}</div>
                                    </div>
                                ))
                            }
                        </>
                    }
                </div>
            </Modal>
            <div
                className={styles.button}
                onClick={() => {
                    showModal(true);
                    setStatistics(undefined);

                    let url = `${pathname}/api?deviceId=${deviceId}&statistics=yes&type=${valueType}`;
                    if (!!filterRange) {
                        url += `&startDate=${filterRange.startDate.toISOString()}&endDate=${filterRange.endDate.toISOString()}`;
                    }

                    fetch(url, { cache: 'no-cache', method: 'GET' })
                        .then(response => response.json())
                        .then(body => {
                            const { stats } = body;
                            if (stats === undefined) {
                                console.error('Received garbage');
                                return;
                            }

                            console.log(stats);
                            setStatistics(stats);
                        })
                        .catch(error => {
                            console.error(error);
                        });
                    return;
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path xmlns="http://www.w3.org/2000/svg" d="M12 4C12.5523 4 13 4.44772 13 5V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V5C11 4.44772 11.4477 4 12 4ZM17 8C17.5523 8 18 8.44772 18 9V19C18 19.5523 17.5523 20 17 20C16.4477 20 16 19.5523 16 19V9C16 8.44772 16.4477 8 17 8ZM7 12C7.55228 12 8 12.4477 8 13V19C8 19.5523 7.55228 20 7 20C6.44772 20 6 19.5523 6 19V13C6 12.4477 6.44772 12 7 12Z" fill="var(--foreground-secondary)"></path>
                </svg>
            </div>
            <input
                value={tmpVal}
                onChange={(e) => {setTmpVal(e.target.value)}}
            />
            <div
                className={styles.button}
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
                    <title>Add Record</title>
                    <path xmlns="http://www.w3.org/2000/svg" d="M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z" fill="var(--foreground-secondary)"></path>
                </svg>
            </div>
        </div>
    );
}
