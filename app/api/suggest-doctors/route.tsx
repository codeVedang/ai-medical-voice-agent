import { db } from "@/config/db";
import { openai } from "@/config/OpenAiModel";
import { SessionChatTable } from "@/config/schema";
import { AIDoctorAgents } from "@/shared/list";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { notes } = await req.json()
    try {
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.5-flash",
            messages: [
                { role: 'system', content: JSON.stringify(AIDoctorAgents) },
                { role: 'user', content: "User Notes/Symptoms: " + notes + ". Based on these, suggest a list of doctors. Return JSON only." }
            ],
            max_tokens: 1024  // ✅ Limit output to safe number
        });


        const rawResp = completion.choices[0].message
        //@ts-ignore
        const Resp = rawResp.content.trim().replace('```json','').replace('```','')
        const JSONresp=JSON.parse(Resp)
        return NextResponse.json(JSONresp)
    }
    catch (e) {
        return NextResponse.json(e)
    }
}

