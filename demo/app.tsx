import * as React from 'react';
import {Slot, Template, hasSlots} from 'react-slot-system';
import type {PropsWithChildren} from "react";

const Fallback = () => {

    console.log("fallback");

    return (
        <div className="bg-blue-500">
            Fallback
        </div>
    )
}

const Component1 = hasSlots(({children}: PropsWithChildren) => {

    return (
        <div className="bg-orange-500 text-white">
            Component 1
            <div>
                <Slot name="header" fallback={<Fallback/>}/>
                {children}
                <Slot name="footer"/>
            </div>
        </div>
    )
});

const Children = ({hello}: {hello: string}) => {

    return (
        <div className="bg-red-400">{hello}</div>
    )
}

const App = () => {

    return (
        <div>
            <h1 className="text-red-600">React slot system Demo</h1>
            <div>
                <h1>Hello BOSS!</h1>
                <Component1>
                    <Template slot="header">
                        <Children hello={"hello1"}/>
                    </Template>
                    <div>
                        Hello brother
                    </div>
                    <Template slot="footer">
                        <Children hello={"hello2"}/>
                    </Template>
                </Component1>
            </div>
        </div>
    );
};

export default App;
