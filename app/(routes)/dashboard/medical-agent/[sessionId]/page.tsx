"use client"
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { doctorAgent } from '../../_components/DoctorAgentCard';
import { Circle, PhoneCall, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Vapi from '@vapi-ai/web';
import { toast } from 'sonner';

export type SessionDetail = {
  id: number,
  notes: string,
  sessionId: string,
  report: JSON,
  selectedDoctor: doctorAgent,
  createdOn: string
}

type message = {
  role: string,
  text: string,

}

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetail, setsessionDetail] = useState<SessionDetail>()
  const [callStarted, setcallStarted] = useState(false)
  const [vapiInstance, setvapiInstance] = useState<any>()
  const [currentRole, setcurrentRole] = useState<string | null>()
  const [liveTranscript, setliveTranscript] = useState<string>()
  const [message, setmessage] = useState<message[]>([])
  const router = useRouter();


  useEffect(() => {
    sessionId && GetSessionDetails()
  }, [sessionId])


  const GetSessionDetails = async () => {
    const result = await axios.get('/api/session-chat?sessionId=' + sessionId)
    console.log(result.data)
    setsessionDetail(result.data)
  }

  //vapi components functions
  const handleStart = () => {
    
    console.log('Call started');
    setcallStarted(true);
  };
  //vapi components functions
  const handleEnd = () => {
    console.log('Call ended');
    setcallStarted(false);
  };
  //vapi components functions
  const handleMessage = (message: any) => {
    if (message.type === 'transcript') {
      const { role, transcriptType, transcript } = message
      console.log(`${message.role}: ${message.transcript}`);
      if (transcriptType == 'partial') {
        setliveTranscript(transcript)
        setcurrentRole(role)
      }
      else if (transcriptType == 'final') {
        //Final Transcript
        setmessage((prev: any) => [...prev, { role: role, text: transcript }])
        setliveTranscript("")
        setcurrentRole(null)
      }
    }
  };


  const startCall = () => {
    if (vapiInstance) {
      console.warn("Vapi instance already exists. Skipping reinitialization.");
      return;
    }

    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    setvapiInstance(vapi);

    // VAPI internal error handler
    vapi.on('error', (err) => {
      console.error("Call error:", err);
      alert("Call failed. Please refresh or try again.");
    });

    console.log({
      prompt: sessionDetail?.selectedDoctor?.agentPrompt,
      voiceId: sessionDetail?.selectedDoctor?.voiceId,

    });

    const VapiAgentConfig = {
      name: 'AI Medical Doctor Voice Agent',
      firstMessage: "Hi there! I'm your AI Medical Assistant. How can I help?",
      transcriber: {
        provider: 'assembly-ai',
        language: 'en',
      },
      model: {
        provider: 'openai',
        model: 'gpt-4o',
         temperature: 0.7 ,
        messages: [
          {
            role: 'system',
            content: sessionDetail?.selectedDoctor?.agentPrompt 

          }
        ]
      },
      voice: {
        provider: 'playht',
        voiceId: sessionDetail?.selectedDoctor?.voiceId,
      },
    };
    
    console.log("📣 Starting call with voice:", sessionDetail?.selectedDoctor?.voiceId);

    //@ts-ignore
    vapi.start(VapiAgentConfig);

    vapi.on('call-start', handleStart);
    vapi.on('call-end', handleEnd);
    vapi.on('message', handleMessage);

    vapiInstance?.on('speech-start', () => {
      console.log('Assistant started speaking');
      setcurrentRole('Assistance');
    });
    vapiInstance?.on('speech-end', () => {
      console.log('Assistant stopped speaking');
      setcurrentRole('User');
    });
  };


  const endCall =async() => {
   const result=await GenerateReport(); 
    if (!vapiInstance) return;
    vapiInstance.stop();
    // Use the same functions to safely remove listeners
    vapiInstance.off('call-start', handleStart);
    vapiInstance.off('call-end', handleEnd);
    vapiInstance.off('message', handleMessage);
    // vapiInstance.off('speech-start');
    // vapiInstance.off('speech-end');
    setcallStarted(false);
    setvapiInstance(null);
    toast.success('Your Report Is Generated!')
    router.replace('/dashboard');

  };

  const GenerateReport=async()=>{
    const result = await axios.post('/api/medical-report',{
      message:message,
      sessionDetail:sessionDetail,
      sessionId:sessionId
    })

    console.log(result.data);
    return result.data
  }


  return (
    <div className='p-3 border rounded-3xl bg-secondary '>
      <div className='flex justify-between items-center'>
        <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'><Circle className={`h-4 w-4 rounded-full ${!callStarted ? 'bg-red-500' : 'bg-green-500'}`} /> {!callStarted ? 'Not Connected' : 'Connected...'}</h2>
        <h2 className='font-bold text-xl text-gray-400'>00:00</h2>
      </div>

      {sessionDetail && <div className='flex flex-col items-center mt-10'>
        <Image src={sessionDetail?.selectedDoctor?.image} alt={sessionDetail?.selectedDoctor?.specialist ?? ''}
          width={80}
          height={80}
          className='h-[100px] w-[100px] object-cover rounded-full'
        />
        <h2 className='mt-2 text-lg'>{sessionDetail?.selectedDoctor?.specialist}</h2>
        <p className='text-sm text-gray-500'>{sessionDetail?.selectedDoctor?.description}</p>

        <div className='mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72'>
          {message?.slice(-4).map((msg: message, index) => (
            <h2 className=' text-gray-500 p-2' key={index}>{msg.role}: {msg.text}</h2>
          ))}
          {liveTranscript && liveTranscript?.length > 0 && <h2 className='text-lg'>{currentRole} : {liveTranscript}</h2>}
        </div>

        {!callStarted ? <Button className='mt-20' onClick={startCall}><PhoneCall /> Start Call</Button> :
          <Button variant={'destructive'} onClick={endCall}><PhoneOff /> Disconnected</Button>}

      </div>}
    </div>
  )
}

export default MedicalVoiceAgent

