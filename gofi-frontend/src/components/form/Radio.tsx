import { RadioGroupItem } from "@/components/ui/radio-group"
import React from 'react'

interface IProps {
    value: string
}

const Radio: React.FC<IProps> = (props) => {
    const { value } = props

    return (
        <RadioGroupItem value={value} />
    )
}

export default Radio
