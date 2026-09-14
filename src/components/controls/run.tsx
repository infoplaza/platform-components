import { useEffect } from "react"
import DropdownControl, { DropdownItem } from "@/src/components/forms/dropdown"
import { useWeatherMap } from "@/src/providers/weather/weather"
import { useMemo } from "react"
import { formatRun } from "@/src/utilities/date"
import type { SupportedLocale } from "@/src/utilities/date"

interface MapControlRunProps {
    small?: boolean
}

export default function MapControlRun({ small = false }: MapControlRunProps) {
    const { modelInfo, layersInfo, setModelRun } = useWeatherMap()

    const modelItems: DropdownItem[] = useMemo(() => { 
        return (modelInfo?.runtimes ?? []).map((run: string) => {
            return { 
                value: run,
                title: formatRun(parseInt(run), 'en' as SupportedLocale) ?? undefined,
                active: run === layersInfo?.run
            }
        }) 
    }, [ modelInfo?.runtimes, layersInfo?.run ])    

    const onChange = (val: string | number) => {
        setModelRun(val as string)
    }

    if (modelItems.length === 0) {
        return null
    }
    
    return (
        <div>
            <div className="ip:pointer-events-auto">
                <div className="ip:flex ip:gap-4 ip:items-center">
                    <DropdownControl items={modelItems}                                        
                        maxItems={0}
                        small={small}
                        onChange={(val) => onChange(val)}                                        
                        className="ip:bg-white/80 ip:dark:bg-dark/80 ip:backdrop-blur-md ip:border ip:border-white/10" />
                </div>
            </div>
        </div>
    )
}
