import { checkDevice, createDevice, updateDevice, deleteDeviceAndRecords, getAllDevicesAndMostRecentRecord } from "@/lib/db";

// Get all devices and their most recent record, or one device and all its record
export async function GET() {

    const data = await getAllDevicesAndMostRecentRecord();
    if (data == null) {
        return new Response(undefined, { status: 500 });
    }

    return Response.json({data: data.map(device => device.toJSON())});
}

// Create a new device
export async function POST(request: Request) {
    const { name, valueType, unit } = await request.json();
    if (name === undefined || valueType === undefined || unit === undefined) {
        return new Response(undefined, { status: 400 });
    }

    const newDevice = await createDevice(name, valueType, unit);
    if (newDevice == null) {
        return new Response(undefined, { status: 500 });
    }

    return Response.json(newDevice.toJSON());
}

// Update device details
export async function PUT(request: Request) {
    const { id, name, valueType, unit } = await request.json();
    if (id === undefined || name === undefined || valueType === undefined || unit === undefined) {
        return new Response(undefined, { status: 400 });
    }

    // Check that the device exists
    const did = parseInt(id);
    if (await checkDevice(did) == null) {
        return new Response(undefined, { status: 400 });
    }

    // Update device
    const updatedDevice = await updateDevice(did, name, valueType, unit);
    if (updatedDevice == null) {
        return new Response(undefined, { status: 500 });
    }

    return Response.json(updatedDevice.toJSON());
}

// Remove a device
export async function DELETE(request: Request) {
    const { deviceId } = await request.json();
    if (deviceId === undefined || isNaN(parseInt(deviceId))) {
        return new Response(undefined, { status: 400 });
    }
    const did = parseInt(deviceId);

    // Check that it exists
    if (await checkDevice(did) == null) {
        return new Response(undefined, { status: 400 });
    }

    // Remove device
    console.log(`Removing device : ${deviceId}`);
    const ret = await deleteDeviceAndRecords(did);
    if (ret == null) {
        return new Response(undefined, { status: 500 });
    }

    return Response.json(null);
}
