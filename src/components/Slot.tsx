import React from "react";
import {useContextSelector} from "react-ctx-selector";
import {context} from "../hasSlots";

// noinspection JSUnusedGlobalSymbols
export const Slot = ({name, fallback}: {name: string;fallback?: React.ReactNode}) => {

    const slot = useContextSelector(context, (ctx) => ctx[0].slots[name], (a,b) => Object.is(a,b));
    const ready = useContextSelector(context, (ctx) => ctx[0].ready, (a,b) => Object.is(a,b));

    return !ready ? null : (slot ?? fallback)
}
