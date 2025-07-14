import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import moment from 'moment'

type ReportProps = {
    record: any;  // Replace with the type you're using for your record
}

function ViewReportDialog({ record }: ReportProps) {
    // Generate a simple summary of the conversation
    const conversationSummary = record.conversation
        ? `${record.conversation[0]?.text}...` // Get the first assistant message as the summary
        : "No conversation available.";

    return (
        <div>
            <Dialog>
                <DialogTrigger>
                    <Button variant='link'>View Report</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle asChild>
                            <h2 className='text-center text-4xl'>Medical AI Voice Agent Report</h2>
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className='mt-10'>
                                {/* General Info */}
                                <div className='grid grid-cols-2'>
                                    <h2><span className='font-bold'>Doctor Specialization:</span> {record.selectedDoctor?.specialist || "Not available"}</h2>
                                    <h2>Consult Date: {moment(new Date(record?.createdOn)).fromNow()}</h2>
                                </div>

                                {/* Duration & Severity */}
                                <div className='mt-4'>
                                    <h3 className='font-semibold text-lg'>Duration & Severity</h3>
                                    <p><strong>Duration:</strong> {record?.duration || "Not specified"}</p>
                                    <p><strong>Severity:</strong> {record?.severity || "Moderate"}</p>
                                </div>

                                {/* Medications Mentioned */}
                                <div className='mt-4'>
                                    <h3 className='font-semibold text-lg'>Medications Mentioned</h3>
                                    {record?.medicationsMentioned?.length > 0 ? (
                                        <ul>
                                            {record.medicationsMentioned.map((medication: string, index: number) => (
                                                <li key={index}>• {medication}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No medications mentioned</p>
                                    )}
                                </div>

                                {/* Recommendations */}
                                <div className='mt-4'>
                                    <h3 className='font-semibold text-lg'>Recommendations</h3>
                                    <ul>
                                        {record?.recommendations?.map((recommendation: string, index: number) => (
                                            <li key={index}>• {recommendation}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Conversation Summary */}
                                <div className='mt-4'>
                                    <h3 className='font-semibold text-lg'>Conversation Summary</h3>
                                    <div className='bg-gray-100 p-4 rounded-md'>
                                        <p className='text-sm'>{conversationSummary}</p>
                                    </div>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ViewReportDialog
