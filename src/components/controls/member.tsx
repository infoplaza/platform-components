import { useMemo } from "react"
import DropdownControl, { DropdownItem } from "@/src/components/forms/dropdown"
import { useWeatherMap } from "@/src/providers/weather/weather"

interface MapControlMemberProps {
    small?: boolean
}

export default function MapControlMember({ small = false }: MapControlMemberProps) {
    const { modelInfo, layersInfo, setModelMember } = useWeatherMap()

    const items: DropdownItem[] = useMemo(() => {
        return (modelInfo?.members ?? []).map((member: string) => {
            return { 
                value: member,
                title: member,
                active: member == layersInfo?.member
            }
        }) 
    }, [ modelInfo, layersInfo?.member ])

    const onChange = (val: string | number) => {
        setModelMember(val as string)
    }

    if (items.length == 0) {
        return null
    }
    
    return (
        <div>
            <div className="ip:rounded-lg ip:shadow-sm ip:pointer-events-auto">
                <div className="ip:flex ip:gap-4 ip:items-center">
                    <div>
                        <DropdownControl items={items}                                        
                            maxItems={0}
                            small={small}
                            onChange={(val) => onChange(val)}                                        
                            className="ip:bg-white/80 ip:dark:bg-dark/80 ip:backdrop-blur-md ip:border ip:border-white/10" />
                    </div>
                </div>
            </div>
        </div>
    )
}
