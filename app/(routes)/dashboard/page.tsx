import React, { useState } from 'react'
import HistoryList from './_components/HistoryList'
import DoctorAgentList from './_components/DoctorAgentList'
import AddSessionDialog from './_components/AddSessionDialog'

function Dashboard() {
 
    return (
        <div>
            <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl'>Dashboard</h2>
                <AddSessionDialog/>
            </div>
            <HistoryList />

            <DoctorAgentList/>
        </div>
    )
}

export default Dashboard
