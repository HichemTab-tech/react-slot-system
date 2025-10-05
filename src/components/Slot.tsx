import React from "react";
import {useContextSelector} from "react-ctx-selector";
import {context} from "../hasSlots";

// noinspection JSUnusedGlobalSymbols
export const Slot = ({name, fallback}: {name: string;fallback?: React.ReactNode}) => {

    let slot, ready;
    try {
        slot = useContextSelector(context, (ctx) => {
            if (Object.keys(ctx[0].slots).includes(name)) {
                return ctx[0].slots[name]??null;
            }
            else{
                return undefined;
            }
        }, (a, b) => Object.is(a, b));
    } catch (e) {
        slot = undefined;
    }
    try {
        ready = useContextSelector(context, (ctx) => ctx[0].ready, (a, b) => Object.is(a, b));
    } catch (e) {
        ready = false;
    }

    return !ready ? null : (typeof slot !== 'undefined' ? slot : fallback)
}
