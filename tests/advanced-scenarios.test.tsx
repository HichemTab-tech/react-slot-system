import {describe, it, expect, vi} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import React, {type PropsWithChildren, useState} from 'react';
import {hasSlots, Slot, Template} from '../src';

describe('React Slot System - Advanced Scenarios', () => {

    describe('Dynamic content updates', () => {
        it('should update slot content when template changes', () => {
            const DynamicComponent = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="dynamic"/>
                    {children}
                </div>
            ));

            const TestWrapper = () => {
                const [content, setContent] = useState('Initial');

                return (
                    <div>
                        <button onClick={() => setContent('Updated')}>Change</button>
                        <DynamicComponent>
                            <Template slot="dynamic">
                                <span>{content}</span>
                            </Template>
                        </DynamicComponent>
                    </div>
                );
            };

            render(<TestWrapper/>);

            expect(screen.getByText('Initial')).not.toBeNull();

            act(() => {
                screen.getByText('Change').click();
            });

            expect(screen.getByText('Updated')).not.toBeNull();
            expect(screen.queryByText('Initial')).toBeNull();
        });

        it('should handle dynamic slot names', () => {
            const Component = hasSlots(({slotName, children}: PropsWithChildren<{
                slotName: string
            }>) => (
                <div>
                    <Slot name={slotName} fallback={<span>No match</span>}/>
                    {children}
                </div>
            ));

            const {rerender} = render(
                <Component slotName="first">
                    <Template slot="first">
                        <span>First content</span>
                    </Template>
                    <Template slot="second">
                        <span>Second content</span>
                    </Template>
                </Component>
            );

            expect(screen.getByText('First content')).not.toBeNull();
            expect(screen.queryByText('Second content')).toBeNull();

            rerender(
                <Component slotName="second">
                    <Template slot="first">
                        <span>First content</span>
                    </Template>
                    <Template slot="second">
                        <span>Second content</span>
                    </Template>
                </Component>
            );

            expect(screen.queryByText('First content')).toBeNull();
            expect(screen.getByText('Second content')).not.toBeNull();

            rerender(
                <Component slotName="nonexistent">
                    <Template slot="first">
                        <span>First content</span>
                    </Template>
                    <Template slot="second">
                        <span>Second content</span>
                    </Template>
                </Component>
            );

            expect(screen.getByText('No match')).not.toBeNull();
        });
    });

    describe('Performance and lifecycle', () => {
        it('should not cause unnecessary re-renders', () => {
            const renderSpy = vi.fn();

            const Component = hasSlots(({children}: PropsWithChildren) => {
                renderSpy();
                return (
                    <div>
                        <Slot name="content"/>
                        {children}
                    </div>
                );
            });

            const {rerender} = render(
                <Component>
                    <Template slot="content">
                        <span>Content</span>
                    </Template>
                </Component>
            );

            expect(renderSpy).toHaveBeenCalledTimes(1);

            // Re-render with same content
            rerender(
                <Component>
                    <Template slot="content">
                        <span>Content</span>
                    </Template>
                </Component>
            );

            // Should render again due to new component instances, but that's expected
            expect(renderSpy).toHaveBeenCalledTimes(2);
            expect(screen.getByText('Content')).not.toBeNull();
        });

        it('should handle component unmounting gracefully', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="content"/>
                    {children}
                </div>
            ));

            const {unmount} = render(
                <Component>
                    <Template slot="content">
                        <span>Will unmount</span>
                    </Template>
                </Component>
            );

            expect(screen.getByText('Will unmount')).not.toBeNull();

            expect(() => unmount()).not.toThrow();
        });
    });

    describe('Nested components and context isolation', () => {
        it('should handle nested slot components correctly', () => {
            const InnerComponent = hasSlots(({children}: PropsWithChildren) => (
                <div className="inner">
                    <Slot name="inner-slot"/>
                    {children}
                </div>
            ));

            const OuterComponent = hasSlots(({children}: PropsWithChildren) => (
                <div className="outer">
                    <Slot name="outer-slot"/>
                    <InnerComponent>
                        <Template slot="inner-slot">
                            <span>Inner content</span>
                        </Template>
                    </InnerComponent>
                    {children}
                </div>
            ));

            render(
                <OuterComponent>
                    <Template slot="outer-slot">
                        <span>Outer content</span>
                    </Template>
                </OuterComponent>
            );

            expect(screen.getByText('Outer content')).not.toBeNull();
            expect(screen.getByText('Inner content')).not.toBeNull();
        });

        it('should isolate slot contexts between different hasSlots components', () => {
            const ComponentA = hasSlots(({children}: PropsWithChildren) => (
                <div data-testid="component-a">
                    <Slot name="shared" fallback={<span>A fallback</span>}/>
                    {children}
                </div>
            ));

            const ComponentB = hasSlots(({children}: PropsWithChildren) => (
                <div data-testid="component-b">
                    <Slot name="shared" fallback={<span>B fallback</span>}/>
                    {children}
                </div>
            ));

            render(
                <div>
                    <ComponentA>
                        <Template slot="shared">
                            <span>A content</span>
                        </Template>
                    </ComponentA>
                    <ComponentB>
                        {/* No template for ComponentB */}
                    </ComponentB>
                </div>
            );

            expect(screen.getByText('A content')).not.toBeNull();
            expect(screen.getByText('B fallback')).not.toBeNull();
            expect(screen.queryByText('A fallback')).toBeNull();
        });
    });

    describe('Complex template content', () => {
        it('should handle templates with event handlers', () => {
            const clickHandler = vi.fn();

            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="interactive"/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="interactive">
                        <button onClick={clickHandler}>Click me</button>
                    </Template>
                </Component>
            );

            const button = screen.getByText('Click me');
            expect(button).not.toBeNull();

            act(() => {
                button.click();
            });

            expect(clickHandler).toHaveBeenCalledTimes(1);
        });

        it('should handle templates with stateful components', () => {
            const StatefulTemplate = () => {
                const [count, setCount] = useState(0);
                return (
                    <div>
                        <span>Count: {count}</span>
                        <button onClick={() => setCount(c => c + 1)}>Increment</button>
                    </div>
                );
            };

            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="stateful"/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="stateful">
                        <StatefulTemplate/>
                    </Template>
                </Component>
            );

            expect(screen.getByText('Count: 0')).not.toBeNull();

            act(() => {
                screen.getByText('Increment').click();
            });

            expect(screen.getByText('Count: 1')).not.toBeNull();
        });

        it('should handle templates with fragments', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="fragment"/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="fragment">
                        <>
                            <span>First</span>
                            <span>Second</span>
                            <span>Third</span>
                        </>
                    </Template>
                </Component>
            );

            expect(screen.getByText('First')).not.toBeNull();
            expect(screen.getByText('Second')).not.toBeNull();
            expect(screen.getByText('Third')).not.toBeNull();
        });
    });

    describe('Error boundaries and edge cases', () => {
        it('should handle templates with undefined content', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="maybe" fallback={<span>Fallback</span>}/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="maybe">
                        {undefined}
                    </Template>
                </Component>
            );

            // undefined should still override fallback
            expect(screen.queryByText('Fallback')).toBeNull();
        });

        it('should handle multiple templates with same slot name', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="duplicate"/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="duplicate">
                        <span>First duplicate</span>
                    </Template>
                    <div>Some other content</div>
                    <Template slot="duplicate">
                        <span>Second duplicate</span>
                    </Template>
                    <Template slot="duplicate">
                        <span>Third duplicate</span>
                    </Template>
                </Component>
            );

            // Last template should win
            expect(screen.queryByText('First duplicate')).toBeNull();
            expect(screen.queryByText('Second duplicate')).toBeNull();
            expect(screen.getByText('Third duplicate')).not.toBeNull();
        });

        it('should work with deeply nested template structures', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="deep"/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <Template slot="deep">
                        <div>
                            <div>
                                <div>
                                    <div>
                                        <span>Deep content</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Template>
                </Component>
            );

            expect(screen.getByText('Deep content')).not.toBeNull();
        });
    });
});
