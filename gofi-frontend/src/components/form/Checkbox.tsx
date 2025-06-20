import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox"
import React from 'react'

interface IProps {
    name?: string
    onChange?: (checked: boolean) => void
    checked?: boolean
}

const Checkbox: React.FC<IProps> = (props) => {
    const { name, onChange, checked = false } = props

    return (
        <ShadcnCheckbox
            name={name}
            checked={checked}
            onCheckedChange={onChange}
        />
    )
}

export default Checkbox
