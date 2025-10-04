import {type PropsWithChildren, useLayoutEffect} from "react";
import {useContextSelector} from "react-ctx-selector";
import {context} from "../hasSlots";

// noinspection JSUnusedGlobalSymbols
export const Template = ({slot, children}: PropsWithChildren<{slot: string;}>) => {
    const setter = useContextSelector(context, (ctx) => ctx[1], (a,b) => Object.is(a,b))

    useLayoutEffect(() => {
        setter((prev => ({...prev,slots: {...prev.slots, [slot]: children}})));
    }, []);

    return null
}
