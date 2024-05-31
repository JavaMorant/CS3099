import {React, useEffect} from 'react';
import {SearchControl, ControlsContainer} from '@react-sigma/core';

/**
 * 
 * @returns Loading screen (with gif, or 'loading...' if gif fails)
 */
const SearchBar = ({year, changeYear}) => {
    return (
        <>
            <ControlsContainer position={"top-left"}>
                <SearchControl style={{ width: "200px" }}/>
            </ControlsContainer>
        </>
    )
}

export default SearchBar;