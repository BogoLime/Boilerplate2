import React from "react"
import styled from 'styled-components'

const SAnchor = styled.a`
font-weight:500
text-decoration: underline;
`

function TransactionLink (props:any){
    return <p> Check transaction on  
        <SAnchor href = {`https://ropsten.etherscan.io/tx/${props.hash}`}> Etherscan </SAnchor>
    </p>
}

export default TransactionLink