import { twMerge } from '@/src/utilities/external/twMerge'

interface FormControlRadioProps {
    options: {
        i18n?: string
        text?: string
        value: string | number | boolean | null
        disabled?: boolean
        title?: string
    }[]
    value: string | number | boolean | null
    onChange: (value: string | number | boolean | null) => void
    className?: string
    disabled?: boolean
}

function FormControlRadio({ options, value, onChange, className, disabled = false }: FormControlRadioProps) {

    const setValue = (val: string | number | boolean | null) => {
        if (!disabled && onChange) onChange(val)
    }

    return (
        <div className="ip:bg-white ip:dark:bg-white/10 ip:rounded-md ip:p-1">
            <div className="ip:flex ip:gap-1 ip:justify-evenly">
                {options.map((option) => {
                    const isDisabled = disabled || option.disabled

                    return (
                        <div
                            key={String(option.value)}
                            title={option.title}
                            className={twMerge(
                                `ip:px-2 ip:py-1 ip:flex-1 ip:rounded ip:text-xs ip:cursor-pointer ip:font-light ip:sm:font-normal ip:whitespace-nowrap ip:text-center`,
                                className,
                                isDisabled ? 'ip:opacity-50 ip:cursor-not-allowed ip:hover:bg-transparent' : 'ip:cursor-pointer',
                                option.value == value ? 'ip:bg-primary ip:text-white' : !isDisabled && 'ip:hover:bg-primary/10',
                            )}
                            aria-disabled={isDisabled}
                            onClick={() => !isDisabled && setValue(option.value)}
                        >
                            {option.text}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default FormControlRadio