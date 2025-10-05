import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import React, {type PropsWithChildren} from 'react';
import {hasSlots, Slot, Template} from '../src';

describe('React Slot System - Requirements Validation', () => {

    describe('Children prop requirement', () => {
        it('should work correctly when component has children prop and renders {children}', () => {
            // ✅ CORRECT - Has children prop and renders {children}
            const CorrectComponent = hasSlots(({title, children}: PropsWithChildren<{
                title: string
            }>) => (
                <div>
                    <h1>{title}</h1>
                    <Slot name="header"/>
                    {children} {/* This is REQUIRED */}
                    <Slot name="footer"/>
                </div>
            ));

            render(
                <CorrectComponent title="Test Title">
                    <Template slot="header">
                        <span>Header content</span>
                    </Template>
                    <Template slot="footer">
                        <span>Footer content</span>
                    </Template>
                </CorrectComponent>
            );

            expect(screen.getByText('Test Title')).not.toBeNull();
            expect(screen.getByText('Header content')).not.toBeNull();
            expect(screen.getByText('Footer content')).not.toBeNull();
        });

        it('should document why components need children prop', () => {
            // ❌ This pattern would cause TypeScript errors in real usage:
            // const ComponentWithoutChildren = hasSlots(({ title }: { title: string }) => ...)
            //
            // TypeScript will show error:
            // "Argument of type '({ title }: { title: string }) => JSX.Element' is not assignable
            //  to parameter of type 'FC<{ children?: ReactNode; }>'"
            //
            // This is intentional - hasSlots requires components that accept children

            // Instead, you must use PropsWithChildren:
            const ComponentWithChildren = hasSlots(({title, children}: PropsWithChildren<{
                title: string
            }>) => (
                <div>
                    <h1>{title}</h1>
                    <Slot name="header"/>
                    {children}
                </div>
            ));

            render(
                <ComponentWithChildren title="Test">
                    <Template slot="header">
                        <span>Works correctly</span>
                    </Template>
                </ComponentWithChildren>
            );

            expect(screen.getByText('Test')).not.toBeNull();
            expect(screen.getByText('Works correctly')).not.toBeNull();
        });

        it('should not work when component has children prop but does not render {children}', () => {
            // ❌ WRONG - Has children prop but doesn't render {children}
            const ComponentNotRenderingChildren = hasSlots(({title}: PropsWithChildren<{
                title: string
            }>) => (
                <div>
                    <h1>{title}</h1>
                    <Slot name="header"/>
                    {/* children is received but not rendered - Templates won't work! */}
                </div>
            ));

            render(
                <ComponentNotRenderingChildren title="Test Title">
                    <Template slot="header">
                        <span>This will not appear</span>
                    </Template>
                </ComponentNotRenderingChildren>
            );

            expect(screen.getByText('Test Title')).not.toBeNull();
            // Template content won't appear because {children} is not rendered
            expect(screen.queryByText('This will not appear')).toBeNull();
        });

        it('should work with children even if no templates are provided', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="optional" fallback={<span>No template</span>}/>
                    {children}
                </div>
            ));

            render(
                <Component>
                    <p>Regular children content</p>
                </Component>
            );

            expect(screen.getByText('No template')).not.toBeNull();
            expect(screen.getByText('Regular children content')).not.toBeNull();
        });

        it('should work with mixed children and templates', () => {
            const Component = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="header"/>
                    <div className="content">
                        {children}
                    </div>
                    <Slot name="footer"/>
                </div>
            ));

            render(
                <Component>
                    <Template slot="header">
                        <h1>Template Header</h1>
                    </Template>

                    <p>Regular child 1</p>
                    <p>Regular child 2</p>

                    <Template slot="footer">
                        <footer>Template Footer</footer>
                    </Template>
                </Component>
            );

            expect(screen.getByText('Template Header')).not.toBeNull();
            expect(screen.getByText('Regular child 1')).not.toBeNull();
            expect(screen.getByText('Regular child 2')).not.toBeNull();
            expect(screen.getByText('Template Footer')).not.toBeNull();
        });
    });

    describe('Requirements documentation examples', () => {
        it('should demonstrate the correct pattern from README', () => {
            // This matches the ✅ CORRECT example in the README
            const MyComponent = hasSlots(({title, children}: PropsWithChildren<{
                title: string
            }>) => (
                <div>
                    <h1>{title}</h1>
                    <Slot name="header"/>
                    {children} {/* This is REQUIRED */}
                    <Slot name="footer"/>
                </div>
            ));

            render(
                <MyComponent title="Example Title">
                    <Template slot="header">
                        <nav>Navigation</nav>
                    </Template>
                    <p>Main content</p>
                    <Template slot="footer">
                        <p>Footer</p>
                    </Template>
                </MyComponent>
            );

            expect(screen.getByText('Example Title')).not.toBeNull();
            expect(screen.getByText('Navigation')).not.toBeNull();
            expect(screen.getByText('Main content')).not.toBeNull();
            expect(screen.getByText('Footer')).not.toBeNull();
        });

        it('should show why the broken pattern from README fails', () => {
            // The ❌ WRONG example from README would cause TypeScript errors:
            // const BrokenComponent = hasSlots(({ title }: { title: string }) => ...)
            //
            // TypeScript prevents this pattern, forcing you to use the correct approach:

            const CorrectComponent = hasSlots(({title, children}: PropsWithChildren<{
                title: string
            }>) => (
                <div>
                    <h1>{title}</h1>
                    <Slot name="header"/>
                    {children} {/* This is REQUIRED */}
                </div>
            ));

            render(
                <CorrectComponent title="Correct Example">
                    <Template slot="header">
                        <nav>This works!</nav>
                    </Template>
                </CorrectComponent>
            );

            expect(screen.getByText('Correct Example')).not.toBeNull();
            expect(screen.getByText('This works!')).not.toBeNull();
            // TypeScript ensures components follow the correct pattern
        });
    });

    describe('Component patterns that work', () => {

        it('should work with wrapped children rendering', () => {
            const WrappedComponent = hasSlots(({children}: PropsWithChildren) => (
                <div>
                    <Slot name="header"/>
                    <main className="content-wrapper">
                        <div className="inner-wrapper">
                            {children}
                        </div>
                    </main>
                    <Slot name="footer"/>
                </div>
            ));

            render(
                <WrappedComponent>
                    <Template slot="header">
                        <h1>Wrapped Header</h1>
                    </Template>
                    <p>Wrapped content</p>
                </WrappedComponent>
            );

            expect(screen.getByText('Wrapped Header')).not.toBeNull();
            expect(screen.getByText('Wrapped content')).not.toBeNull();
        });
    });
});
