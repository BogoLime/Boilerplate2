import * as React from 'react'
import styled from 'styled-components'
import Button from "./Button"

interface IFormStyleProps {
    width: number
    height:number
}

const SFormDiv = styled.div<IFormStyleProps>`
display:grid;
grid-template-columns:1fr 1fr;
grid-template-rows:1fr 1fr;
align-content:center;
justify-content:center;
width:${({width}) => width}rem
height:${({height}) => height}rem
` 

interface IInputProps{
    type?: "number" | "text"
}

const SInput = styled.input<IInputProps>`
width: 10rem;
height: 2rem;
padding:0.2rem
border: 1px solid black
border-radius: 10px
text-align:center
margin-bottom:1rem
`


function  SubmitForm(props:any){
    const [usState, setUsState] = React.useState("")
    const [biden, setBiden] = React.useState(0)
    const [trump, setTrump] = React.useState(0)
    const [seats, setSeats] = React.useState(0)

    const handlerFactory = (setFunc:any) =>{
        async function handler (e: React.ChangeEvent<HTMLInputElement>){
            await setFunc(e.target.value)
        }
        return handler
    }

    async function submit () {
        await props.onClick(usState,biden,trump,seats)
    } 

            
    return  <React.Fragment>
        <SFormDiv width={25} height={13}>

            <label>State</label>
            <SInput value = {usState} onChange= {handlerFactory(setUsState)} type={"text"}/>

            <label>Biden Votes</label>
            <SInput value = {biden} onChange= {handlerFactory(setBiden)} type={"number"}/>

            <label>Trump Votes</label>
            <SInput value = {trump} onChange= {handlerFactory(setTrump)} type={"number"}/>
        
            <label>Seats</label>
            <SInput value = {seats} onChange= {handlerFactory(setSeats)} type={"number"}/>
            
        </SFormDiv>
        <Button onClick={submit} > Submit Vote </Button>
    </React.Fragment>
}

export default SubmitForm