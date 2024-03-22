
export type DeviceRecord = {
    did: string;
    entry: number;
    created: string;
    value: string;
};

export type Device = {
    id: string;
    name: string;
    unit: string;
    valueType: string;
    records: DeviceRecord[];
};
