import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    const { notes, selectedDoctor } = await req.json();

    try {
        const sessionId = uuidv4();
        const user = await currentUser();  // Await the currentUser() call

        const result = await db.insert(SessionChatTable).values({
            sessionId: sessionId,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            notes: notes,
            selectedDoctor: selectedDoctor,
            createdOn: (new Date()).toString()
        }).returning();

        return NextResponse.json(result[0]);  // Return the inserted session data
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Something went wrong" });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const user = await currentUser();  // Await the currentUser() call

    if (sessionId === 'all') {
        // Query all sessions for the logged-in user
        const result = await db.select().from(SessionChatTable)
        //@ts-ignore
            .where(eq(SessionChatTable.createdBy, user?.primaryEmailAddress?.emailAddress))
            .orderBy(desc(SessionChatTable.id));

        return NextResponse.json(result);  // Return all sessions
    } else {
        // Query a specific session by sessionId
        const result = await db.select().from(SessionChatTable)
        //@ts-ignore
            .where(eq(SessionChatTable.sessionId, sessionId));

        if (result.length > 0) {
            return NextResponse.json(result[0]);  // Return the session data
        } else {
            return NextResponse.json({ error: "Session not found" });  // Handle no data found
        }
    }
}
