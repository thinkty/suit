
export type DeviceRecord = {
    did: string;
    entry: number;
    createdAt: Date;
    updatedAt: Date;
    value: string;
};

export type Device = {
    id: string;
    name: string;
    unit: string;
    valueType: string;
    records: DeviceRecord[];
};
