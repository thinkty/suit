import { createRecord, getDeviceAndAllRecords } from "@/lib/db";
import { NextRequest } from "next/server";

// Get one device and all its record
export async function GET(req: NextRequest) {

    const deviceId = req.nextUrl.searchParams.get('deviceId');
    if (!deviceId || isNaN(parseInt(deviceId))) {
        return new Response(undefined, { status: 400 });
    }

    const did = parseInt(deviceId);
    const device = await getDeviceAndAllRecords(did);
    if (device == null) {
        return new Response(undefined, { status: 500 });
    }
    return Response.json({data: device.toJSON()});
}

// Create a new record for a device
export async function POST(request: Request) {
    const { deviceId, value } = await request.json();
    if (deviceId === undefined || value === undefined) {
        return new Response(undefined, { status: 400 });
    }

    const newRecord = await createRecord(deviceId, value);
    if (newRecord == null) {
        return new Response(undefined, { status: 500 });
    }

    return Response.json(newRecord.toJSON());
}
