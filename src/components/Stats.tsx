import * as React from 'react'
import styled from 'styled-components'


const SStatContainer = styled.div `
display:flex;
flex-direction:row;
align-items:center;
margin-top:2rem
`

const SStat = styled.div`
display:flex;
flex-direction:column;
align-items:center;
justify-items:flex-start;
height:100%
`
interface IParagraph {
    size:number;
    bolded?:boolean;
}

const SParagraph = styled.p <IParagraph>`
font-size: ${({size}) => size}rem
margin-left:3rem;
font-weight: ${props => props.bolded ? 700 : 200 }
`

function StatSection(props:any){

    return <SStatContainer>
        <SStat> 
            <SParagraph size={1.3} bolded>Current Leader</SParagraph> 
            <SParagraph size={1.1}>{props.stats.leader === 1 ? "Biden" : "Trump"} </SParagraph>
        </SStat>
        <SStat> 
            <SParagraph size={1.3} bolded>Biden Seats</SParagraph> 
            <SParagraph size={1.1}>{props.stats.biden} </SParagraph>
         
        </SStat>
        <SStat> 
            <SParagraph size={1.3} bolded>Trump Seats</SParagraph> 
            <SParagraph size={1.1}>{props.stats.trump} </SParagraph>
           
        </SStat>
        <SStat>
            <SParagraph size={1.3}bolded>Vote Status</SParagraph> 
            <SParagraph size={1.1}>{props.stats.isEnded ? "Ended" : "Active"} </SParagraph>
    
        </SStat>
    </SStatContainer>
}

export default StatSection