import { useMemo } from "react"
import DropdownControl, { DropdownItem } from "@/src/components/forms/dropdown"
import { useWeatherMap } from "@/src/providers/weather/weather"

interface MapControlLevelProps {
    levels?: string[] | null
    maxItems?: number
}

export default function MapControlLevel({ 
    levels = null, 
    maxItems = 3 
}: MapControlLevelProps) {
    const weatherContext = useWeatherMap()

    const modelItems: DropdownItem[] = useMemo(() => {
        return (levels ?? []).map((level: string) => {
            return { 
                value: level,
                title: level,
                active: level === weatherContext.layersInfo?.level
            }
        }) 
    }, [levels, weatherContext.layersInfo?.level])

    const onChange = (val: string | number): void => {
        weatherContext.setModelLevel(val as string)
    }

    if (modelItems.length <= 1) {
        return null
    }
    
    return (
        <div>
            <div className="ip:pointer-events-auto">
                <div className="ip:flex ip:items-center ip:pt-0.5 ip:pl-3">
                    <div className="ip:bg-white/50 ip:dark:bg-dark/50 ip:backdrop-blur-md ip:pl-2 ip:pr-4 ip:py-1 ip:rounded-l-md ip:text-xs ip:font-medium ip:-mr-2">
                        Level
                    </div>
                    <div>
                        <DropdownControl 
                            items={modelItems}                                        
                            minItems={1}
                            maxItems={maxItems}
                            onChange={(val) => onChange(val)}                                        
                            className="ip:bg-white/80 ip:dark:bg-dark/80 ip:backdrop-blur-md ip:!text-xs ip:!h-6 ip:!rounded-md" 
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
