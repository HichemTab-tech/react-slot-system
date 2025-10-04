import React, {
    type ComponentProps,
    type Dispatch,
    type PropsWithChildren, type SetStateAction,
    useLayoutEffect,
    useState
} from "react";
import {createContext} from "react-ctx-selector";

export type SlotContextData = {
    slots: Record<string, React.ReactNode>,
    ready: boolean
};

/**
 * @internal
 */
export const context = createContext<[SlotContextData, Dispatch<SetStateAction<SlotContextData>>]>(undefined!);

// noinspection JSUnusedGlobalSymbols
export function hasSlots<Props extends {}>(WrappedComponent: React.FC<Props>) {

    const Provider = ({children}: PropsWithChildren) => {

        const s = useState<SlotContextData>({
            slots: {},
            ready: false,
        });

        useLayoutEffect(() => {
            s[1]((prev) => ({...prev, ready: true}));
        }, []);

        return (
            <context.Provider value={s}>
                {children}
            </context.Provider>
        )
    }

    return (props: ComponentProps<typeof WrappedComponent>) => {
        return (
            <Provider>
                <WrappedComponent {...props}/>
            </Provider>
        )
    }
}
