"use client"
import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DialogClose } from '@radix-ui/react-dialog'
import { ArrowRight, Loader2 } from 'lucide-react'
import axios from 'axios'
import DoctorAgentCard, { doctorAgent } from './DoctorAgentCard'
import SuggestedDoctorCard from './SuggestedDoctorCard'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { SessionDetail } from '../medical-agent/[sessionId]/page'


function AddSessionDialog() {

    const [note, setnote] = useState<string>()
    const [loading, setloading] = useState(false)
    const [suggestDoctor, setsuggestDoctor] = useState<doctorAgent[]>()
    const [selectedDoctor, setselectedDoctor] = useState<doctorAgent>()
    const [historyList, sethistoryList] = useState<SessionDetail[]>([]);
    const router = useRouter()

    const { has } = useAuth()
    //@ts-ignore
    const paidUser = has && has({ plan: 'pro' })

     useEffect(() => {
          
        GetHistoryList();
          
        },[])
        
    
        const GetHistoryList=async()=>{
          const result = await axios.get('/api/session-chat?sessionId=all')
          console.log(result.data)
          sethistoryList(result.data)
        }

    const OnClickNext = async () => {
        setloading(true)
        const result = await axios.post('api/suggest-doctors', {
            notes: note
        })

        console.log(result.data)
        setsuggestDoctor(result.data)
        setloading(false)
    }

    const OnStartConsultation = async () => {
        setloading(true)
        //Save into Database
        const result = await axios.post('api/session-chat', {
            notes: note,
            selectedDoctor: selectedDoctor
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
        <Dialog>
            <DialogTrigger>
                <Button className='mt-3' disabled={!paidUser && historyList?.length>=1}>+ Start a Consultation</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Doctor Here</DialogTitle>
                    <DialogDescription asChild>
                        {!suggestDoctor ?
                            <div>
                                <h2>Add Symptons or Any Other Details</h2>
                                <Textarea placeholder='Add Detail here....' className='h-[200px] mt-1'
                                    onChange={(e) => setnote(e.target.value)} />
                            </div> :
                            <div className='grid grid-cols-2 gap-5'>
                                {/* //suggestDoctor */}
                                {suggestDoctor.map((doctor, index) => (
                                    <SuggestedDoctorCard doctorAgent={doctor} key={index} setSelectedDoctor={() => setselectedDoctor(doctor)}
                                        //@ts-ignore
                                        selectedDoctor={selectedDoctor} />
                                ))}
                            </div>}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose><Button variant={'outline'}>Cancel</Button></DialogClose>
                    {!suggestDoctor ? <Button disabled={!note || loading} onClick={(e) => OnClickNext()}>Next {loading ? <Loader2 className='animate-spin' /> : <ArrowRight />}</Button> :
                        <Button disabled={!note || loading} onClick={() => OnStartConsultation()}>Start Consultation {loading ? <Loader2 className='animate-spin' /> : <ArrowRight />}</Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddSessionDialog
