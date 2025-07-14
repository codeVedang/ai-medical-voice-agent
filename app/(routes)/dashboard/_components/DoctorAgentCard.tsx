"use client"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AIDoctorAgents } from '@/shared/list'
import { useAuth } from '@clerk/nextjs'
import { IconArrowRight } from '@tabler/icons-react'
import axios from 'axios'
import { Loader2Icon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export type doctorAgent = {
    id: number,
    specialist: string,
    description: string,
    image: string,
    agentPrompt: string,
    voiceId?: string,
    subscriptionRequired: boolean

}

type props = {
    doctorAgent: doctorAgent
}

function DoctorAgentCard({ doctorAgent }: props) {

    const [loading, setloading] = useState(false)
    const router=useRouter()

    const { has } = useAuth()
    //@ts-ignore
    const paidUser = has&&has({ plan: 'pro' })

    const OnStartConsultation = async () => {
            setloading(true)
            //Save into Database
            const result = await axios.post('api/session-chat', {
                notes: "New Query",
                selectedDoctor: doctorAgent
            });
            console.log(result.data)
    
            if (result.data?.sessionId) {
                console.log(result.data.sessionId);
                //Route a conversation Screen
                router.push('/dashboard/medical-agent/' + result.data.sessionId)
            }
    
            setloading(false)
        }

    return (
        <div className='relative'>
            {doctorAgent.subscriptionRequired && <Badge className='absolute m-2 right-0'>Premium</Badge>}
            <Image src={doctorAgent.image}
                alt={doctorAgent.specialist} width={200} height={300}
                className='w-full h-[230px] object-cover rounded-xl hover:scale-105 transition-all' />
            <h2 className='font-bold mt-1'>{doctorAgent.specialist}</h2>
            <p className='line-clamp-2 text-sm text-gray-500'>{doctorAgent.description}</p>
            <Button className='w-full mt-2 hover:scale-105 transition-all'  disabled={!paidUser && doctorAgent.subscriptionRequired} onClick={OnStartConsultation}>Start Consultation {loading?<Loader2Icon className='animate-spin'/>: <IconArrowRight />}</Button>
        </div>
    )
}

export default DoctorAgentCard
