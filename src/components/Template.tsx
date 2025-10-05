import {type PropsWithChildren, useLayoutEffect} from "react";
import {useContextSelector} from "react-ctx-selector";
import {context} from "../hasSlots";

// noinspection JSUnusedGlobalSymbols
export const Template = (props: PropsWithChildren<{slot: string;}>) => {
    let setter;
    try {
        setter = useContextSelector(context, (ctx) => ctx[1], (a, b) => Object.is(a, b))
    } catch (e) {
        setter = () => {
        };
    }

    useLayoutEffect(() => {
        setter((prev => ({...prev,slots: {...prev.slots, [props.slot]: props.children}})));
    }, [props.children]);

    return null
}
