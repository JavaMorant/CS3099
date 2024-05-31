import React from 'react';
import { useLocation } from 'react-router-dom';
import GraphMain from "../../components/group31/GraphMain";

function Group31() {
    const location = useLocation();
    const clubData = location.state?.clubData;

    return (
        <div className='w-full h-full'>
            {}
            <GraphMain clubData={clubData}/>
        </div>
    )
}

export default Group31;
