import { createRecord, getDeviceAndFilteredRecords, getDeviceStatistics, getDeviceAndAllRecords } from "@/lib/db";
import { NextRequest } from "next/server";

// Get one device and all its record
export async function GET(req: NextRequest) {

    const deviceId = req.nextUrl.searchParams.get('deviceId');
    if (!deviceId || isNaN(parseInt(deviceId))) {
        return new Response(undefined, { status: 400 });
    }
    const did = parseInt(deviceId);

    // Check if it has requested statistics
    if (req.nextUrl.searchParams.get('statistics') != null) {
        
        const type = req.nextUrl.searchParams.get('type');
        if (type == null) {
            return new Response(undefined, { status: 400 });
        }

        const start = req.nextUrl.searchParams.get('startDate');
        const end = req.nextUrl.searchParams.get('endDate');
        const startDate = start == null ? undefined : new Date(start);
        const endDate = end == null ? undefined : new Date(end);

        const stats = await getDeviceStatistics(did, type, startDate, endDate);
        if (stats == null) {
            return new Response(undefined, { status: 500 });
        }
        console.log(stats);
        return Response.json({ stats });
    }

    // Check if range is specified
    const start = req.nextUrl.searchParams.get('startDate');
    const end = req.nextUrl.searchParams.get('endDate');
    if (start != null && end != null) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        console.log(startDate.toISOString(), endDate.toISOString());
        const filteredRecords = await getDeviceAndFilteredRecords(did, startDate, endDate);
        if (filteredRecords == null) {
            return new Response(undefined, { status: 500 });
        }
        return Response.json({records: filteredRecords.map(record => record.toJSON())});
    }

    const device = await getDeviceAndAllRecords(did);
    if (device == null) {
        return new Response(undefined, { status: 500 });
    }
    return Response.json({device: device.toJSON()});
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
