import { createDevice, getAllDevices } from "@/lib/db";

// Get all devices or one specific device
export async function GET(request: Request) {
    const data = await getAllDevices()

    // TODO:
    return Response.json({ data })
}

// Create a new device
export async function POST(request: Request) {
    const { name, valueType, unit } = await request.json();
    if (name === undefined || valueType === undefined || unit === undefined) {
        return new Response(undefined, { status: 400 });
    }

    const newDevice = await createDevice(name, valueType, unit);
    if (newDevice == null) {
        return new Response(undefined, { status: 400 });
    }

    return Response.json(newDevice.toJSON());
}

// Create a new record for a device
export async function PUT() {

    // TODO:
}